import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOpeningQuestion } from "@/lib/agents/interviewAgent";

export async function POST(req: NextRequest) {
  try {
    const { roleTitle, jobDescText, resumeSessionId, resumeText } = await req.json();

    if (!roleTitle || !jobDescText) {
      return NextResponse.json(
        { error: "roleTitle and jobDescText are required." },
        { status: 400 }
      );
    }

    const opening = await generateOpeningQuestion(roleTitle, jobDescText, resumeText);

    const session = await prisma.interviewSession.create({
      data: {
        roleTitle,
        jobDescText,
        resumeSessionId: resumeSessionId ?? null,
        questions: {
          create: [
            {
              order: 1,
              question: opening.question,
              questionType: opening.questionType,
            },
          ],
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({
      interviewSessionId: session.id,
      question: session.questions[0],
    });
  } catch (err: any) {
    console.error("interview start error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to start interview." }, { status: 500 });
  }
}
