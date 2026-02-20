"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notVerified, setNotVerified] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError("");
    setNotVerified(false);

    // メール認証状態を事前確認
    const check = await fetch("/api/user/check-verified", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim() }),
    }).then((r) => r.json()).catch(() => ({ verified: true }));

    if (check.verified === false) {
      setNotVerified(true);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      username: username.trim(),
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("ユーザー名またはパスワードが違います");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-1">ログイン</h2>
      <p className="text-sm text-gray-500 mb-5">アカウントにサインイン</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setNotVerified(false); }}
          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          autoFocus
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          autoComplete="current-password"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {notVerified && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-3 text-sm">
            <p className="text-yellow-300 font-semibold mb-1">📬 メールアドレスが未認証です</p>
            <p className="text-yellow-200/70">
              登録時に送信した確認メールのリンクをクリックしてください。
            </p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !username.trim() || !password}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
        >
          {loading ? "確認中..." : "ログイン →"}
        </button>
      </form>
      <div className="flex justify-between mt-4 text-xs text-gray-500">
        <Link href="/register" className="hover:text-blue-400 transition-colors">
          新規登録
        </Link>
        <Link href="/reset-password" className="hover:text-blue-400 transition-colors">
          パスワードを忘れた
        </Link>
      </div>
    </div>
  );
}
