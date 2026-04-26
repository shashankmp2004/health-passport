import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { buildRoleAwareContext } from "@/lib/ai/context";
import { generateGeminiAnswer, type GeminiMessage } from "@/lib/ai/gemini";

type ChatBody = {
  message?: string;
  history?: GeminiMessage[];
};

function getSystemPrompt(role: string, scopeType: string) {
  const common = [
    "You are HealthPassport Assistant.",
    "You receive a JSON dataset that represents data stored in MongoDB for the current user scope.",
    "Answer only from that JSON dataset and user question.",
    "If data is missing in JSON, clearly say it is not available in database records.",
    "Never invent numbers, medications, dates, or diagnoses.",
    "For counts/statistics, compute directly from provided JSON.",
    "For list questions, provide exact matching records from JSON.",
    "Keep answers concise and practical, but complete.",
    "Do not provide medical diagnosis; advise consulting a clinician for medical decisions.",
  ];

  if (role === "patient") {
    return [
      ...common,
      "Audience: patient viewing own records.",
      "Allowed: answer any question about the patient dataset fields.",
      "Scope type: " + scopeType,
    ].join("\n");
  }

  if (role === "admin") {
    return [
      ...common,
      "Audience: admin doing system-level operational analysis.",
      "Allowed: answer any question over patient/doctor/hospital/record/notification datasets.",
      "Avoid exposing unnecessary patient-level PHI unless explicitly requested and present.",
      "Scope type: " + scopeType,
    ].join("\n");
  }

  return [
    ...common,
    "Audience: hospital/doctor staff in scoped portal context.",
    "Allowed: answer any question using scoped datasets only.",
    "Do not claim access outside available records.",
    "Scope type: " + scopeType,
  ].join("\n");
}

function sanitizeHistory(history: GeminiMessage[] | undefined) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((entry) => entry && (entry.role === "user" || entry.role === "model"))
    .map((entry) => ({
      role: entry.role,
      text: String(entry.text || "").slice(0, 3000),
    }))
    .slice(-12);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !["patient", "doctor", "hospital", "admin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ChatBody;
    const message = (body?.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const context = await buildRoleAwareContext(session);
    const systemPrompt = getSystemPrompt(
      session.user.role,
      context.scope.scopeType,
    );

    const history = sanitizeHistory(body.history);
    const messages: GeminiMessage[] = [
      {
        role: "user",
        text: `Database context JSON (authoritative source):\n${JSON.stringify(context)}`,
      },
      ...history,
      {
        role: "user",
        text: message,
      },
    ];

    const answer = await generateGeminiAnswer({
      systemPrompt,
      messages,
    });

    return NextResponse.json({
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate AI response",
      },
      { status: 500 },
    );
  }
}
