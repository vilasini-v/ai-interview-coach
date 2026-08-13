"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function InterviewSetupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const resumeSessionId = params.get("resumeSessionId") ?? undefined;

  const [roleTitle, setRoleTitle] = useState("");
  const [jobDescText, setJobDescText] = useState("");
  const [resumeText, setResumeText] = useState<string | undefined>(undefined);
  const [loadingSession, setLoadingSession] = useState(!!resumeSessionId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If we arrived from a resume analysis, pull its saved job title,
  // job description, and resume text so the interviewer has full context
  // without the user retyping anything.
  useEffect(() => {
    if (!resumeSessionId) return;
    fetch(`/api/resume/analyze?id=${resumeSessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRoleTitle(data.jobTitle ?? "");
        setJobDescText(data.jobDescText ?? "");
        setResumeText(data.resumeText ?? undefined);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSession(false));
  }, [resumeSessionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleTitle, jobDescText, resumeSessionId, resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start interview.");
      router.push(`/interview/session/${data.interviewSessionId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl">Mock Interview</h1>
      <p className="mt-2 text-muted">
        The agent asks role-specific questions, evaluates each answer, and decides live
        whether to probe deeper before moving on.
      </p>
      {resumeSessionId && (
        <p className="mt-3 text-xs text-signal">
          {loadingSession
            ? "Loading your resume and job details…"
            : "Loaded job details and resume from your analysis — the interviewer can reference both."}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label className="field-label">Role you're interviewing for</label>
          <input
            className="field-input"
            placeholder="e.g. Senior Frontend Engineer"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="field-label">Job description</label>
          <textarea
            className="field-input h-48 resize-none"
            placeholder="Paste the job description here"
            value={jobDescText}
            onChange={(e) => setJobDescText(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading || loadingSession}>
          {loading ? "Preparing interview…" : "Start interview →"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}

export default function InterviewSetupPage() {
  return (
    <Suspense fallback={null}>
      <InterviewSetupForm />
    </Suspense>
  );
}