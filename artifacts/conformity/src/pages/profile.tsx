import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetAdminSession,
  useGetMyProfile,
  useUpdateMyProfile,
  useChangeMyPassword,
  getGetMyProfileQueryKey,
} from "@workspace/api-client-react";
import { UserCircle, KeyRound, ShieldCheck, Compass, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/conformity";

/**
 * Your account: identity (as it reads in the audit trail), security, and —
 * for members who haven't finished it — a way back into first-login
 * onboarding. Renders for every role; only named members can edit anything
 * (admin/demo identities are env-configured, and demo is read-only anyway).
 */

function errMsg(e: unknown): string {
  return e instanceof Error && e.message ? e.message : "Something went wrong";
}

function roleLabel(role: string | null | undefined): string {
  if (role === "admin") return "Administrator";
  if (role === "demo") return "Demo user";
  return "Assessor";
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { data: session } = useGetAdminSession();
  const { data: profile, isLoading } = useGetMyProfile({
    query: { enabled: Boolean(session?.authenticated), queryKey: getGetMyProfileQueryKey() },
  });

  const isMember = profile?.role === "member";
  const isDemo = profile?.role === "demo";

  const [name, setName] = useState("");
  const [nameSynced, setNameSynced] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && !nameSynced) {
      setName(profile.displayName ?? "");
      setNameSynced(true);
    }
  }, [profile, nameSynced]);

  const updateProfile = useUpdateMyProfile();
  const changePassword = useChangeMyPassword();

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const nameDirty = isMember && name.trim() !== (profile.displayName ?? "") && name.trim() !== "";

  const saveName = () => {
    updateProfile.mutate(
      { data: { displayName: name.trim() } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
          toast.success(
            "Display name updated. The audit trail and assignments use it immediately; the header label refreshes on your next sign-in.",
          );
        },
        onError: (e) => toast.error(errMsg(e)),
      },
    );
  };

  const submitPassword = () => {
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords don't match.");
      return;
    }
    changePassword.mutate(
      { data: { currentPassword, newPassword } },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          toast.success("Password updated.");
        },
        onError: (e) => setPasswordError(errMsg(e)),
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6" data-testid="profile-page">
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">ASSESSOR ACCOUNT &amp; AUDIT IDENTITY</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">Your Account</h1>
        <p className="text-sm text-muted-foreground mt-1 font-sans">
          How you appear in the audit trail, and how you sign in.
        </p>
      </div>

      {isMember && profile.needsOnboarding && (
        <Card className="rounded-md border-primary/40 bg-primary/5" data-testid="profile-onboarding-card">
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 pt-6">
            <Compass className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium">Finish setting up your account</div>
              <p className="text-xs text-muted-foreground">
                A two-minute walkthrough: confirm your name, set your own password, and see where
                the work lives.
              </p>
            </div>
            <Button size="sm" onClick={() => setLocation("/onboarding")} data-testid="profile-resume-onboarding">
              Resume setup
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-md" data-testid="profile-identity-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-primary" />
            <CardTitle>Identity</CardTitle>
          </div>
          <CardDescription>
            {isMember
              ? "Your display name is how evidence, gap calls and ledger entries are attributed."
              : isDemo
                ? "The demo account is shared and read-only — nothing here can be changed."
                : "The admin identity is configured via environment settings and can't be edited here."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isMember ? (
            <div className="space-y-1.5">
              <Label htmlFor="profile-display-name">Display name</Label>
              <div className="flex gap-2">
                <Input
                  id="profile-display-name"
                  className="rounded-md"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  data-testid="profile-display-name"
                />
                <Button
                  onClick={saveName}
                  disabled={!nameDirty || updateProfile.isPending}
                  data-testid="profile-save-name"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-1.5">
              <div className="text-xs text-muted-foreground">Display name</div>
              <div className="text-sm font-medium">
                {profile.displayName ?? roleLabel(profile.role)}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Username</div>
              <div className="text-sm font-mono" data-testid="profile-username">{profile.username}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Role</div>
              <Badge variant="secondary" data-testid="profile-role">{roleLabel(profile.role)}</Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Member since</div>
              <div className="text-sm" data-testid="profile-member-since">
                {profile.memberSince ? formatDateTime(profile.memberSince) : "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md" data-testid="profile-security-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            {isMember
              ? "Change the password you sign in with. Sessions on other devices keep working until they expire."
              : isDemo
                ? "The demo password is public by design — it's printed on the demo sign-in page."
                : "Admin credentials are managed via environment settings, not from this page."}
          </CardDescription>
        </CardHeader>
        {isMember ? (
          <CardContent>
            <form
              className="space-y-4 max-w-md"
              onSubmit={(e) => {
                e.preventDefault();
                submitPassword();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="profile-current-password">Current password</Label>
                <Input
                  id="profile-current-password"
                  type="password"
                  className="rounded-md"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  data-testid="profile-current-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-new-password">New password</Label>
                <Input
                  id="profile-new-password"
                  type="password"
                  className="rounded-md"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  data-testid="profile-new-password"
                />
                <p className="text-xs text-muted-foreground">At least 8 characters.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-confirm-password">Confirm new password</Label>
                <Input
                  id="profile-confirm-password"
                  type="password"
                  className="rounded-md"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  data-testid="profile-confirm-password"
                />
              </div>
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              <Button
                type="submit"
                disabled={
                  changePassword.isPending || !currentPassword || !newPassword || !confirmPassword
                }
                data-testid="profile-change-password"
              >
                <ShieldCheck className="w-4 h-4 mr-2" /> Update password
              </Button>
            </form>
          </CardContent>
        ) : (
          <CardContent>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <span data-testid="profile-security-note">
                {isDemo
                  ? "Password changes are disabled for the shared demo workspace."
                  : "Set ADMIN_USERNAME / ADMIN_PASSWORD in the environment to rotate admin credentials."}
              </span>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
