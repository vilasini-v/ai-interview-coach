"use client";

import { useState } from "react";
import AnalysisResults from "@/components/AnalysisResults";
import type { ResumeAnalysisResult } from "@/lib/types";

export default function ResumePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescText, setJobDescText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(ResumeAnalysisResult & { sessionId: string }) | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
      const data = await res.json();
      console.log("Parsed resume text:", data.text);
      if (!res.ok) throw new Error(data.error || "Couldn't read that file.");
      setResumeText(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobTitle, jobDescText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl">Resume Analysis</h1>
      <p className="mt-2 text-muted max-w-2xl">
        Paste your resume and a target job description. The agent runs gap identification,
        ATS-keyword matching, and bullet rewriting in sequence.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label className="field-label">Target job title</label>
          <input
            className="field-input"
            placeholder="e.g. Senior Frontend Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="field-label">Job description</label>
            <textarea
              className="field-input h-64 resize-none"
              placeholder="Paste the job description here"
              value={jobDescText}
              onChange={(e) => setJobDescText(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="field-label mb-0">Your resume</label>
              <label className="text-xs text-signal hover:underline cursor-pointer">
                {parsing ? "Reading PDF…" : "Upload PDF instead"}
                <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              className="field-input h-64 resize-none"
              placeholder="Paste your resume text here, or upload a PDF above"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Running agent…" : "Run analysis →"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {result && (
        <div className="mt-16">
          <AnalysisResults result={result} />
          <div className="mt-8">
            <a
             href={`/interview?resumeSessionId=${result.sessionId}`}
              className="btn-secondary"
            >
              Continue to mock interview for this role →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
