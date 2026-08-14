/**
 * SocialFeed — public-facing social embed section.
 *
 * Renders a Twitter/X timeline embed when a twitter.com or x.com URL is found
 * in the site's social links, and a LinkedIn follow card when a linkedin.com
 * URL is present.  Neither requires API credentials — both rely on the
 * platforms' native embed widgets.
 */

import { useEffect } from 'react';
import { Linkedin, Twitter } from 'lucide-react';
import { useLocale } from '@/providers/locale-provider';

interface SocialLink {
  platform: string;
  url: string;
}

interface SocialFeedProps {
  socialLinks: SocialLink[];
}

// Localised social-feed copy (nl-NL professional register, "u"). Machine-
// assisted — flag Dutch strings for a native reviewer before go-live.
const copy = {
  en: {
    loadingPosts: 'Loading posts…',
    followLinkedInTitle: 'Follow us on LinkedIn',
    followLinkedInBody: 'Stay updated with our latest compliance insights and announcements.',
    followLinkedInCta: 'Follow on LinkedIn',
    heading: 'Follow Along',
    subheading: 'Get the latest updates directly from our social channels.',
  },
  nl: {
    loadingPosts: 'Berichten laden…',
    followLinkedInTitle: 'Volg ons op LinkedIn',
    followLinkedInBody: 'Blijf op de hoogte van onze laatste compliance-inzichten en aankondigingen.',
    followLinkedInCta: 'Volgen op LinkedIn',
    heading: 'Blijf op de hoogte',
    subheading: 'Het laatste nieuws rechtstreeks van onze sociale kanalen.',
  },
} as const;

// Extract a Twitter username from a profile URL.
function extractTwitterHandle(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'twitter.com' || u.hostname === 'x.com' || u.hostname === 'www.twitter.com' || u.hostname === 'www.x.com') {
      const parts = u.pathname.split('/').filter(Boolean);
      return parts[0] ?? null;
    }
  } catch {
    // ignore malformed URLs
  }
  return null;
}

// Determine whether a URL is a LinkedIn company or personal URL.
function isLinkedInUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.includes('linkedin.com');
  } catch {
    return false;
  }
}

function TwitterEmbed({ handle, loadingPosts }: { handle: string; loadingPosts: string }) {
  // Load Twitter's widget script once.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Reload widgets after mount so the timeline renders inside a React tree.
    const win = window as unknown as { twttr?: { widgets?: { load?: () => void } } };
    if (win.twttr?.widgets?.load) {
      win.twttr.widgets.load();
      return;
    }
    if (document.getElementById('twitter-widget-script')) return;
    const script = document.createElement('script');
    script.id = 'twitter-widget-script';
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    document.body.appendChild(script);
  }, [handle]);

  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Twitter className="w-4 h-4 text-[#1DA1F2]" />
        <span className="text-sm font-semibold">@{handle} on X</span>
      </div>
      <div className="p-2">
        <a
          className="twitter-timeline"
          data-height="440"
          data-theme="light"
          data-chrome="noheader nofooter noborders"
          href={`https://twitter.com/${handle}`}
        >
          {loadingPosts}
        </a>
      </div>
    </div>
  );
}

interface SocialFeedCopy {
  loadingPosts: string;
  followLinkedInTitle: string;
  followLinkedInBody: string;
  followLinkedInCta: string;
  heading: string;
  subheading: string;
}

function LinkedInCard({ url, t }: { url: string; t: SocialFeedCopy }) {
  return (
    <div className="w-full rounded-xl border bg-card p-6 flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-[#0077B5] flex items-center justify-center">
        <Linkedin className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="font-semibold text-sm">{t.followLinkedInTitle}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t.followLinkedInBody}
        </p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#0077B5] text-white text-sm font-medium hover:bg-[#005f94] transition-colors"
      >
        <Linkedin className="w-4 h-4" />
        {t.followLinkedInCta}
      </a>
    </div>
  );
}

export function SocialFeed({ socialLinks }: SocialFeedProps) {
  const { locale } = useLocale();
  const t = copy[locale];
  const twitterUrl = socialLinks.find(
    (l) => l.platform.toLowerCase().includes('twitter') || l.platform.toLowerCase() === 'x' || extractTwitterHandle(l.url) !== null,
  );
  const linkedInUrl = socialLinks.find(
    (l) => l.platform.toLowerCase().includes('linkedin') || isLinkedInUrl(l.url),
  );

  const twitterHandle = twitterUrl ? extractTwitterHandle(twitterUrl.url) : null;
  const hasContent = twitterHandle || linkedInUrl;

  if (!hasContent) return null;

  const hasBoth = twitterHandle && linkedInUrl;

  return (
    <section className="container mx-auto px-4 md:px-8 py-12">
      <div className="mb-8 text-center">
        <h2 className="font-display font-bold text-2xl md:text-3xl">{t.heading}</h2>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          {t.subheading}
        </p>
      </div>
      <div className={`grid gap-6 ${hasBoth ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto'}`}>
        {twitterHandle && <TwitterEmbed handle={twitterHandle} loadingPosts={t.loadingPosts} />}
        {linkedInUrl && <LinkedInCard url={linkedInUrl.url} t={t} />}
      </div>
    </section>
  );
}
