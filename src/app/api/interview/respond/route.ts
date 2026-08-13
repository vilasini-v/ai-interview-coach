import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateAnswer, generateNextQuestion } from "@/lib/agents/interviewAgent";

const MAX_QUESTIONS = 8;

export async function POST(req: NextRequest) {
  try {
    const { interviewSessionId, questionId, answerText, answerMode } = await req.json();

    if (!interviewSessionId || !questionId || !answerText) {
      return NextResponse.json(
        { error: "interviewSessionId, questionId, and answerText are required." },
        { status: 400 }
      );
    }

    const interview = await prisma.interviewSession.findUnique({
      where: { id: interviewSessionId },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!interview) return NextResponse.json({ error: "interview not found" }, { status: 404 });

    const currentQuestion = interview.questions.find(
      (q: (typeof interview.questions)[number]) => q.id === questionId
    );
    if (!currentQuestion) return NextResponse.json({ error: "question not found" }, { status: 404 });

    // Step 1: evaluate the answer just given.
    const feedback = await evaluateAnswer({
      roleTitle: interview.roleTitle,
      question: currentQuestion.question,
      questionType: currentQuestion.questionType as any,
      answerText,
    });

    await prisma.interviewQuestion.update({
      where: { id: questionId },
      data: {
        answerText,
        answerMode: answerMode ?? "typed",
        feedback: JSON.stringify(feedback),
        answeredAt: new Date(),
      },
    });

    const askedCount = interview.questions.length;
    const reachedCap = askedCount >= MAX_QUESTIONS;

    // Step 2: the agent autonomously decides what happens next —
    // probe deeper on this answer, ask the next main question, or wrap up.
    let nextQuestion = null as null | { id: string; question: string; questionType: string; order: number };

    if (!reachedCap && feedback.shouldFollowUp && feedback.followUpQuestion) {
      const created = await prisma.interviewQuestion.create({
        data: {
          interviewSessionId,
          order: askedCount + 1,
          question: feedback.followUpQuestion,
          questionType: "follow_up",
          parentId: currentQuestion.id,
        },
      });
      nextQuestion = created;
    } else if (!reachedCap) {
      const askedQuestions = interview.questions.map(
        (q: (typeof interview.questions)[number]) => q.question
      );
      const generated = await generateNextQuestion({
        roleTitle: interview.roleTitle,
        jobDescText: interview.jobDescText,
        askedQuestions,
        questionNumber: askedCount + 1,
      });
      const created = await prisma.interviewQuestion.create({
        data: {
          interviewSessionId,
          order: askedCount + 1,
          question: generated.question,
          questionType: generated.questionType,
        },
      });
      nextQuestion = created;
    } else {
      await prisma.interviewSession.update({
        where: { id: interviewSessionId },
        data: { status: "completed" },
      });
    }

    return NextResponse.json({ feedback, nextQuestion, completed: !nextQuestion });
  } catch (err: any) {
    console.error("interview respond error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to process answer." }, { status: 500 });
  }
}
