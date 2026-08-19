import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkAlert } from 'remark-github-blockquote-alert';
import 'remark-github-blockquote-alert/alert.css';
import { 
  BookOpen, 
  ArrowLeft, 
  Clock, 
  Calendar, 
  User, 
  Share2, 
  Copy, 
  Check, 
  Radio, 
  Play, 
  Pause, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  List,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MermaidRenderer } from '@/components/mermaid-renderer';
import { useSeo } from '@/hooks/use-seo';
import { useLocale } from '@/providers/locale-provider';

interface BlogPostDetail {
  id: string;
  slug: string;
  filename: string;
  title: string;
  subtitle?: string;
  code: string;
  statutes: string[];
  persona: string;
  personaCategory?: string;
  statutoryDomain?: string;
  difficulty?: string;
  keyMetric?: string;
  series: string;
  seriesId?: number;
  episodeNumber?: number;
  readTime: string;
  duration: string;
  audioUrl: string;
  summary: string;
  takeaways?: string[];
  publishedAt: string;
  keywords: string[];
  prevEpisode?: { code: string; title: string; slug: string } | null;
  nextEpisode?: { code: string; title: string; slug: string } | null;
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || '';
  const { locale } = useLocale();

  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1.0x' | '1.25x' | '1.5x'>('1.0x');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    window.scrollTo(0, 0);

    fetch(`/api/blogs/${encodeURIComponent(slug)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Blog post not found (${res.status})`);
        return res.json();
      })
      .then(data => {
        if (data.post) {
          setPost(data.post);
          setMarkdownContent(data.content || '');
        } else {
          throw new Error('Invalid response structure');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  useSeo(post ? {
    title: `${post.title} | The CRA Technical Journal`,
    description: post.subtitle || post.summary,
    keywords: post.keywords?.join(', '),
    ogTitle: post.title,
    ogDescription: post.subtitle || post.summary,
  } : null);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Clean raw markdown to strip repetitive frontmatter headers
  const processedMarkdown = useMemo(() => {
    if (!markdownContent) return '';
    let text = markdownContent;
    // Strip YAML frontmatter if present
    if (text.startsWith('---')) {
      const parts = text.split('---');
      if (parts.length >= 3) {
        text = parts.slice(2).join('---').trim();
      }
    }
    // Strip HTML comments (e.g. non-rendering IMAGE-SLOT image placeholders) so
    // this renderer does not display them as raw literal text.
    text = text.replace(/<!--[\s\S]*?-->/g, '');
    return text.trim();
  }, [markdownContent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-6">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-12 w-3/4 rounded-xl" />
          <Skeleton className="h-6 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-2xl mt-8" />
          <div className="space-y-4 pt-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center text-center px-4 pt-24">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
          Technical Memorandum Not Found
        </h1>
        <p className="text-muted-foreground max-w-md mb-8">
          The requested engineering guide or memorandum could not be retrieved from the active CRA register.
        </p>
        <Link href="/blog">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Technical Journal
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-24 selection:bg-primary/20">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="container mx-auto px-4 md:px-8 max-w-4xl mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border/60">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 text-primary transition-transform group-hover:-translate-x-1" />
            <span>BACK TO TECHNICAL JOURNAL</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/60 border border-border/60 hover:bg-card text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share Guide'}</span>
            </button>
            <a
              href={`/conformity/cra-wiki?q=${encodeURIComponent(post.statutes[0] || 'CRA')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-xs font-medium text-primary transition-colors"
            >
              <span>Legal Wiki</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <main className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        {/* Article Eyebrow & Badges */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-primary/15 text-primary text-xs font-mono font-bold border border-primary/25">
              {post.code}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-card border border-border text-xs font-mono text-muted-foreground">
              {post.series}
            </span>
            {post.statutes.map((stat, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-muted/60 text-[11px] font-mono text-muted-foreground">
                {stat}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-[1.15] tracking-tight">
            {post.title}
          </h1>

          {/* Subtitle / Lede */}
          {post.subtitle && (
            <p className="text-lg md:text-xl text-muted-foreground font-sans leading-relaxed">
              {post.subtitle}
            </p>
          )}

          {/* Metadata Byline Strip */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/40 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Jim McKenney (Digital Product Security Consultant)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.publishedAt}</span>
            </div>
          </div>
        </div>

        {/* Target Persona Context Card */}
        <div className="p-5 rounded-2xl bg-card/60 border border-primary/25 backdrop-blur-sm shadow-sm mb-10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/15 text-primary flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs md:text-sm">
              <div className="font-semibold text-foreground">
                Target Persona & Statutory Exposure
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Prepared specifically for <strong>{post.persona}</strong>. This memorandum provides defensible engineering blueprints, risk boundary definitions, and compliance checklists under <strong>{post.statutes.join(', ')}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Companion Audio Player Banner */}
        <div className="p-4 md:p-5 rounded-2xl bg-card/80 border border-border/80 shadow-md mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/15 text-primary">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold text-primary uppercase tracking-wider">
                Companion Audio Broadcast • {post.code}
              </div>
              <div className="text-xs font-medium text-foreground">
                Listen to the full 14-minute spoken briefing with engineering commentary
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                const speeds: ('1.0x' | '1.25x' | '1.5x')[] = ['1.0x', '1.25x', '1.5x'];
                const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                setPlaybackSpeed(next);
              }}
              className="px-2.5 py-1 rounded-lg bg-muted text-xs font-mono font-medium text-foreground hover:bg-muted/80 cursor-pointer"
            >
              {playbackSpeed}
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause Audio' : 'Play Briefing'}</span>
            </button>
          </div>
        </div>

        {/* Markdown Rendered Content */}
        <article className="prose prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-border/40 prose-h2:pb-3 prose-p:text-base prose-p:leading-relaxed prose-p:text-foreground/90 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:font-mono prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-blockquote:border-l-4 prose-blockquote:border-primary/60 prose-blockquote:bg-card/40 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-blockquote:text-muted-foreground prose-li:text-foreground/90">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkAlert]}
            components={{
              pre({ children }) {
                const codeEl = children as React.ReactElement<{ className?: string; children?: React.ReactNode }> | undefined;
                const className = codeEl?.props?.className ?? '';
                const isMermaid = /language-mermaid/.test(className);
                const codeStr = typeof codeEl?.props?.children === 'string' 
                  ? codeEl.props.children 
                  : Array.isArray(codeEl?.props?.children) 
                    ? codeEl.props.children.join('') 
                    : '';

                if (isMermaid) {
                  return (
                    <div className="not-prose my-8">
                      <MermaidRenderer chart={codeStr.trim()} />
                    </div>
                  );
                }
                return <pre className="p-4 rounded-2xl bg-card border border-border/80 font-mono text-xs overflow-x-auto my-6">{children}</pre>;
              },
              table({ children }) {
                return (
                  <div className="not-prose my-8 overflow-x-auto rounded-2xl border border-border/80 bg-card/40 shadow-sm">
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return <th className="p-3.5 bg-muted/40 font-mono font-bold text-foreground border-b border-border/80">{children}</th>;
              },
              td({ children }) {
                return <td className="p-3.5 border-b border-border/40 text-foreground/90 align-top">{children}</td>;
              }
            }}
          >
            {processedMarkdown}
          </ReactMarkdown>
        </article>

        {/* Previous & Next Navigation Section */}
        <div className="mt-16 pt-10 border-t border-border/60">
          <div className="flex items-center justify-between gap-4 mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Guide Navigation
            </span>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
            >
              <span>View All 67 Guides</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Previous Guide */}
            {post.prevEpisode ? (
              <Link
                href={`/blog/${post.prevEpisode.slug}`}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-card/60 border border-border/60 hover:border-primary/40 transition-all hover:bg-card hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors mb-2">
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>PREVIOUS GUIDE</span>
                  <span className="px-1.5 py-0.5 bg-primary/15 text-primary rounded text-[10px] font-bold">
                    {post.prevEpisode.code}
                  </span>
                </div>
                <h4 className="text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.prevEpisode.title}
                </h4>
              </Link>
            ) : (
              <Link
                href="/blog"
                className="group flex flex-col justify-between p-5 rounded-2xl bg-card/30 border border-dashed border-border/60 hover:border-border transition-all"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span>START OF SERIES</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You are reading the first guide in this series. Return to the Technical Journal Hub.
                </p>
              </Link>
            )}

            {/* Next Guide */}
            {post.nextEpisode ? (
              <Link
                href={`/blog/${post.nextEpisode.slug}`}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-card/60 border border-border/60 hover:border-primary/40 transition-all hover:bg-card hover:shadow-md text-right"
              >
                <div className="flex items-center justify-end gap-2 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors mb-2">
                  <span className="px-1.5 py-0.5 bg-primary/15 text-primary rounded text-[10px] font-bold">
                    {post.nextEpisode.code}
                  </span>
                  <span>NEXT GUIDE</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
                <h4 className="text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.nextEpisode.title}
                </h4>
              </Link>
            ) : (
              <Link
                href="/blog"
                className="group flex flex-col justify-between p-5 rounded-2xl bg-card/30 border border-dashed border-border/60 hover:border-border transition-all text-right"
              >
                <div className="flex items-center justify-end gap-2 text-xs font-mono text-muted-foreground mb-2">
                  <span>END OF SERIES</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p className="text-xs text-muted-foreground">
                  You have reached the final guide. Explore all technical memorandums in the Hub.
                </p>
              </Link>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
