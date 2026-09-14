import { NextRequest, NextResponse } from "next/server";
import { classifyProblem } from "@/lib/ai";

// This is the only place that talks to the AI provider. The frontend never
// sees an API key - it just POSTs raw text here and gets back structured
// suggestions. That satisfies the brief's requirement that the API key must
// not be exposed in frontend code.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Missing 'text' field" }, { status: 400 });
  }

  if (text.length > 2000) {
    return NextResponse.json({ error: "Description is too long" }, { status: 400 });
  }

  try {
    const items = await classifyProblem(text);
    return NextResponse.json({ items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Classification failed" }, { status: 500 });
  }
}
