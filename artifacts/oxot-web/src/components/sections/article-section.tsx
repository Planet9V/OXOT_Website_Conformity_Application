import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkAlert } from 'remark-github-blockquote-alert';
import 'remark-github-blockquote-alert/alert.css';
import { Link } from 'wouter';
import {
  List,
  ChevronDown,
  Scale,
  ShieldCheck,
  Cpu,
  FileText,
  ListChecks,
  BookOpen,
  Building2,
} from 'lucide-react';
import { type ReactElement, type ReactNode, isValidElement, useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { RichText, safeHref } from '@/components/rich-text';
import { cn } from '@/lib/utils';
import { useLocale } from '@/providers/locale-provider';
import { extractH2Headings, slugify } from './article-headings';

export interface ArticleSectionData {
  /** Full markdown body of the page. */
  markdown: string;
  /** Optional short lead paragraph shown above the body. */
  excerpt?: string;
  /** Optional page title rendered as the article H1. */
  title?: string;
  /** Orange eyebrow line above the title (OXOT page-header standard, ≤8 words). */
  kicker?: string;
  /** 3–5 sentence page description rendered under the title. */
  description?: string;
  /** Icon key for the title icon — see HEADER_ICONS. */
  icon?: string;
}

/** Title icons for the standard page header, keyed by a stable name stored in
 * the section data so the choice round-trips through the content snapshot. */
const HEADER_ICONS: Record<string, typeof BookOpen> = {
  scale: Scale,
  shield: ShieldCheck,
  cpu: Cpu,
  file: FileText,
  list: ListChecks,
  book: BookOpen,
  building: Building2,
};

// The canonical heading-slug helpers live in ./article-headings and are the
// single source of truth for both the TOC hrefs and the rendered <h2 id>s.
export { slugify, createSlugger, extractH2Headings } from './article-headings';

/** Frameworks referenced by the `framework-selector` widget block. */
const FRAMEWORK_LINKS: { label: string; href: string; kind: string }[] = [
  { label: 'Cyber Resilience Act', href: '/cra', kind: 'Law' },
  { label: 'EU AI Act', href: '/ai-act', kind: 'Law' },
  { label: 'Machinery Regulation', href: '/machine-act', kind: 'Law' },
  { label: 'NIS2 Directive', href: '/nis2', kind: 'Law' },
  { label: 'IEC 62443', href: '/iec-62443', kind: 'Standard' },
  { label: 'TS 50701', href: '/ts-50701', kind: 'Standard' },
];

import { isDirectDocumentLink, stripLocalePrefix } from './article-links';

/** Shared link renderer: internal links use wouter, external open in a new tab. */
function MdLink({ href, children }: { href?: string; children: ReactNode }) {
  const raw = href ? safeHref(href) : null;
  if (!raw) return <>{children}</>;
  // CMS markdown often links with a locale prefix (`/en/cra`, `/nl/services`),
  // but the SPA routes are locale-less (`/:slug`). Strip the prefix so these
  // resolve to a real page instead of the 404 route.
  const url = stripLocalePrefix(raw);
  const isExternal = /^https?:\/\//.test(url) || url.startsWith('mailto:') || url.startsWith('tel:');
  const isAnchor = url.startsWith('#');
  if (isExternal) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (isAnchor) return <a href={url}>{children}</a>;
  // Static documents (PDFs, decks, .md source files) and cross-artifact links
  // (e.g. the Conformity app at /conformity/*) must hit the URL directly —
  // wouter would try to client-route them inside this SPA and land on NotFound.
  if (isDirectDocumentLink(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <Link href={url}>{children}</Link>;
}

/** Inline markdown (links, bold, italic, code) with the top-level paragraph unwrapped. */
function InlineMd({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <>{children}</>,
        a: ({ href, children }) => <MdLink href={href}>{children}</MdLink>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

/** Block-level markdown (lists, paragraphs) for panel bodies. */
function BlockMd({ text }: { text: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-a:text-primary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ a: ({ href, children }) => <MdLink href={href}>{children}</MdLink> }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function FrameworkSelector() {
  return (
    <div className="not-prose my-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {FRAMEWORK_LINKS.map((f) => (
        <Link
          key={f.href}
          href={f.href}
          className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-primary">{f.kind}</span>
          <span className="mt-1 font-display text-lg font-semibold text-foreground group-hover:text-primary">
            {f.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

/** `Label :: Value` rows rendered as a definition list. */
function KeyFacts({ raw }: { raw: string }) {
  const rows = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf('::');
      if (idx === -1) return null;
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 2).trim() };
    })
    .filter((r): r is { label: string; value: string } => r !== null);

  if (rows.length === 0) return null;

  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-border bg-muted/30">
      <dl className="divide-y divide-border">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-semibold text-muted-foreground">{row.label}</dt>
            <dd className="text-sm text-foreground sm:col-span-2">
              <RichText text={row.value} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Heading + body + a single call-to-action button (`Label :: /href` on the last line). */
function Cta({ raw }: { raw: string }) {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  const buttonLine = lines[lines.length - 1];
  const bIdx = buttonLine.indexOf('::');
  const hasButton = bIdx !== -1;
  const heading = lines[0];
  const bodyLines = lines.slice(1, hasButton ? -1 : undefined);
  const label = hasButton ? buttonLine.slice(0, bIdx).trim() : '';
  const href = hasButton ? safeHref(buttonLine.slice(bIdx + 2)) : null;

  return (
    <div className="not-prose my-10 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
      <h3 className="font-display text-2xl font-bold text-foreground">{heading}</h3>
      {bodyLines.length > 0 && (
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          <InlineMd text={bodyLines.join(' ')} />
        </p>
      )}
      {label && href && (
        <div className="mt-6">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {label}
          </Link>
        </div>
      )}
    </div>
  );
}

/** Grid of cards. Each line: `Title :: (icon) :: Description`. */
function Cards({ raw }: { raw: string }) {
  const cards = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('::');
      if (parts.length < 2) return null;
      const title = parts[0].trim();
      const desc = parts.slice(2).join('::').trim() || parts.slice(1).join('::').trim();
      return { title, desc };
    })
    .filter((c): c is { title: string; desc: string } => c !== null);

  if (cards.length === 0) return null;

  return (
    <div className="not-prose my-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <h4 className="font-display text-base font-semibold text-foreground">{card.title}</h4>
          {card.desc && (
            <p className="mt-2 text-sm text-muted-foreground">
              <InlineMd text={card.desc} />
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/** Vertical timeline. Each line: `Date :: Description`. */
function Timeline({ raw }: { raw: string }) {
  const items = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf('::');
      if (idx === -1) return null;
      return { date: line.slice(0, idx).trim(), body: line.slice(idx + 2).trim() };
    })
    .filter((it): it is { date: string; body: string } => it !== null);

  if (items.length === 0) return null;

  return (
    <div className="not-prose my-8">
      <ol className="relative border-l border-border pl-6">
        {items.map((item, i) => (
          <li key={i} className="mb-6 last:mb-0">
            <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
            <div className="text-sm font-semibold text-primary">{item.date}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              <InlineMd text={item.body} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Two side-by-side panels separated by a `---` line. First line of each is its title. */
function Compare({ raw }: { raw: string }) {
  const sides = raw
    .split(/^\s*---\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split('\n');
      const title = lines[0].trim();
      const body = lines.slice(1).join('\n').trim();
      return { title, body };
    });

  if (sides.length === 0) return null;

  return (
    <div className="not-prose my-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      {sides.map((side, i) => (
        <div
          key={i}
          className={`rounded-xl border p-5 ${
            i === 0 ? 'border-border bg-muted/30' : 'border-primary/30 bg-primary/5'
          }`}
        >
          <h4 className="mb-3 font-display text-base font-semibold text-foreground">{side.title}</h4>
          <BlockMd text={side.body} />
        </div>
      ))}
    </div>
  );
}

/** Cards laid out from items separated by `---`. First line of each is its title. */
function Carousel({ raw }: { raw: string }) {
  const items = raw
    .split(/^\s*---\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split('\n');
      const title = lines[0].trim();
      const body = lines.slice(1).join('\n').trim();
      return { title, body };
    });

  if (items.length === 0) return null;

  return (
    <div className="not-prose my-8 grid grid-cols-1 gap-5 md:grid-cols-2">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col rounded-xl border border-border bg-card p-6">
          <h4 className="mb-2 font-display text-lg font-semibold text-foreground">{item.title}</h4>
          <BlockMd text={item.body} />
        </div>
      ))}
    </div>
  );
}

/** Sanitized raw HTML block (e.g. embedded video). */
function RawHtml({ raw }: { raw: string }) {
  const clean = DOMPurify.sanitize(raw, { ADD_ATTR: ['controls', 'preload', 'poster'] });
  return <div className="not-prose my-8" dangerouslySetInnerHTML={{ __html: clean }} />;
}

/** Sanitized inline SVG diagram. */
function InlineSvg({ raw }: { raw: string }) {
  const clean = DOMPurify.sanitize(raw, { USE_PROFILES: { svg: true, svgFilters: true } });
  return (
    <div
      className="not-prose my-8 flex justify-center overflow-x-auto rounded-xl border border-border bg-muted/30 p-4 [&>svg]:h-auto [&>svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

// Pull the raw text out of a fenced code node's children.
function codeText(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(codeText).join('');
  return '';
}

/** Render a recognised fenced block, or null if the language is not a custom block. */
function renderBlock(lang: string | undefined, text: string): ReactElement | null {
  switch (lang) {
    case 'keyfacts':
      return <KeyFacts raw={text} />;
    case 'cta':
      return <Cta raw={text} />;
    case 'cards':
      return <Cards raw={text} />;
    case 'timeline':
      return <Timeline raw={text} />;
    case 'compare':
      return <Compare raw={text} />;
    case 'carousel':
      return <Carousel raw={text} />;
    case 'html':
      return <RawHtml raw={text} />;
    case 'svg':
      return <InlineSvg raw={text} />;
    case 'widget':
      return text.trim() === 'framework-selector' ? <FrameworkSelector /> : null;
    default:
      return null;
  }
}

const baseComponents: Components = {
  a({ href, children }) {
    return <MdLink href={href}>{children}</MdLink>;
  },
  // Fenced code blocks (```lang) arrive here wrapped in <pre>. Custom block
  // languages are rendered as rich components; real code falls through.
  pre({ children }) {
    const codeEl = children as ReactElement<{ className?: string; children?: ReactNode }> | undefined;
    const className = codeEl?.props?.className ?? '';
    const lang = /language-(\w+)/.exec(className)?.[1];
    const text = codeText(codeEl?.props?.children);
    const block = renderBlock(lang, text);
    if (block) return block;
    return <pre>{children}</pre>;
  },
};

/** Recursively pull the plain text out of a rendered React node tree. */
function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement(node)) {
    return nodeText((node.props as { children?: ReactNode }).children);
  }
  return '';
}

/**
 * Build the markdown component map. H2 ids are drawn, in document order, from the
 * exact same `headings` list the sidebar TOC renders from — so `<h2 id>` values
 * and TOC hrefs are equal by construction. `headings` and the <h2> nodes both
 * come from parsing the same markdown, so they line up 1:1. The `nodeText`
 * fallback only fires in the impossible case of a count mismatch, and still
 * routes through the canonical `slugify`.
 */
function buildComponents(headings: { id: string; label: string }[]): Components {
  let index = 0;
  return {
    ...baseComponents,
    h2({ children }) {
      const heading = headings[index++];
      const id = heading ? heading.id : slugify(nodeText(children));
      return <h2 id={id} className="scroll-mt-24">{children}</h2>;
    },
  };
}

export function ArticleSection({ data }: { data: ArticleSectionData }) {
  const { markdown, excerpt, title, kicker, description, icon } = data;
  // The standard OXOT page header (kicker · icon+title · description) engages
  // as soon as a page carries the new fields; legacy pages keep the old
  // in-column title + lede so nothing breaks before content is migrated.
  const hasHeader = Boolean(kicker || description);
  const HeaderIcon = hasHeader && icon ? (HEADER_ICONS[icon] ?? BookOpen) : null;
  const { locale } = useLocale();

  // Parse H2 headings for the TOC (same canonical, de-duplicated ids the body uses).
  const headings = extractH2Headings(markdown);

  const showToc = headings.length >= 3;
  const [activeSection, setActiveSection] = useState(headings[0]?.id ?? '');
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Smooth scrolling over multi-thousand-pixel jumps is slow and easily
    // cancelled in Chrome, leaving readers stranded mid-article. Jump
    // instantly for long distances; stay smooth for nearby sections.
    const distance = Math.abs(el.getBoundingClientRect().top);
    el.scrollIntoView({ behavior: distance > 2500 ? 'auto' : 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (!showToc) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 },
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown]);

  const tocLabel = locale === 'nl' ? 'Op deze pagina' : 'On this page';

  const articleBody = (
    <article className={cn(showToc ? 'flex-1 min-w-0' : 'mx-auto max-w-3xl')}>
      {showToc && (
        <div className="md:hidden sticky top-16 z-30 -mx-4 mb-8 px-4">
          <div className="overflow-hidden rounded-xl border border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <button
              type="button"
              onClick={() => setMobileTocOpen((o) => !o)}
              aria-expanded={mobileTocOpen}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <List className="h-4 w-4 text-primary" />
                {tocLabel}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  mobileTocOpen && 'rotate-180',
                )}
              />
            </button>
            {mobileTocOpen && (
              <nav className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto border-t border-border px-2 py-2">
                {headings.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm transition-colors',
                      activeSection === id
                        ? 'bg-primary/10 font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileTocOpen(false);
                      scrollToHeading(id);
                    }}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>
      )}
      {!hasHeader && title && (
        <h1 className="oxot-h1 mb-6 text-foreground">
          {title}
        </h1>
      )}
      {!hasHeader && excerpt && (
        <p className="mb-10 border-l-2 border-primary/40 pl-4 text-lg text-muted-foreground md:text-xl">
          {excerpt}
        </p>
      )}
      <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-2 prose-th:text-left prose-img:rounded-xl">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkAlert]} components={buildComponents(headings)}>
          {markdown}
        </ReactMarkdown>
      </div>
    </article>
  );

  return (
    <section className="w-full py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        {hasHeader && (
          <header className="mb-10 border-b border-border pb-8">
            {kicker && <span className="oxot-kicker block mb-2">{kicker}</span>}
            <h1 className="oxot-h1 text-foreground flex items-center gap-3">
              {HeaderIcon && <HeaderIcon className="w-6 h-6 text-primary shrink-0" aria-hidden="true" />}
              {title}
            </h1>
            {description && (
              <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </header>
        )}
        {/* No items-start: the aside must stretch to the row's full height or
            its sticky TOC has no track to travel and scrolls away. */}
        <div className={cn(showToc && 'flex gap-12 lg:gap-16')}>
        {showToc && (
          <aside className="hidden md:block w-48 flex-shrink-0">
            <div className="sticky top-24">
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-4">
                <span className="inline-block w-3 h-px bg-primary" />
                {tocLabel}
              </p>
              <nav className="flex flex-col gap-0.5">
                {headings.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={cn(
                      'text-sm py-1 pl-3 border-l-2 transition-colors leading-snug',
                      activeSection === id
                        ? 'border-primary text-foreground font-medium'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToHeading(id);
                    }}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
        {articleBody}
        </div>
      </div>
    </section>
  );
}
