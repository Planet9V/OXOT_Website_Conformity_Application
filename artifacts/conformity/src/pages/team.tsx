import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetAdminSession,
  useListTeamMembers,
  useCreateTeamMember,
  useUpdateTeamMember,
  useListWorkspaceActivity,
  listWorkspaceActivity,
  getListTeamMembersQueryKey,
  type TeamMember,
  type ConformityActivityEntry,
} from "@workspace/api-client-react";
import {
  Users,
  Plus,
  Pencil,
  ShieldOff,
  ShieldCheck,
  History,
  Mail,
  Phone,
  Briefcase,
  Building,
  Key,
  Copy,
  UserCheck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/conformity";

function errMsg(e: unknown): string {
  return e instanceof Error && e.message ? e.message : "Something went wrong";
}

function CreateMemberDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("Password123!");
  const [position, setPosition] = useState("CRA Compliance Officer");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("+31 (0)20 555 0199");
  const [department, setDepartment] = useState("Cybersecurity & Product Compliance");
  const [organization, setOrganization] = useState("OXOT Engineering B.V.");
  const [roleResponsibility, setRoleResponsibility] = useState("Lead Assessor & PSIRT Coordinator");

  const create = useCreateTeamMember({
    mutation: {
      onSuccess: (m) => {
        qc.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
        toast.success(`${m.displayName} can now sign in as "${m.username}"`);
        setDisplayName("");
        setUsername("");
        setPassword("Password123!");
        onOpenChange(false);
      },
      onError: (e) => toast.error(errMsg(e)),
    },
  });

  const valid = displayName.trim().length > 0 && username.trim().length >= 3 && password.length >= 6;

  const handleSubmit = () => {
    create.mutate({
      data: {
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        password,
        position,
        email: email || `${username.trim().toLowerCase()}@oxot.eu`,
        telephone,
        department,
        organization,
        roleResponsibility,
      } as any,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Add New Team Member Account
          </DialogTitle>
          <DialogDescription>
            Provision an assessor profile with contact details, organization role, and login password.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 text-xs">
          <div className="space-y-1">
            <Label htmlFor="member-name">Full Name *</Label>
            <Input
              id="member-name"
              className="h-8 text-xs"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Priya Shah"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="member-username">Username *</Label>
            <Input
              id="member-username"
              className="h-8 text-xs font-mono"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (!email) setEmail(`${e.target.value.toLowerCase()}@oxot.eu`);
              }}
              placeholder="e.g. priya.shah"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="member-position">Position / Job Title</Label>
            <Input
              id="member-position"
              className="h-8 text-xs"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Chief Security Officer"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="member-email">Email Address</Label>
            <Input
              id="member-email"
              type="email"
              className="h-8 text-xs font-mono"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya.shah@oxot.eu"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="member-telephone">Telephone Number</Label>
            <Input
              id="member-telephone"
              className="h-8 text-xs font-mono"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+31 (0)20 555 0199"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="member-dept">Department</Label>
            <Input
              id="member-dept"
              className="h-8 text-xs"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Cybersecurity &amp; Product Compliance"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="member-org">Organization / Company</Label>
            <Input
              id="member-org"
              className="h-8 text-xs"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="OXOT Engineering B.V."
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="member-role">Role Responsibility &amp; Mandate</Label>
            <Input
              id="member-role"
              className="h-8 text-xs"
              value={roleResponsibility}
              onChange={(e) => setRoleResponsibility(e.target.value)}
              placeholder="e.g. CRA Article 14 Lead Assessor &amp; PSIRT Incident Commander"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="member-password">Login Password (Demo Generic Default)</Label>
            <Input
              id="member-password"
              type="text"
              className="h-8 text-xs font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password123!"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!valid || create.isPending}
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground font-bold text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Team Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditMemberDialog({
  member,
  open,
  onOpenChange,
}: {
  member: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState(member.displayName || "");
  const [position, setPosition] = useState(member.position || "CRA Compliance Officer");
  const [email, setEmail] = useState(member.email || `${member.username}@oxot.eu`);
  const [telephone, setTelephone] = useState(member.telephone || "+31 (0)20 555 0199");
  const [department, setDepartment] = useState(member.department || "Cybersecurity & Product Compliance");
  const [organization, setOrganization] = useState(member.organization || "OXOT Engineering B.V.");
  const [roleResponsibility, setRoleResponsibility] = useState(member.roleResponsibility || "Lead Assessor & PSIRT Coordinator");
  const [password, setPassword] = useState(member.plainPassword || "Password123!");

  const update = useUpdateTeamMember({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
        toast.success("Updated team member profile");
        onOpenChange(false);
      },
      onError: (e) => toast.error(errMsg(e)),
    },
  });

  const handleSave = () => {
    update.mutate({
      id: member.id,
      data: {
        displayName: displayName.trim(),
        position,
        email,
        telephone,
        department,
        organization,
        roleResponsibility,
        ...(password ? { password } : {}),
      } as any,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" /> Edit Profile: {member.displayName}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Username @{member.username} (Immutable ledger identifier)
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 text-xs">
          <div className="space-y-1">
            <Label>Full Name</Label>
            <Input className="h-8 text-xs" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Position / Job Title</Label>
            <Input className="h-8 text-xs" value={position} onChange={(e) => setPosition(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Email Address</Label>
            <Input className="h-8 text-xs font-mono" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Telephone Number</Label>
            <Input className="h-8 text-xs font-mono" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Department</Label>
            <Input className="h-8 text-xs" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Organization</Label>
            <Input className="h-8 text-xs" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label>Role Responsibility &amp; Mandate</Label>
            <Input className="h-8 text-xs" value={roleResponsibility} onChange={(e) => setRoleResponsibility(e.target.value)} />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label>Update Password</Label>
            <Input className="h-8 text-xs font-mono" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={update.isPending} className="bg-primary font-bold text-xs">
            Save Profile Updates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActiveToggle({ member }: { member: any }) {
  const qc = useQueryClient();
  const update = useUpdateTeamMember({
    mutation: {
      onSuccess: (m) => {
        qc.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
        toast.success(m.active ? `${m.displayName} reactivated` : `${m.displayName} deactivated`);
      },
      onError: (e) => toast.error(errMsg(e)),
    },
  });

  if (!member.active) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs rounded-md border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
        disabled={update.isPending}
        onClick={() => update.mutate({ id: member.id, data: { active: true } })}
      >
        <ShieldCheck className="w-3 h-3 mr-1" /> Reactivate
      </Button>
    );
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs rounded-md text-destructive hover:text-destructive"
        >
          <ShieldOff className="w-3 h-3 mr-1" /> Deactivate
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate {member.displayName}?</AlertDialogTitle>
          <AlertDialogDescription>
            They are signed out immediately and can no longer sign in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => update.mutate({ id: member.id, data: { active: false } })}>
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function MemberRow({ member }: { member: any }) {
  const [editOpen, setEditOpen] = useState(false);

  const copyPassword = (pwd: string) => {
    navigator.clipboard.writeText(pwd || "Password123!");
    toast.success("Copied password to clipboard!");
  };

  return (
    <TableRow className={member.active ? "" : "opacity-60"}>
      <TableCell className="p-3">
        <div className="font-bold text-foreground">{member.displayName}</div>
        <div className="text-[11px] text-muted-foreground font-mono">@{member.username}</div>
      </TableCell>

      <TableCell className="p-3">
        <div className="font-semibold text-foreground text-xs">{member.position || "CRA Compliance Officer"}</div>
        <div className="text-[11px] text-muted-foreground">{member.department || "Cybersecurity"}</div>
      </TableCell>

      <TableCell className="p-3 font-mono text-xs">
        <div className="text-foreground flex items-center gap-1">
          <Mail className="h-3 w-3 text-muted-foreground" /> {member.email || `${member.username}@oxot.eu`}
        </div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Phone className="h-3 w-3 text-muted-foreground" /> {member.telephone || "+31 (0)20 555 0199"}
        </div>
      </TableCell>

      <TableCell className="p-3 text-xs">
        <div className="font-medium text-foreground">{member.organization || "OXOT Engineering B.V."}</div>
        <div className="text-[11px] text-muted-foreground truncate max-w-[160px]" title={member.roleResponsibility}>
          {member.roleResponsibility || "Lead Assessor"}
        </div>
      </TableCell>

      <TableCell className="p-3">
        <button
          type="button"
          onClick={() => copyPassword(member.plainPassword)}
          className="flex items-center gap-1 font-mono text-[11px] bg-muted/60 hover:bg-muted px-2 py-1 rounded border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
          title="Click to copy demo password"
        >
          <Lock className="h-3 w-3 text-amber-400 shrink-0" />
          <span>{member.plainPassword || "Password123!"}</span>
          <Copy className="h-2.5 w-2.5 shrink-0" />
        </button>
      </TableCell>

      <TableCell className="p-3">
        <Badge
          variant="outline"
          className={
            member.active
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
              : "bg-muted text-muted-foreground text-[10px]"
          }
        >
          {member.active ? "Active" : "Deactivated"}
        </Badge>
      </TableCell>

      <TableCell className="p-3 text-right space-x-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs rounded-md"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="w-3 h-3 mr-1" /> Edit
        </Button>
        <ActiveToggle member={member} />
        {editOpen && <EditMemberDialog member={member} open={editOpen} onOpenChange={setEditOpen} />}
      </TableCell>
    </TableRow>
  );
}

function WorkspaceActivityCard() {
  const { data: firstPage, isLoading, isError } = useListWorkspaceActivity({
    limit: 20,
    offset: 0,
  });
  const [olderEntries, setOlderEntries] = useState<ConformityActivityEntry[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const entries = [...(firstPage?.entries ?? []), ...olderEntries];
  const total = firstPage?.total ?? 0;
  const hasMore = !isLoading && !isError && entries.length < total;

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await listWorkspaceActivity({
        limit: 20,
        offset: entries.length,
      });
      setOlderEntries((prev) => {
        const seen = new Set([
          ...(firstPage?.entries ?? []).map((e) => e.id),
          ...prev.map((e) => e.id),
        ]);
        return [...prev, ...page.entries.filter((e) => !seen.has(e.id))];
      });
    } catch {
      toast.error("Couldn't load older activity. Try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className="space-y-3 pt-4">
      <div>
        <h2 className="font-serif text-xl font-normal tracking-tight text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-primary" /> Workspace Activity Audit Trail
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Immutable ledger of product assessments, member credentials, and statutory decisions.
        </p>
      </div>

      <Card className="rounded-2xl border border-border">
        <CardContent className="p-0">
          <ul className="divide-y divide-border text-xs font-mono">
            {entries.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
                <div className="min-w-0">
                  <span className="font-medium text-foreground">{e.summary}</span>{" "}
                  <span className="text-muted-foreground">by {e.actorDisplay ?? "System"}</span>
                </div>
                <time className="text-muted-foreground">{formatDateTime(e.createdAt)}</time>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}

export default function Team() {
  const { data: members, isLoading, isError } = useListTeamMembers();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary" /> Assessor Team &amp; Credentials Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl font-sans">
            Named assessor accounts, organizational responsibilities, contact details, and authentication passwords. All team members can sign in and be assigned PSIRT incident blocks or CRA gap remediations.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg shadow-sm cta-lift shrink-0" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Team Member
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : (
        <Card className="rounded-3xl border border-border shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <tr className="border-b bg-muted/80 text-muted-foreground font-mono font-bold text-xs">
                <th className="p-3">Assessor Name</th>
                <th className="p-3">Position &amp; Dept</th>
                <th className="p-3">Email &amp; Telephone</th>
                <th className="p-3">Organization &amp; Mandate</th>
                <th className="p-3">Demo Password</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </TableHeader>
            <TableBody>
              {(members ?? []).map((m: any) => (
                <MemberRow key={m.id} member={m} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <CreateMemberDialog open={createOpen} onOpenChange={setCreateOpen} />

      <WorkspaceActivityCard />
    </div>
  );
}
