import { generateStructured, SchemaType } from "@/lib/gemini";
import type { AnswerFeedback, GeneratedQuestion, QuestionType } from "@/lib/types";

/**
 * Generates the opening question for a mock interview, grounded in the
 * role and (optionally) the candidate's resume so questions feel targeted
 * rather than generic.
 */
export async function generateOpeningQuestion(
  roleTitle: string,
  jobDescText: string,
  resumeText?: string
): Promise<GeneratedQuestion> {
  return generateStructured<GeneratedQuestion>({
    systemInstruction:
      "You are an experienced technical/behavioral interviewer. You ask one sharp, realistic interview question at a time, calibrated to the role.",
    prompt: `ROLE: ${roleTitle}

JOB DESCRIPTION:
${jobDescText}

${resumeText ? `CANDIDATE RESUME:\n${resumeText}\n` : ""}
Ask an opening interview question for this role. Prefer a question that lets the candidate introduce relevant experience. If a resume is provided, you may reference something specific from it.`,
    schema: questionSchema,
  });
}

/**
 * Core agentic loop step: evaluate the candidate's answer, and decide
 * autonomously whether the answer warrants a follow-up probe (the agent
 * digging deeper, as a real interviewer would) or whether to move on to
 * the next main question.
 */
export async function evaluateAnswer(params: {
  roleTitle: string;
  question: string;
  questionType: QuestionType;
  answerText: string;
}): Promise<AnswerFeedback> {
  return generateStructured<AnswerFeedback>({
    systemInstruction:
      "You are an experienced interviewer giving structured, constructive feedback on an interview answer. You decide whether the answer is specific and complete enough, or whether it needs a probing follow-up question (e.g. it was vague, lacked a concrete example, skipped a result/metric, or raised something worth digging into).",
    prompt: `ROLE: ${params.roleTitle}
QUESTION (${params.questionType}): ${params.question}

CANDIDATE ANSWER:
${params.answerText}

Evaluate this answer on a 1-5 scale. List concrete strengths and improvements. Give pointers on what an ideal answer would include. Decide if a follow-up probing question is warranted — if so, write one specific follow-up question that digs into a gap or vague point in the answer.`,
    schema: {
      type: SchemaType.OBJECT,
      properties: {
        score: { type: SchemaType.NUMBER },
        strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        improvements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        idealAnswerPointers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        shouldFollowUp: { type: SchemaType.BOOLEAN },
        followUpQuestion: { type: SchemaType.STRING },
      },
      required: ["score", "strengths", "improvements", "idealAnswerPointers", "shouldFollowUp"],
    },
  });
}

/**
 * Generates the next *main* interview question (not a follow-up probe),
 * aware of what's already been asked so the interview doesn't repeat itself
 * and progresses through a sensible mix of behavioral/technical questions.
 */
export async function generateNextQuestion(params: {
  roleTitle: string;
  jobDescText: string;
  askedQuestions: string[];
  questionNumber: number;
}): Promise<GeneratedQuestion> {
  return generateStructured<GeneratedQuestion>({
    systemInstruction:
      "You are an experienced interviewer running a structured mock interview. You vary question types (behavioral, technical, situational) and avoid repeating ground already covered.",
    prompt: `ROLE: ${params.roleTitle}

JOB DESCRIPTION:
${params.jobDescText}

QUESTIONS ALREADY ASKED:
${params.askedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") || "(none yet)"}

This is question #${params.questionNumber} of the interview. Ask the next question, choosing a type that gives good interview coverage given what's already been asked.`,
    schema: questionSchema,
  });
}

const questionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    question: { type: SchemaType.STRING },
    questionType: {
      type: SchemaType.STRING,
      enum: ["opening", "follow_up", "behavioral", "technical"],
    },
    rationale: { type: SchemaType.STRING },
  },
  required: ["question", "questionType", "rationale"],
};
