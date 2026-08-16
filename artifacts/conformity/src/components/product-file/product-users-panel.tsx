import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useListProductUsers,
  getListProductUsersQueryKey,
  useCreateProductUser,
  useDeleteProductUser,
  useListUserNotifications,
  getListUserNotificationsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Users, Plus, Trash2, Megaphone } from "lucide-react";

/**
 * The Art. 14(8) product-user register (task 10.2), in the product file.
 * Facts are recorded as stated: a user's version or contact stays absent
 * until known, and absence renders as absence — an absent version means an
 * advisory match cannot rule that user out. The notifications list is the
 * record of the ORGANISATION'S own informing acts (recorded, not sent).
 */
export function ProductUsersPanel({ productId }: { productId: number }) {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", deployedVersion: "", notes: "" });

  const users = useListProductUsers(productId, {
    query: { queryKey: getListProductUsersQueryKey(productId) },
  });
  const notifications = useListUserNotifications(productId, {
    query: { queryKey: getListUserNotificationsQueryKey(productId) },
  });

  const create = useCreateProductUser({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("User registered");
        setAddOpen(false);
        setForm({ name: "", contact: "", deployedVersion: "", notes: "" });
      },
      onError: (e: any) => toast.error(e.message || "Could not register the user"),
    },
  });
  const remove = useDeleteProductUser({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("User removed from the register");
      },
      onError: (e: any) => toast.error(e.message || "Could not remove the user"),
    },
  });

  const rows = users.data?.users ?? [];
  const acts = notifications.data?.notifications ?? [];

  return (
    <Card className="rounded-2xl border border-border shadow-sm" data-testid="product-users-panel">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Product users — Art. 14(8)
            </CardTitle>
            <CardDescription className="text-xs max-w-2xl">
              Who uses this product, as recorded. After awareness of an actively exploited
              vulnerability or severe incident, the manufacturer informs the impacted users —
              an advisory's impacted set derives from this register, and a user with no
              recorded version can never be ruled out.
            </CardDescription>
          </div>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setAddOpen(true)} data-testid="product-user-add">
            <Plus className="h-3.5 w-3.5" /> Register user
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {users.isLoading ? (
          <Skeleton className="h-16 w-full rounded-xl" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No users are registered. An empty register does not mean the product has no
            users — it means the impacted set of any advisory is unknown.
          </p>
        ) : (
          <ul className="space-y-2">
            {rows.map((u) => (
              <li key={u.id} className="rounded-xl border border-border/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground">{u.name}</span>
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                    {u.deployedVersion ? `v${u.deployedVersion}` : "version not recorded"}
                  </span>
                  {u.contact && (
                    <span className="ml-2 text-xs text-muted-foreground truncate">{u.contact}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-muted-foreground">by {u.registeredBy}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    aria-label={`Remove ${u.name}`}
                    disabled={remove.isPending}
                    onClick={() => remove.mutate({ id: u.id })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Megaphone className="h-4 w-4 text-primary" /> Notifications recorded
          </div>
          {notifications.isLoading ? (
            <Skeleton className="h-10 w-full rounded-xl" />
          ) : acts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No user notification has been recorded for this product. Recording happens
              from an advisory's impacted-users view on Incidents.
            </p>
          ) : (
            <ul className="space-y-2">
              {acts.map((n) => (
                <li key={n.id} className="rounded-xl border border-border/70 px-4 py-2.5 text-xs space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {n.scope === "all_users" ? "all users" : "impacted users"}
                    </Badge>
                    <span className="text-muted-foreground">
                      stated {formatDate(n.statedAt)} · via {n.method}
                    </span>
                    {n.machineReadableFormat && (
                      <Badge variant="outline" className="font-mono text-[10px]">{n.machineReadableFormat}</Badge>
                    )}
                  </div>
                  {n.measuresSummary && <p className="text-foreground/85">{n.measuresSummary}</p>}
                  <p className="text-[10px] font-mono text-muted-foreground">recorded by {n.recordedBy}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Register a product user</DialogTitle>
            <DialogDescription className="text-xs">
              Record only what is known — contact and version stay absent until they are,
              and an absent version means an advisory can never rule this user out.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1 text-xs">
            <div className="space-y-1">
              <Label htmlFor="pu-name">Name *</Label>
              <Input id="pu-name" className="h-8 text-xs" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="pu-version">Deployed version (if known)</Label>
                <Input id="pu-version" className="h-8 text-xs font-mono" value={form.deployedVersion}
                  onChange={(e) => setForm({ ...form, deployedVersion: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pu-contact">Contact (if known)</Label>
                <Input id="pu-contact" className="h-8 text-xs" value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="pu-notes">Notes</Label>
              <Input id="pu-notes" className="h-8 text-xs" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={create.isPending || !form.name.trim()}
              data-testid="product-user-confirm"
              onClick={() =>
                create.mutate({
                  id: productId,
                  data: {
                    name: form.name.trim(),
                    contact: form.contact.trim(),
                    deployedVersion: form.deployedVersion.trim(),
                    notes: form.notes.trim(),
                  },
                })
              }
            >
              Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
