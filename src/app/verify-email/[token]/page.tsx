export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });

  if (!record || record.used || record.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-white mb-2">リンクが無効です</h1>
          <p className="text-gray-400 text-sm mb-6">
            リンクの有効期限が切れているか、すでに使用済みです。<br />
            再度アカウント登録を行ってください。
          </p>
          <Link href="/register" className="text-blue-400 hover:underline text-sm">
            登録ページへ
          </Link>
        </div>
      </div>
    );
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
    prisma.emailVerificationToken.update({ where: { token }, data: { used: true } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-white mb-2">メール認証が完了しました</h1>
        <p className="text-gray-400 text-sm mb-6">
          アカウントが有効化されました。<br />
          ログインしてPraxisを始めましょう。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
        >
          ログインする
        </Link>
      </div>
    </div>
  );
}
