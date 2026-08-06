import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminLogin, useGetAdminSession } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, PlayCircle, Check } from "lucide-react";

// The demo account is intentionally shared and prefilled — it is read-mostly and
// scoped to a demo role on the server. Overridable via DEMO_USERNAME/PASSWORD.
const DEMO_USERNAME = "oxotdemo";
const DEMO_PASSWORD = "oxot2026$";

const INCLUDED = [
  "A fully worked CRA assessment for a smart-home hub",
  "A prioritised gap worklist with owners and deadlines",
  "Generated artifacts and a live readiness grade",
  "The workspace-aware Conformity Copilot",
];

function Brand() {
  return (
    <Link href="/welcome" className="flex items-center gap-2.5 group shrink-0">
      <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-6">
        <span className="text-primary-foreground font-display font-bold text-lg leading-none">O</span>
      </div>
      <div className="flex flex-col leading-none gap-0.5">
        <span className="font-display font-bold text-lg tracking-tight">OXOT</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Conformity
        </span>
      </div>
    </Link>
  );
}

export default function Demo() {
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const { data: session, isLoading } = useGetAdminSession();
  const [username, setUsername] = useState(DEMO_USERNAME);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const login = useAdminLogin({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        navigate("/overview");
      },
    },
  });

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Brand />
          <Link
            href="/welcome"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2 md:items-center">
          {/* Pitch */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              <PlayCircle className="w-3.5 h-3.5 text-primary" /> Live demo
            </div>
            <h1 className="mt-5 text-3xl sm:text-4xl font-display font-bold tracking-tight">
              Step into the cockpit
            </h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Sign in with the shared demo account below to explore a populated conformity assessment.
              Everything is interactive — poke around freely.
            </p>
            <ul className="mt-6 space-y-2.5">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Login card */}
          <Card className="rounded-lg border-t-4 border-t-primary">
            {isLoading ? (
              <CardContent className="p-6">
                <Skeleton className="h-52 w-full" />
              </CardContent>
            ) : session?.authenticated ? (
              <>
                <CardHeader>
                  <CardTitle>You&apos;re already signed in</CardTitle>
                  <CardDescription>
                    Continue to your workspace to open the assessment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-md gap-2" onClick={() => navigate("/overview")}>
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader>
                  <CardTitle>Enter the live demo</CardTitle>
                  <CardDescription>Credentials are prefilled — just press enter.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    id="demo-login"
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      login.mutate({ data: { username, password } });
                    }}
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="demo-username">Username</Label>
                      <Input
                        id="demo-username"
                        className="rounded-md font-mono"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="demo-password">Password</Label>
                      <Input
                        id="demo-password"
                        type="password"
                        className="rounded-md font-mono"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                    {login.isError && (
                      <p className="text-sm text-destructive">
                        Could not sign in with those credentials.
                      </p>
                    )}
                    <Button
                      type="submit"
                      form="demo-login"
                      className="w-full rounded-md gap-2"
                      disabled={login.isPending || !username || !password}
                    >
                      {login.isPending ? "Signing in…" : "Enter demo"}
                      {!login.isPending && <ArrowRight className="w-4 h-4" />}
                    </Button>
                  </form>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
