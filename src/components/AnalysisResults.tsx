"use client";

import type { ResumeAnalysisResult } from "@/lib/types";

const fitColor: Record<string, string> = {
  strong: "text-signal",
  moderate: "text-accent",
  weak: "text-red-600",
};

export default function AnalysisResults({ result }: { result: ResumeAnalysisResult }) {
  const { gapAnalysis, keywordMatch, rewrites, agentTrace } = result;

  return (
    <div className="space-y-8">
      {/* Agent trace */}
      <details className="card">
        <summary className="cursor-pointer font-mono text-xs uppercase tracking-wide text-muted">
          Agent trace ({agentTrace.length} steps)
        </summary>
        <ol className="mt-4 space-y-2 text-sm">
          {agentTrace.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-mono text-xs text-accent shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-muted">{s.summary}</span>
            </li>
          ))}
        </ol>
      </details>

      {/* Gap analysis */}
      <section className="card">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Fit Analysis</h2>
          <span className={`font-mono text-sm uppercase font-semibold ${fitColor[gapAnalysis.overallFit]}`}>
            {gapAnalysis.overallFit} fit
          </span>
        </div>
        <p className="mt-3 text-sm text-muted">{gapAnalysis.summary}</p>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <BulletList title="Strengths" items={gapAnalysis.strengths} tone="signal" />
          <BulletList title="Missing skills" items={gapAnalysis.missingSkills} tone="warn" />
          <BulletList title="Missing experience" items={gapAnalysis.missingExperience} tone="warn" />
        </div>
      </section>

      {/* Keyword match */}
      <section className="card">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">ATS Keyword Match</h2>
          <span className="font-mono text-2xl text-signal">{keywordMatch.matchScorePct}%</span>
        </div>
        <p className="mt-3 text-sm text-muted">{keywordMatch.notes}</p>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <BulletList title="Matched keywords" items={keywordMatch.matchedKeywords} tone="signal" />
          <BulletList title="Missing keywords" items={keywordMatch.missingKeywords} tone="warn" />
        </div>
      </section>

      {/* Rewrites */}
      <section className="card">
        <h2 className="font-display text-2xl">Tailored Rewrites</h2>
        <div className="mt-6 space-y-6">
          {rewrites.map((r, i) => (
            <div key={i} className="border-t border-line pt-6 first:border-t-0 first:pt-0">
              <p className="text-sm text-muted line-through decoration-red-300">{r.original}</p>
              <p className="mt-2 text-sm font-medium">{r.rewritten}</p>
              <p className="mt-2 text-xs text-muted italic">{r.rationale}</p>
              {r.targetKeywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.targetKeywords.map((k) => (
                    <span key={k} className="font-mono text-[11px] bg-signal/10 text-signal px-2 py-0.5 rounded">
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BulletList({ title, items, tone }: { title: string; items: string[]; tone: "signal" | "warn" }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted italic">None identified</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className={`text-sm flex gap-2 ${tone === "warn" ? "text-red-700" : "text-ink"}`}>
              <span className={tone === "warn" ? "text-red-400" : "text-signal"}>•</span>
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
