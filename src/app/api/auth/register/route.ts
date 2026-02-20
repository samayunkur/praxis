import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password)
      return NextResponse.json({ error: "全ての項目を入力してください" }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "パスワードは8文字以上にしてください" }, { status: 400 });

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existingUser?.username === username)
      return NextResponse.json({ error: "そのユーザー名は既に使われています" }, { status: 409 });
    if (existingUser?.email === email)
      return NextResponse.json({ error: "そのメールアドレスは既に登録されています" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { username, email, name: username, password: hashed },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}
