import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runResumeAgent } from "@/lib/agents/resumeAgent";

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobTitle, jobDescText } = await req.json();

    if (!resumeText || !jobTitle || !jobDescText) {
      return NextResponse.json(
        { error: "resumeText, jobTitle, and jobDescText are all required." },
        { status: 400 }
      );
    }

    const result = await runResumeAgent(resumeText, jobTitle, jobDescText);

    const session = await prisma.resumeSession.create({
      data: {
        resumeText,
        jobTitle,
        jobDescText,
        gapAnalysis: JSON.stringify(result.gapAnalysis),
        keywordMatch: JSON.stringify(result.keywordMatch),
        rewrites: JSON.stringify(result.rewrites),
        agentTrace: JSON.stringify(result.agentTrace),
      },
    });

    return NextResponse.json({ sessionId: session.id, ...result });
  } catch (err: any) {
    console.error("resume analyze error:", err);
    return NextResponse.json({ error: err.message ?? "Analysis failed." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const session = await prisma.resumeSession.findUnique({ where: { id } });
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    sessionId: session.id,
    jobTitle: session.jobTitle,
    jobDescText: session.jobDescText,
    resumeText: session.resumeText,
    gapAnalysis: JSON.parse(session.gapAnalysis ?? "null"),
    keywordMatch: JSON.parse(session.keywordMatch ?? "null"),
    rewrites: JSON.parse(session.rewrites ?? "[]"),
    agentTrace: JSON.parse(session.agentTrace ?? "[]"),
  });
}