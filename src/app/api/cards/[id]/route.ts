import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await prisma.actionCard.findUnique({
    where: { id },
    include: { issue: true, tags: { include: { tag: true } } },
  });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const related = await prisma.actionCard.findMany({
    where: { issueId: card.issueId, id: { not: id } },
    include: { issue: true },
    take: 4,
  });

  return NextResponse.json({ card, related });
}
