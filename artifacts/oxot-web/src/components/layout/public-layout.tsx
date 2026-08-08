import { Header } from './header';
import { Footer } from './footer';
import { ChatWidget } from '@/components/chat/chat-widget';
import { usePageViewTracker } from '@/hooks/use-analytics';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  usePageViewTracker();
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
