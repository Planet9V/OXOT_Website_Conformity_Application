import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { useConfirmNewsletter } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type State = 'loading' | 'ok' | 'error';

export default function NewsletterConfirm() {
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('Confirming your subscription…');
  const confirm = useConfirmNewsletter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const token = new URLSearchParams(window.location.search).get('token') ?? '';
    if (!token) {
      setState('error');
      setMessage('This confirmation link is invalid or has expired.');
      return;
    }
    confirm
      .mutateAsync({ data: { token } })
      .then((res) => {
        setState(res.ok ? 'ok' : 'error');
        setMessage(res.message ?? (res.ok ? 'Your subscription is confirmed.' : 'This link is invalid or has expired.'));
      })
      .catch(() => {
        setState('error');
        setMessage('Something went wrong confirming your subscription. Please try again.');
      });
  }, [confirm]);

  return (
    <div className="container mx-auto px-4 py-24 flex justify-center">
      <div className="max-w-md w-full text-center space-y-4 bg-card border rounded-lg p-8">
        {state === 'loading' && <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />}
        {state === 'ok' && <CheckCircle2 className="w-10 h-10 mx-auto text-primary" />}
        {state === 'error' && <XCircle className="w-10 h-10 mx-auto text-destructive" />}
        <h1 className="font-display font-bold text-2xl">
          {state === 'ok' ? "You're subscribed" : state === 'error' ? 'Confirmation failed' : 'Confirming…'}
        </h1>
        <p className="text-muted-foreground">{message}</p>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
