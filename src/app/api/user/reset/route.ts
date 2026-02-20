import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password)
      return NextResponse.json({ error: "無効なリクエストです" }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "パスワードは8文字以上にしてください" }, { status: 400 });

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.used || record.expiresAt < new Date())
      return NextResponse.json({ error: "リンクが無効または期限切れです" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
      prisma.passwordResetToken.update({ where: { token }, data: { used: true } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "リセットに失敗しました" }, { status: 500 });
  }
}
