"use client";

import { useEffect, useState } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import type { AnswerFeedback } from "@/lib/types";

interface SessionQuestion {
  id: string;
  order: number;
  question: string;
  questionType: string;
  answerText: string | null;
  feedback: AnswerFeedback | null;
}

export default function InterviewSessionPage({ params }: { params: { id: string } }) {
  const [roleTitle, setRoleTitle] = useState("");
  const [status, setStatus] = useState<"in_progress" | "completed">("in_progress");
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [answer, setAnswer] = useState("");
  const [answerMode, setAnswerMode] = useState<"voice" | "typed">("typed");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/interview/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRoleTitle(data.roleTitle);
        setStatus(data.status);
        setQuestions(data.questions);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  const current = questions.find((q) => !q.answerText) ?? null;
  const answered = questions.filter((q) => q.answerText);

  async function handleSubmit() {
    if (!current || !answer.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewSessionId: params.id,
          questionId: current.id,
          answerText: answer,
          answerMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit answer.");

      setQuestions((prev) => {
        const updated = prev.map((q) =>
          q.id === current.id ? { ...q, answerText: answer, feedback: data.feedback } : q
        );
        return data.nextQuestion ? [...updated, data.nextQuestion] : updated;
      });
      setAnswer("");
      if (data.completed) setStatus("completed");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-16 text-muted">Loading session…</div>;
  if (error && questions.length === 0)
    return <div className="max-w-3xl mx-auto px-6 py-16 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">Mock interview</p>
      <h1 className="font-display text-4xl mt-1">{roleTitle}</h1>

      {/* Past Q&A with feedback */}
      <div className="mt-10 space-y-6">
        {answered.map((q) => (
          <div key={q.id} className="card">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase text-muted">{q.questionType.replace("_", " ")}</span>
              {q.feedback && (
                <span className="font-mono text-[11px] text-signal ml-auto">Score: {q.feedback.score}/5</span>
              )}
            </div>
            <p className="mt-2 font-medium">{q.question}</p>
            <p className="mt-2 text-sm text-muted whitespace-pre-wrap">{q.answerText}</p>
            {q.feedback && (
              <div className="mt-4 grid md:grid-cols-2 gap-4 border-t border-line pt-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted mb-1">Strengths</h4>
                  <ul className="text-sm space-y-1">
                    {q.feedback.strengths.map((s, i) => (
                      <li key={i} className="text-signal">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted mb-1">Could improve</h4>
                  <ul className="text-sm space-y-1">
                    {q.feedback.improvements.map((s, i) => (
                      <li key={i} className="text-accent">• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current question */}
      {status === "in_progress" && current && (
        <div className="mt-10 card border-signal/40">
          <span className="font-mono text-[11px] uppercase text-signal">
            {current.questionType.replace("_", " ")} · Question {current.order}
          </span>
          <p className="mt-2 font-display text-2xl">{current.question}</p>

          <div className="mt-6">
            <VoiceRecorder value={answer} onChange={setAnswer} onModeChange={setAnswerMode} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !answer.trim()}
            className="btn-primary mt-4"
          >
            {submitting ? "Evaluating…" : "Submit answer →"}
          </button>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      )}

      {status === "completed" && (
        <div className="mt-10 card text-center">
          <h2 className="font-display text-2xl">Interview complete</h2>
          <p className="mt-2 text-muted">
            {answered.length} questions answered, average score{" "}
            {(
              answered.reduce((sum, q) => sum + (q.feedback?.score ?? 0), 0) / (answered.length || 1)
            ).toFixed(1)}
            /5
          </p>
          <a href="/interview" className="btn-secondary mt-6 inline-flex">Start another interview →</a>
        </div>
      )}
    </div>
  );
}
