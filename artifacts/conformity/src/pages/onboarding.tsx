import { useEffect, useState } from "react";
import { useLocation, Redirect } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetAdminSession,
  useGetMyProfile,
  useUpdateMyProfile,
  useChangeMyPassword,
  useCompleteMyOnboarding,
  getGetMyProfileQueryKey,
  getGetAdminSessionQueryKey,
} from "@workspace/api-client-react";
import {
  ClipboardCheck,
  Compass,
  KeyRound,
  Search,
  ShieldCheck,
  UserCircle,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Kbd } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { markOnboardingSkipped } from "@/lib/onboarding";

/**
 * First-login onboarding for named assessors — welcome → secure the account →
 * find your way around. Full-bleed (outside the app shell) so the three steps
 * get the person's full attention, but always skippable: nothing here is a
 * hard wall, and the profile page can resume it later.
 *
 * Admin and demo sessions have nothing to onboard (env-configured accounts) —
 * they are bounced straight back to the command center.
 */

function errMsg(e: unknown): string {
  return e instanceof Error && e.message ? e.message : "Something went wrong";
}

const STEPS = ["Welcome", "Secure your account", "Find your way"] as const;

function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-0" aria-label="Onboarding progress">
      {STEPS.map((label, i) => {
        const state = i < step ? "done" : i === step ? "active" : "todo";
        return (
          <li key={label} className="flex items-center">
            {i > 0 && (
              <div
                className={cn(
                  "h-px w-8 sm:w-14 mx-2",
                  i <= step ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-mono transition-colors",
                  state === "done" && "border-primary bg-primary text-primary-foreground",
                  state === "active" && "border-primary text-primary",
                  state === "todo" && "border-border text-muted-foreground",
                )}
              >
                {state === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden sm:inline text-xs font-medium",
                  state === "active" ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { data: session, isLoading: sessionLoading } = useGetAdminSession();
  const isMember = session?.role === "member";
  const { data: profile, isLoading: profileLoading } = useGetMyProfile({
    query: { enabled: isMember, queryKey: getGetMyProfileQueryKey() },
  });

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [nameSynced, setNameSynced] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordDone, setPasswordDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && !nameSynced) {
      setName(profile.displayName ?? "");
      setNameSynced(true);
    }
  }, [profile, nameSynced]);

  const updateProfile = useUpdateMyProfile();
  const changePassword = useChangeMyPassword();
  const completeOnboarding = useCompleteMyOnboarding();

  // Nothing to onboard for admin/demo — env-configured accounts.
  if (!sessionLoading && session?.authenticated && !isMember) {
    return <Redirect to="/" />;
  }

  if (sessionLoading || (isMember && profileLoading)) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-8">
        <Skeleton className="h-96 w-full max-w-xl" />
      </div>
    );
  }

  // Already onboarded — nothing left to do here; manual revisits go home.
  // (Post-finish cache updates also land in this state harmlessly.)
  if (isMember && profile && !profile.needsOnboarding) {
    return <Redirect to="/" />;
  }

  const skipAll = () => {
    markOnboardingSkipped();
    setLocation("/");
  };

  const continueFromWelcome = () => {
    setFormError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Display name is required — it is how your work is attributed.");
      return;
    }
    if (profile && trimmed !== profile.displayName) {
      updateProfile.mutate(
        { data: { displayName: trimmed } },
        {
          onSuccess: () => {
            qc.invalidateQueries();
            setStep(1);
          },
          onError: (e) => setFormError(errMsg(e)),
        },
      );
      return;
    }
    setStep(1);
  };

  const submitPassword = () => {
    setFormError(null);
    if (newPassword.length < 8) {
      setFormError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("The new passwords don't match.");
      return;
    }
    changePassword.mutate(
      { data: { currentPassword, newPassword } },
      {
        onSuccess: () => {
          setPasswordDone(true);
          toast.success("Password updated — it's yours now.");
          setStep(2);
        },
        onError: (e) => setFormError(errMsg(e)),
      },
    );
  };

  const finish = () => {
    completeOnboarding.mutate(undefined, {
      onSuccess: (data) => {
        // Flip the caches deterministically BEFORE navigating, so the shell's
        // OnboardingRedirect can never read a stale needsOnboarding=true and
        // bounce us straight back here while the refetch is in flight.
        qc.setQueryData(
          getGetAdminSessionQueryKey(),
          (old: Record<string, unknown> | undefined) =>
            old ? { ...old, needsOnboarding: false } : old,
        );
        qc.setQueryData(getGetMyProfileQueryKey(), data);
        qc.invalidateQueries();
        toast.success("You're all set — welcome aboard.");
        setLocation("/");
      },
      onError: (e) => toast.error(errMsg(e)),
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col" data-testid="onboarding-page">
      <header className="w-full border-b border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg leading-none">O</span>
            </div>
            <div className="flex flex-col leading-none gap-0.5">
              <span className="font-display font-bold text-lg tracking-tight">OXOT</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Conformity</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={skipAll} data-testid="onboarding-skip">
            Skip for now
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14">
        <StepIndicator step={step} />

        <div className="w-full max-w-xl mt-8">
          {step === 0 && (
            <Card
              className="rounded-md border-t-4 border-t-primary motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
              data-testid="onboarding-step-welcome"
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-primary" />
                  <CardTitle>Welcome{profile?.displayName ? `, ${profile.displayName}` : ""}</CardTitle>
                </div>
                <CardDescription>
                  You have a named assessor account on this conformity workbench. Everything you
                  do — evidence, gap calls, incident updates — is attributed to you in the audit
                  trail, so first: how should your name read?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="onboarding-display-name">Display name</Label>
                  <Input
                    id="onboarding-display-name"
                    className="rounded-md"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={120}
                    data-testid="onboarding-display-name"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown on ledger entries and assignments. Your username stays{" "}
                    <span className="font-mono">{profile?.username}</span>.
                  </p>
                </div>
                {formError && <p className="text-sm text-destructive">{formError}</p>}
                <div className="flex justify-end">
                  <Button
                    onClick={continueFromWelcome}
                    disabled={updateProfile.isPending}
                    data-testid="onboarding-continue"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card
              className="rounded-md border-t-4 border-t-primary motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
              data-testid="onboarding-step-password"
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  <CardTitle>Secure your account</CardTitle>
                </div>
                <CardDescription>
                  Your administrator set your first password when they created this account.
                  Replace it with one only you know.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitPassword();
                  }}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="onboarding-current-password">Current password</Label>
                    <Input
                      id="onboarding-current-password"
                      type="password"
                      className="rounded-md"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                      data-testid="onboarding-current-password"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="onboarding-new-password">New password</Label>
                    <Input
                      id="onboarding-new-password"
                      type="password"
                      className="rounded-md"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      data-testid="onboarding-new-password"
                    />
                    <p className="text-xs text-muted-foreground">At least 8 characters.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="onboarding-confirm-password">Confirm new password</Label>
                    <Input
                      id="onboarding-confirm-password"
                      type="password"
                      className="rounded-md"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      data-testid="onboarding-confirm-password"
                    />
                  </div>
                  {formError && <p className="text-sm text-destructive">{formError}</p>}
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setFormError(null);
                        setStep(2);
                      }}
                      data-testid="onboarding-skip-password"
                    >
                      I'll do this later
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        changePassword.isPending || !currentPassword || !newPassword || !confirmPassword
                      }
                      data-testid="onboarding-set-password"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" /> Set my password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card
              className="rounded-md border-t-4 border-t-primary motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
              data-testid="onboarding-step-orient"
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  <CardTitle>Find your way around</CardTitle>
                </div>
                <CardDescription>
                  {passwordDone
                    ? "Account secured. Three things worth knowing before you start:"
                    : "Three things worth knowing before you start:"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 rounded-md border border-border p-3">
                  <ClipboardCheck className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Products is where the work lives</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Each product leads into its assessments — gap worklists, evidence, incident
                      clocks and documents. The command center ranks what needs you first.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border border-border p-3">
                  <Search className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <div className="text-sm font-medium">
                      Jump anywhere with <Kbd>⌘K</Kbd>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The command palette searches sections, products, regulations and requirements
                      from any page.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border border-border p-3">
                  <Compass className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Help is in the header</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The glossary explains statutory terms with citations, and "Take the tour"
                      walks the workbench whenever you want a refresher.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={finish}
                    disabled={completeOnboarding.isPending}
                    data-testid="onboarding-finish"
                  >
                    Finish setup <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <p className="mt-6 text-xs font-mono text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
      </main>
    </div>
  );
}
