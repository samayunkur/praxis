"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("パスワードが一致しません"); return; }
    if (password.length < 8) { setError("パスワードは8文字以上にしてください"); return; }
    setLoading(true);

    const { token } = await params;
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "リセットに失敗しました"); return; }

    setDone(true);
    setTimeout(() => router.push("/"), 2000);
  }

  if (done) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">✅</div>
        <p className="text-white font-semibold">パスワードを変更しました。ログイン画面へ移動します…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">⚗️</span>
          <h1 className="text-2xl font-black text-white mt-2">Praxis</h1>
          <p className="text-gray-400 text-sm mt-1">新しいパスワードを設定</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              placeholder="新しいパスワード（8文字以上）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <input
              type="password"
              placeholder="パスワード（確認）"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password || !confirm}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              {loading ? "変更中..." : "パスワードを変更する"}
            </button>
          </form>
          <p className="text-center mt-4 text-xs text-gray-500">
            <Link href="/" className="text-blue-400 hover:underline">ログインに戻る</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
