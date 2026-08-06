import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdminLogin } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { ShieldAlert, Loader2, Sparkles, KeyRound } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const loginMutation = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.clear();
        if (data?.role === 'demo') {
          // Public demo users are routed directly to the Conformity Cockpit Workbench (/conformity/)
          window.location.href = '/conformity/';
        } else {
          // Full admins are routed to the Admin Workspace (/admin)
          setLocation('/admin');
        }
      },
      onError: (err: any) => {
        const status = err?.status ?? err?.response?.status;
        if (status === 401 || err?.message?.includes('401')) {
          setErrorMsg('Invalid username or password. Please try again.');
        } else if (status === 403 || err?.message?.includes('403')) {
          setErrorMsg('Access denied. The demo sandbox user belongs in the Conformity Workbench.');
        } else {
          setErrorMsg(err?.message || 'An error occurred during login. Please try again.');
        }
      }
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMsg(null);
    loginMutation.mutate({ data });
  };

  const handleQuickDemoLogin = () => {
    form.setValue('username', 'oxotdemo');
    form.setValue('password', 'oxot2026$');
    setErrorMsg(null);
    loginMutation.mutate({ data: { username: 'oxotdemo', password: 'oxot2026$' } });
  };

  const handleQuickAdminLogin = () => {
    form.setValue('username', 'admin');
    form.setValue('password', 'admin');
    setErrorMsg(null);
    loginMutation.mutate({ data: { username: 'admin', password: 'admin' } });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-cyan-500/30">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-8 pb-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <span className="text-white font-display font-bold text-xl leading-none">O</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-100">OXOT Admin Sign In</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Sign in to manage compliance content, product lifecycles, and system settings.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Quick Sign-In Preset Buttons */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">One-Click Quick Sign In</div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleQuickAdminLogin}
                disabled={loginMutation.isPending}
                className="border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 text-xs font-semibold rounded-xl"
              >
                <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                Admin (admin/admin)
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleQuickDemoLogin}
                disabled={loginMutation.isPending}
                className="border-indigo-500/30 bg-indigo-950/30 text-indigo-300 hover:bg-indigo-900/40 text-xs font-semibold rounded-xl"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Demo Sandbox
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="w-full border-t border-slate-800" />
            <span className="absolute bg-slate-900 px-3 text-[11px] font-mono text-slate-500 uppercase">Or Manual Credentials</span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {errorMsg && (
                <div className="bg-red-950/40 border border-red-500/30 text-red-400 text-sm p-3.5 rounded-xl flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 text-xs font-medium">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" className="bg-slate-950 border-slate-800 text-slate-100 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 text-xs font-medium">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="bg-slate-950 border-slate-800 text-slate-100 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
