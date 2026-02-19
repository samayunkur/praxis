import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pointsToRank } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const logs = await prisma.actionLog.findMany({
    where: { userId: session.user.id },
    include: { card: { include: { issue: true } } },
    orderBy: { doneAt: "desc" },
    take: limit,
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { cardId, goalId, note } = await req.json();
  if (!cardId) return NextResponse.json({ error: "cardId required" }, { status: 400 });

  const log = await prisma.actionLog.create({
    data: { userId: session.user.id, cardId, goalId, note, points: 10 },
  });

  // Update user points and rank
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { points: { increment: 10 } },
  });
  const newRank = pointsToRank(user.points);
  if (newRank !== user.rank) {
    await prisma.user.update({ where: { id: session.user.id }, data: { rank: newRank } });
  }

  return NextResponse.json(log);
}
