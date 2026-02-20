import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token)
    return NextResponse.json({ error: "トークンがありません" }, { status: 400 });

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });

  if (!record || record.used || record.expiresAt < new Date())
    return NextResponse.redirect(new URL("/verify-email/invalid", req.url));

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
    prisma.emailVerificationToken.update({ where: { token }, data: { used: true } }),
  ]);

  return NextResponse.redirect(new URL("/verify-email/success", req.url));
}
