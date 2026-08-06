import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString } from 'mdast-util-to-string';

// Minimal shape of the mdast nodes we walk. We avoid depending on @types/mdast
// (not installed) and only touch the fields we need.
interface MdastNode {
  type: string;
  depth?: number;
  children?: MdastNode[];
}

/**
 * Single source of truth for turning a heading into a URL-safe id.
 *
 * Every heading-to-id conversion in the article renderer flows through here
 * (via `createSlugger` / `extractH2Headings`) so the sidebar TOC hrefs and the
 * rendered `<h2 id>` values can never drift apart, no matter how the heading is
 * styled (emphasis, links, inline code, punctuation).
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build a slug generator that guarantees unique ids within a single document.
 * Headings that slugify to the same base get a numeric suffix
 * (`intro`, `intro-2`, `intro-3`, ...) so duplicate H2s still produce distinct,
 * clickable anchors.
 */
export function createSlugger(): (text: string) => string {
  const used = new Set<string>();
  return (text: string) => {
    const base = slugify(text) || 'section';
    let candidate = base;
    let n = 1;
    while (used.has(candidate)) {
      n += 1;
      candidate = `${base}-${n}`;
    }
    used.add(candidate);
    return candidate;
  };
}

// Parse markdown with the same core stack react-markdown uses (remark-parse +
// remark-gfm). This guarantees the heading nodes we collect here line up 1:1,
// in document order, with the <h2> nodes react-markdown renders — so a `##`
// inside a fenced code block is correctly ignored by both, and a heading's
// plain text is derived identically (link text without the URL, emphasis and
// inline-code contents without their markers).
const processor = unified().use(remarkParse).use(remarkGfm);

/** Recursively collect depth-2 heading nodes in document order. */
function collectH2(nodes: MdastNode[], out: MdastNode[]): void {
  for (const node of nodes) {
    if (node.type === 'heading' && node.depth === 2) {
      out.push(node);
    } else if (Array.isArray(node.children)) {
      collectH2(node.children, out);
    }
  }
}

/**
 * Extract H2 headings from a markdown string as `{ id, label }` pairs, with ids
 * that are canonical (via `slugify`), unique (via `createSlugger`), and derived
 * from the heading's rendered plain text (via the mdast AST) rather than its raw
 * markdown source. This is the one list the TOC and the rendered headings both
 * build from.
 */
export function extractH2Headings(markdown: string): { id: string; label: string }[] {
  const tree = processor.parse(markdown) as unknown as MdastNode;
  const headingNodes: MdastNode[] = [];
  collectH2(tree.children ?? [], headingNodes);

  const slugger = createSlugger();
  return headingNodes.map((node) => {
    const label = toString(node).trim();
    return { id: slugger(label), label };
  });
}
