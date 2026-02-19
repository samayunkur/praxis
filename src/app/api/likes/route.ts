import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { postId } = await req.json();
  try {
    await prisma.like.create({ data: { userId: session.user.id, postId } });
  } catch {
    // already liked
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { postId } = await req.json();
  await prisma.like.deleteMany({ where: { userId: session.user.id, postId } });
  return NextResponse.json({ success: true });
}
