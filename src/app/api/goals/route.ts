import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id, isActive: true },
    include: {
      card: { include: { issue: true } },
      logs: { orderBy: { doneAt: "desc" }, take: 30 },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { cardId, frequency, targetDays } = await req.json();
  if (!cardId) return NextResponse.json({ error: "cardId required" }, { status: 400 });

  // Check duplicate
  const existing = await prisma.goal.findFirst({
    where: { userId: session.user.id, cardId, isActive: true },
  });
  if (existing) return NextResponse.json({ error: "Already in goals" }, { status: 409 });

  const goal = await prisma.goal.create({
    data: { userId: session.user.id, cardId, frequency: frequency ?? "daily", targetDays: targetDays ?? 7 },
    include: { card: { include: { issue: true } } },
  });
  return NextResponse.json(goal);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { goalId } = await req.json();
  await prisma.goal.update({ where: { id: goalId, userId: session.user.id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
