import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/", req.url));
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("targetUserId");
  const following = searchParams.get("following") === "true";
  const referer = req.headers.get("referer") ?? "/feed";

  if (!targetUserId) return NextResponse.redirect(new URL(referer, req.url));

  if (following) {
    await prisma.follow.deleteMany({ where: { followerId: session.user.id, followingId: targetUserId } });
  } else {
    try {
      await prisma.follow.create({ data: { followerId: session.user.id, followingId: targetUserId } });
    } catch {}
  }
  return NextResponse.redirect(new URL(referer, req.url));
}
