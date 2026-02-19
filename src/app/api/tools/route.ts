import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { toolName, result } = await req.json();
  const saved = await prisma.toolResult.create({
    data: { userId: session.user.id, toolName, result: JSON.stringify(result) },
  });
  return NextResponse.json(saved);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const toolName = searchParams.get("toolName");
  const results = await prisma.toolResult.findMany({
    where: { userId: session.user.id, ...(toolName ? { toolName } : {}) },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  return NextResponse.json(results);
}
