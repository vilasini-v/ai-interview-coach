import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await prisma.interviewSession.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    id: session.id,
    roleTitle: session.roleTitle,
    status: session.status,
    questions: session.questions.map((q: (typeof session.questions)[number]) => ({
      ...q,
      feedback: q.feedback ? JSON.parse(q.feedback) : null,
    })),
  });
}
