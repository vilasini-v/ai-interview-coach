export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-signal mb-4">
        Agentic career coaching
      </p>
      <h1 className="font-display text-5xl md:text-6xl leading-[1.05] max-w-3xl">
        Two agents. One job: get you the offer.
      </h1>
      <p className="mt-6 text-lg text-muted max-w-2xl">
        Drop in your resume and a target job description. One agent runs a multi-step
        analysis — gap identification, ATS-keyword matching, tailored rewrites. The other
        runs you through a live mock interview, grading each answer and deciding on the
        spot whether to probe deeper.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <a href="/resume" className="btn-primary">Analyze a resume →</a>
        <a href="/interview" className="btn-secondary">Start a mock interview →</a>
      </div>

      <div className="mt-24 grid md:grid-cols-2 gap-6">
        <div className="card">
          <span className="font-mono text-xs text-accent">01</span>
          <h2 className="font-display text-2xl mt-2">Resume Agent</h2>
          <ol className="mt-4 space-y-2 text-sm text-muted">
            <li>1. Identifies real gaps against the job description</li>
            <li>2. Simulates ATS keyword screening</li>
            <li>3. Rewrites your strongest bullets to close the gap</li>
          </ol>
        </div>
        <div className="card">
          <span className="font-mono text-xs text-accent">02</span>
          <h2 className="font-display text-2xl mt-2">Interview Agent</h2>
          <ol className="mt-4 space-y-2 text-sm text-muted">
            <li>1. Asks role-specific questions, voice or typed</li>
            <li>2. Scores each answer with concrete feedback</li>
            <li>3. Autonomously decides when to probe deeper</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
