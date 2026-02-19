import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "all";
  const cursor = searchParams.get("cursor");

  let whereClause: any = {};
  if (filter === "following" && session?.user?.id) {
    const follows = await prisma.follow.findMany({ where: { followerId: session.user.id }, select: { followingId: true } });
    const ids = follows.map((f) => f.followingId);
    ids.push(session.user.id);
    whereClause = { userId: { in: ids } };
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    include: {
      user: { select: { id: true, username: true, name: true, image: true } },
      likes: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { content, cardId } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const post = await prisma.post.create({
    data: { userId: session.user.id, content: content.trim(), cardId: cardId ?? null },
    include: { user: { select: { id: true, username: true, name: true, image: true } }, likes: true },
  });
  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { postId } = await req.json();
  await prisma.post.deleteMany({ where: { id: postId, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
