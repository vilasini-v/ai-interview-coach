import { generateStructured, SchemaType } from "@/lib/gemini";
import type {
  AgentStep,
  BulletRewrite,
  GapAnalysis,
  KeywordMatch,
  ResumeAnalysisResult,
} from "@/lib/types";

/**
 * Agentic resume coach.
 *
 * This is deliberately implemented as a sequence of small, single-purpose
 * Gemini calls rather than one big prompt, so each step:
 *   1. has a narrow, verifiable job (easier to get structured output right)
 *   2. can feed its output forward as context to later steps
 *   3. is logged into an agent trace the UI can show, so the "autonomous
 *      multi-step analysis" is actually visible, not just a black box.
 */
export async function runResumeAgent(
  resumeText: string,
  jobTitle: string,
  jobDescText: string
): Promise<ResumeAnalysisResult> {
  const trace: AgentStep[] = [];
  const log = (step: string, summary: string) =>
    trace.push({ step, summary, timestamp: new Date().toISOString() });

  // --- Step 1: Gap identification ---------------------------------------
  log("gap_identification", "Comparing resume against job requirements to find gaps and strengths.");
  const gapAnalysis = await generateStructured<GapAnalysis>({
    systemInstruction:
      "You are a precise, honest career coach. You identify real gaps between a resume and a target job, without inventing skills the candidate doesn't have or being needlessly harsh. Be specific and concrete.",
    prompt: `JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescText}

RESUME:
${resumeText}

Analyze how well this resume fits this job. Identify missing skills, missing experience, and genuine strengths that match the role.`,
    schema: {
      type: SchemaType.OBJECT,
      properties: {
        overallFit: { type: SchemaType.STRING, enum: ["strong", "moderate", "weak"] },
        summary: { type: SchemaType.STRING },
        missingSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        missingExperience: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: ["overallFit", "summary", "missingSkills", "missingExperience", "strengths"],
    },
  });
  log("gap_identification_complete", `Overall fit assessed as "${gapAnalysis.overallFit}".`);

  // --- Step 2: ATS keyword matching ---------------------------------------
  log("ats_keyword_matching", "Extracting ATS-relevant keywords from the job description and checking resume coverage.");
  const keywordMatch = await generateStructured<KeywordMatch>({
    systemInstruction:
      "You simulate how an Applicant Tracking System (ATS) parses resumes for keyword matches. Extract the concrete, screenable keywords (tools, skills, certifications, methodologies) from the job description, then check which appear meaningfully in the resume.",
    prompt: `JOB DESCRIPTION:
${jobDescText}

RESUME:
${resumeText}

Extract the key ATS-screenable terms from the job description, determine which are present vs missing in the resume, and give a 0-100 match score.`,
    schema: {
      type: SchemaType.OBJECT,
      properties: {
        matchScorePct: { type: SchemaType.NUMBER },
        matchedKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        missingKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        notes: { type: SchemaType.STRING },
      },
      required: ["matchScorePct", "matchedKeywords", "missingKeywords", "notes"],
    },
  });
  log("ats_keyword_matching_complete", `Keyword match score: ${keywordMatch.matchScorePct}%.`);

  // --- Step 3: Tailored bullet-point rewriting ----------------------------
  // Feeds forward the gap analysis + missing keywords so rewrites actually
  // target the identified weaknesses, rather than rewriting blind.
  log("bullet_rewriting", "Rewriting resume bullet points to close identified gaps and surface missing keywords.");
  const rewriteResult = await generateStructured<{ rewrites: BulletRewrite[] }>({
    systemInstruction:
      "You are an expert resume writer. You rewrite bullet points to be more specific, quantified, and aligned with a target job — without fabricating experience, tools, or metrics the candidate never mentioned. Only reweave language and emphasis using facts already present in the resume.",
    prompt: `JOB TITLE: ${jobTitle}

MISSING KEYWORDS TO WORK IN WHERE HONEST: ${keywordMatch.missingKeywords.join(", ") || "none"}

IDENTIFIED GAPS TO ADDRESS THROUGH FRAMING (not fabrication): ${gapAnalysis.missingSkills.join(", ") || "none"}

RESUME:
${resumeText}

Select the 5-8 most impactful bullet points from this resume and rewrite each to better match the job, using only facts already in the resume. For each, explain briefly why the rewrite is stronger and which target keywords it now surfaces.`,
    schema: {
      type: SchemaType.OBJECT,
      properties: {
        rewrites: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              original: { type: SchemaType.STRING },
              rewritten: { type: SchemaType.STRING },
              rationale: { type: SchemaType.STRING },
              targetKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ["original", "rewritten", "rationale", "targetKeywords"],
          },
        },
      },
      required: ["rewrites"],
    },
  });
  log("bullet_rewriting_complete", `Rewrote ${rewriteResult.rewrites.length} bullet points.`);

  return {
    gapAnalysis,
    keywordMatch,
    rewrites: rewriteResult.rewrites,
    agentTrace: trace,
  };
}
