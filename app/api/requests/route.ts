import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  getAllRequests,
  saveRequests,
  clearAllRequests,
} from "@/lib/store";
import {
  CATEGORIES,
  Category,
  Priority,
  ServiceRequest,
} from "@/lib/types";

const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.value));

export async function GET() {
  return NextResponse.json({
    requests: getAllRequests(),
  });
}

// Save confirmed requests
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : null;

  if (!items || items.length === 0) {
    return NextResponse.json(
      { error: "No items to save" },
      { status: 400 }
    );
  }

  for (const item of items) {
    if (
      typeof item.description !== "string" ||
      !item.description.trim()
    ) {
      return NextResponse.json(
        { error: "Each item needs a description" },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.has(item.category as Category)) {
      return NextResponse.json(
        { error: `Invalid category: ${item.category}` },
        { status: 400 }
      );
    }

    if (
      item.priority !== "normal" &&
      item.priority !== "urgent"
    ) {
      return NextResponse.json(
        { error: `Invalid priority: ${item.priority}` },
        { status: 400 }
      );
    }
  }

  const groupId = randomUUID();
  const now = new Date().toISOString();

  const toSave: ServiceRequest[] = items.map((item: any) => ({
    id: randomUUID(),
    description: item.description.trim(),
    category: item.category as Category,
    priority: item.priority as Priority,
    createdAt: now,
    groupId,
  }));

  const all = saveRequests(toSave);

  return NextResponse.json(
    {
      requests: toSave,
      total: all.length,
    },
    { status: 201 }
  );
}

// Delete ALL requests
export async function DELETE() {
  clearAllRequests();

  return NextResponse.json({
    success: true,
    message: "All requests deleted",
    requests: [],
  });
}