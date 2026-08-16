import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetAdvisoryImpactedUsers,
  getGetAdvisoryImpactedUsersQueryKey,
  useRecordUserNotification,
} from "@workspace/api-client-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

/**
 * Art. 14(8) impacted-users view for one advisory (task 10.2): the tri-state
 * split with its derivation rule shown VERBATIM from the server — the split
 * is never presented as more certain than the data supports. Recording a
 * notification records the ORGANISATION'S OWN act; nothing is transmitted.
 */
export function ImpactedUsersDialog({
  advisoryId,
  productId,
  open,
  onClose,
}: {
  advisoryId: number;
  productId: number;
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const impacted = useGetAdvisoryImpactedUsers(advisoryId, {
    query: { queryKey: getGetAdvisoryImpactedUsersQueryKey(advisoryId), enabled: open },
  });
  const [recording, setRecording] = useState(false);
  const [form, setForm] = useState({
    scope: "impacted_users" as "impacted_users" | "all_users",
    statedAt: "",
    method: "",
    measuresSummary: "",
    machineReadableFormat: "",
  });

  const record = useRecordUserNotification({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Notification recorded (the organisation's stated act)");
        setRecording(false);
        onClose();
      },
      onError: (e: any) => toast.error(e.message || "Could not record the notification"),
    },
  });

  const data = impacted.data;
  const section = (label: string, tone: string, users: any[]) => (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`font-mono text-[10px] ${tone}`}>{label}</Badge>
        <span className="text-xs text-muted-foreground">{users.length}</span>
      </div>
      {users.length > 0 && (
        <ul className="text-xs text-foreground/85 pl-1 space-y-0.5">
          {users.map((u) => (
            <li key={u.id}>
              {u.name}
              {u.deployedVersion ? (
                <span className="font-mono text-muted-foreground"> · v{u.deployedVersion}</span>
              ) : (
                <span className="text-muted-foreground"> · version not recorded</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl max-w-lg" data-testid="impacted-users-dialog">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Impacted users — Art. 14(8)
          </DialogTitle>
          <DialogDescription className="text-xs">
            {data?.rule ?? "Deriving from the product-user register…"}
          </DialogDescription>
        </DialogHeader>
        {impacted.isLoading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : data ? (
          <div className="space-y-3 text-sm">
            {section("impacted", "bg-destructive/10 text-destructive border-destructive/30", data.impacted)}
            {section("cannot be ruled out", "bg-amber-500/10 text-amber-500 border-amber-500/30", data.versionNotRecorded)}
            {section("verify manually", "bg-muted text-muted-foreground", data.noRecordedMatch)}
            {data.impacted.length + data.versionNotRecorded.length + data.noRecordedMatch.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No users are registered for this product yet — the register lives in the
                product file. An empty register means this view can say nothing.
              </p>
            )}
          </div>
        ) : null}

        {!recording ? (
          <Button size="sm" className="text-xs" onClick={() => setRecording(true)} data-testid="record-notification-open">
            Record that users were informed
          </Button>
        ) : (
          <div className="space-y-2 border-t border-border pt-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Scope</Label>
                <select
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                  value={form.scope}
                  onChange={(e) => setForm({ ...form, scope: e.target.value as any })}
                >
                  <option value="impacted_users">Impacted users</option>
                  <option value="all_users">All users</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>When (your statement)</Label>
                <Input type="datetime-local" className="h-8 text-xs" value={form.statedAt}
                  onChange={(e) => setForm({ ...form, statedAt: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>How (method)</Label>
              <Input className="h-8 text-xs" placeholder="e.g. e-mail to registered contacts"
                value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Measures communicated</Label>
              <Textarea className="text-xs min-h-16" value={form.measuresSummary}
                onChange={(e) => setForm({ ...form, measuresSummary: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Machine-readable format used, if any</Label>
              <Input className="h-8 text-xs w-40" placeholder="e.g. CSAF"
                value={form.machineReadableFormat}
                onChange={(e) => setForm({ ...form, machineReadableFormat: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setRecording(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs"
                disabled={record.isPending || !form.statedAt || !form.method.trim()}
                data-testid="record-notification-confirm"
                onClick={() =>
                  record.mutate({
                    id: productId,
                    data: {
                      advisoryId,
                      scope: form.scope,
                      statedAt: new Date(form.statedAt).toISOString(),
                      method: form.method.trim(),
                      measuresSummary: form.measuresSummary,
                      machineReadableFormat: form.machineReadableFormat.trim(),
                    },
                  })
                }
              >
                Record
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
