import { NextResponse } from "next/server";
import { routeQuestion } from "../../core/router";
import type { AnswerId, FollowUpId } from "../../types/core";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const input: string = body.input || "";

    // Accept either field from the client:
    const targetAnswerId: AnswerId | undefined = body.targetAnswerId;
    const followUpId: FollowUpId | undefined = body.followUpId;

    // Normalize to a single "target" id
    const targetId: AnswerId | FollowUpId | undefined = followUpId ?? targetAnswerId;

    const result = routeQuestion(input, { targetAnswerId: targetId });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}