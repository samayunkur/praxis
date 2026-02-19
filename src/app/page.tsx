"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
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
      setError("Login failed. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  const features = [
    { icon: "🃏", title: "Action Cards", desc: "Evidence-based micro-actions for every area of life" },
    { icon: "📌", title: "Goal Tracking", desc: "Set daily goals and visualize your streaks" },
    { icon: "🧰", title: "Science Tools", desc: "Value Lantern, Concordance assessment & more" },
    { icon: "🌐", title: "Community", desc: "Share wins and follow peers on their journey" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="text-5xl">⚗️</span>
            <h1 className="text-5xl font-black text-white tracking-tight">Praxis</h1>
          </div>
          <p className="text-2xl font-light text-blue-400 mb-4 italic">Science into action.</p>
          <p className="text-gray-400 max-w-md mx-auto text-lg">
            Build better habits with evidence-based action plans.
            Backed by research, designed for real life.
          </p>
        </div>

        {/* Login form */}
        <div className="w-full max-w-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">Get started</h2>
            <p className="text-sm text-gray-500 mb-5">Enter a username to start your journey</p>
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
                {loading ? "Entering..." : "Enter Praxis →"}
              </button>
            </form>
            <p className="text-xs text-gray-600 text-center mt-4">
              New username? An account is created automatically.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl w-full">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-700">
        © 2025 Praxis · Science into action.
      </footer>
    </div>
  );
}
