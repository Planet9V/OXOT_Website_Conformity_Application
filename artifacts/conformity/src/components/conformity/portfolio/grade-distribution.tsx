import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import type { PortfolioGradeBucket } from "@workspace/api-client-react";

/**
 * Distribution of computed readiness grades. This is answer QUALITY — kept
 * visually distinct from the posture band (workflow progress) so the two are
 * never conflated. Ungraded assessments are shown explicitly rather than hidden.
 */
const GRADE_ORDER = ["A", "B", "C", "D", "F", "ungraded"] as const;
const GRADE_HEX: Record<string, string> = {
  A: "#22c55e",
  B: "#84cc16",
  C: "#f59e0b",
  D: "#f97316",
  F: "#ef4444",
  ungraded: "#94a3b8",
};
const GRADE_LABEL: Record<string, string> = { A: "A", B: "B", C: "C", D: "D", F: "F", ungraded: "—" };

type Datum = { grade: string; key: string; count: number };

function GradeTip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Datum }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <div className="font-medium">{d.key === "ungraded" ? "Not graded" : `Grade ${d.grade}`}</div>
      <div className="text-muted-foreground">
        {d.count} assessment{d.count === 1 ? "" : "s"}
      </div>
    </div>
  );
}

export function GradeDistribution({ grades }: { grades: PortfolioGradeBucket[] }) {
  const counts = new Map(grades.map((g) => [g.grade, g.count]));
  const total = grades.reduce((s, g) => s + g.count, 0);
  const scored = grades.filter((g) => g.grade !== "ungraded").reduce((s, g) => s + g.count, 0);
  const data: Datum[] = GRADE_ORDER.map((g) => ({ grade: GRADE_LABEL[g], key: g, count: counts.get(g) ?? 0 }));

  if (total === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No assessments graded yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
            <XAxis dataKey="grade" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <RTooltip cursor={{ fill: "#94a3b8", opacity: 0.12 }} content={<GradeTip />} />
            <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={40}>
              {data.map((d) => (
                <Cell key={d.key} fill={GRADE_HEX[d.key]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        {scored} of {total} assessment{total === 1 ? "" : "s"} graded · grade reflects answer quality, not workflow progress.
      </p>
    </div>
  );
}
