import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ ok: true }); // セキュリティ：存在有無を漏らさない

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1時間

      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });

      await sendPasswordResetEmail(email, token).catch((e) =>
        console.error("Reset email failed:", e)
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "エラーが発生しました" }, { status: 500 });
  }
}
