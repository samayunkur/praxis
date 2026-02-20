import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ログイン前にメール認証状態を確認するエンドポイント
// セキュリティ: ユーザーが存在しない場合も verified: true を返して存在有無を隠す
// unverified の場合のみ verified: false を返す
export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) return NextResponse.json({ verified: true });

    const user = await prisma.user.findUnique({
      where: { username },
      select: { emailVerified: true },
    });

    if (!user || user.emailVerified) return NextResponse.json({ verified: true });
    return NextResponse.json({ verified: false });
  } catch {
    return NextResponse.json({ verified: true }); // エラー時はログイン試行に任せる
  }
}
