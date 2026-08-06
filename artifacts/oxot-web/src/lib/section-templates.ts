export interface SectionTypeDef {
  type: string;
  label: string;
  description: string;
  template: Record<string, unknown>;
}

/** The section types the renderer supports, with starter content for new sections. */
export const SECTION_TYPES: SectionTypeDef[] = [
  {
    type: "article",
    label: "Article",
    description: "Long-form markdown content with headings, tables, callouts and key-facts panels.",
    template: {
      title: "",
      excerpt: "",
      markdown: "## Section heading\n\nWrite your long-form content here using **Markdown**.",
    },
  },
  {
    type: "hero",
    label: "Hero",
    description: "Large headline, subtitle and call-to-action buttons.",
    template: {
      eyebrow: "Eyebrow",
      title: "Your headline goes here",
      subtitle: "A supporting sentence that explains the value you provide.",
      primaryCta: { label: "Get started", href: "#" },
      secondaryCta: { label: "Learn more", href: "#" },
      bullets: ["First highlight", "Second highlight"],
    },
  },
  {
    type: "stat_band",
    label: "Stat band",
    description: "A row of key metrics.",
    template: { stats: [{ value: "90%", label: "Metric label", sublabel: "" }] },
  },
  {
    type: "feature_grid",
    label: "Feature grid",
    description: "A grid of features with icons.",
    template: {
      eyebrow: "",
      title: "What you get",
      subtitle: "",
      features: [{ title: "Feature", description: "Describe the feature.", icon: "check" }],
    },
  },
  {
    type: "two_column",
    label: "Two column",
    description: "Text with optional bullets and a call to action.",
    template: {
      eyebrow: "",
      title: "Section title",
      body: "Explain this part of your offering in a short paragraph.",
      bullets: ["Point one"],
      cta: { label: "", href: "#" },
      reverse: false,
    },
  },
  {
    type: "comparison_table",
    label: "Comparison table",
    description: "Compare options across columns.",
    template: {
      eyebrow: "",
      title: "How we compare",
      subtitle: "",
      columns: ["With OXOT", "Without"],
      rows: [{ label: "Row label", values: ["Yes", "No"] }],
    },
  },
  {
    type: "steps",
    label: "Steps",
    description: "A numbered process.",
    template: {
      eyebrow: "",
      title: "How it works",
      steps: [{ number: "1", title: "Step title", description: "Describe the step." }],
    },
  },
  {
    type: "logo_wall",
    label: "Logo wall",
    description: "A wall of client or partner names.",
    template: { title: "Trusted by", logos: [{ name: "Company name" }] },
  },
  {
    type: "faq",
    label: "FAQ",
    description: "Common questions and answers.",
    template: {
      eyebrow: "",
      title: "Frequently asked questions",
      items: [{ question: "A question?", answer: "The answer." }],
    },
  },
  {
    type: "quote",
    label: "Quote",
    description: "A customer or expert quote.",
    template: { quote: "A memorable quote.", author: "Full name", role: "Job title" },
  },
  {
    type: "cta",
    label: "Call to action",
    description: "A closing prompt with buttons.",
    template: {
      title: "Ready to get started?",
      subtitle: "A short nudge to take the next step.",
      primaryCta: { label: "Contact us", href: "#" },
      secondaryCta: { label: "", href: "#" },
    },
  },
];

export const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  SECTION_TYPES.map((s) => [s.type, s.label]),
);

export function sectionTemplate(type: string): Record<string, unknown> {
  const def = SECTION_TYPES.find((s) => s.type === type);
  return def ? structuredClone(def.template) : {};
}

/** Turn a camelCase / snake_case key into a human label. */
export function humanizeKey(key: string): string {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
