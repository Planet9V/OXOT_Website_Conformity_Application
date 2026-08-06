import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetAdminSession, useAdminLogin } from "@workspace/api-client-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Lock } from "lucide-react";

export function AuthGate({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data: session, isLoading } = useGetAdminSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useAdminLogin({ mutation: { onSuccess: () => qc.invalidateQueries() } });

  if (isLoading) {
    return (
      <div className="p-8 max-w-md mx-auto w-full">
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (session?.authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="p-8 max-w-md mx-auto w-full min-h-screen flex flex-col justify-center">
      <Card className="rounded-md border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <CardTitle>Admin sign in</CardTitle>
          </div>
          <CardDescription>
            The conformity execution layer is restricted to administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="conformity-login"
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate({ data: { username, password } });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                className="rounded-md"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                className="rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {login.isError && (
              <p className="text-sm text-destructive">Invalid credentials. Please try again.</p>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="conformity-login"
            className="rounded-md w-full"
            disabled={login.isPending || !username || !password}
          >
            <Lock className="w-4 h-4 mr-2" /> Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
