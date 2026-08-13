import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Lazy-required to avoid pulling pdf-parse's debug entrypoint into the
    // Next.js build graph at import time.
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);

    return NextResponse.json({ text: parsed.text.trim() });
  } catch (err: any) {
    console.error("resume parse error:", err);
    return NextResponse.json({ error: "Couldn't read that PDF. Try pasting the text instead." }, { status: 500 });
  }
}
