import { Header } from './header';
import { Footer } from './footer';
import { ChatWidget } from '@/components/chat/chat-widget';
import { usePageViewTracker } from '@/hooks/use-analytics';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  usePageViewTracker();
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
