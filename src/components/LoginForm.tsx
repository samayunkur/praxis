"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { username: username.trim(), redirect: false });
    if (result?.error) {
      setError("ログインに失敗しました。再度お試しください。");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-1">はじめる</h2>
      <p className="text-sm text-gray-500 mb-5">ユーザー名を入力してスタート</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="your_username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
        >
          {loading ? "確認中..." : "Praxis に入る →"}
        </button>
      </form>
      <p className="text-xs text-gray-600 text-center mt-4">
        新規ユーザー名でも自動的にアカウントが作成されます。
      </p>
    </div>
  );
}
