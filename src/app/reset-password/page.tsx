"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResetRequestPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/user/reset-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    setLoading(false);
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">⚗️</span>
          <h1 className="text-2xl font-black text-white mt-2">Praxis</h1>
          <p className="text-gray-400 text-sm mt-1">パスワードリセット</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          {done ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-3">📬</div>
              <p className="text-white font-semibold mb-2">メールを送信しました</p>
              <p className="text-gray-400 text-sm">
                登録済みのアドレスであれば、リセットリンクが届きます。（1時間有効）
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-gray-400 text-sm mb-2">
                登録したメールアドレスを入力してください。
              </p>
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-colors"
              >
                {loading ? "送信中..." : "リセットリンクを送る"}
              </button>
            </form>
          )}
          <p className="text-center mt-4 text-xs text-gray-500">
            <Link href="/" className="text-blue-400 hover:underline">ログインに戻る</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
