"use client";
import { useState } from "react";
import Link from "next/link";

const items = [
  { id: "q1", text: "この行動をするのは、他者に怒られたり批判されたりするのを避けたいからだ", type: "external" },
  { id: "q2", text: "この行動をするのは、それが自分にとって重要で価値があると信じているからだ", type: "identified" },
  { id: "q3", text: "この行動をするのは、やらないと罪悪感を感じたり恥ずかしくなるからだ", type: "introjected" },
  { id: "q4", text: "この行動をするのは、純粋に楽しくて面白いからだ", type: "intrinsic" },
  { id: "q5", text: "この行動をするのは、誰かに「やりなさい」と言われているからだ", type: "external" },
  { id: "q6", text: "この行動をするのは、自分の人生の目標やビジョンに合致しているからだ", type: "identified" },
  { id: "q7", text: "この行動をするのは、自分を責めるような声が頭の中にあるからだ", type: "introjected" },
  { id: "q8", text: "この行動をするのは、やっていると自然とワクワク・夢中になるからだ", type: "intrinsic" },
];

const typeInfo = {
  intrinsic: { label: "内的調整", emoji: "🌟", desc: "純粋な興味・楽しさから行動。最も持続的で幸福度が高い動機。", color: "emerald" },
  identified: { label: "同一化的調整", emoji: "🎯", desc: "行動の価値を自分のものとして内面化。強い自律的動機。", color: "blue" },
  introjected: { label: "取り入れ的調整", emoji: "😰", desc: "罪悪感・恥から行動。統制的動機で消耗しやすい。", color: "yellow" },
  external: { label: "外的調整", emoji: "⚡", desc: "外部のプレッシャーや報酬から行動。最も自律性が低い。", color: "red" },
};

type ScoreKey = "intrinsic" | "identified" | "introjected" | "external";

export default function ConcordancePage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const answered = Object.keys(answers).length;
  const total = items.length;

  async function complete() {
    if (answered < total) return;
    setSaving(true);
    const scores: Record<ScoreKey, number> = { intrinsic: 0, identified: 0, introjected: 0, external: 0 };
    const counts: Record<ScoreKey, number> = { intrinsic: 0, identified: 0, introjected: 0, external: 0 };
    for (const item of items) {
      if (answers[item.id] !== undefined) {
        scores[item.type as ScoreKey] += answers[item.id];
        counts[item.type as ScoreKey]++;
      }
    }
    const avg: Record<ScoreKey, number> = { intrinsic: 0, identified: 0, introjected: 0, external: 0 };
    for (const k of Object.keys(scores) as ScoreKey[]) {
      avg[k] = counts[k] > 0 ? Math.round((scores[k] / counts[k]) * 10) / 10 : 0;
    }
    // Self-concordance index: (intrinsic + identified) - (introjected + external)
    const sci = (avg.intrinsic + avg.identified) - (avg.introjected + avg.external);

    await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolName: "concordance", result: { averages: avg, selfConcordanceIndex: sci } }),
    });
    setSaving(false);
    setCompleted(true);
  }

  if (completed) {
    const scores: Record<ScoreKey, number> = { intrinsic: 0, identified: 0, introjected: 0, external: 0 };
    const counts: Record<ScoreKey, number> = { intrinsic: 0, identified: 0, introjected: 0, external: 0 };
    for (const item of items) {
      scores[item.type as ScoreKey] += answers[item.id] ?? 0;
      counts[item.type as ScoreKey]++;
    }
    const avg: Record<ScoreKey, number> = {} as any;
    for (const k of Object.keys(scores) as ScoreKey[]) {
      avg[k] = counts[k] > 0 ? Math.round((scores[k] / counts[k]) * 10) / 10 : 0;
    }
    const sci = Math.round(((avg.intrinsic + avg.identified) - (avg.introjected + avg.external)) * 10) / 10;
    const sciLabel = sci > 2 ? "High Self-Concordance" : sci > 0 ? "Moderate" : "Low Self-Concordance";
    const sciColor = sci > 2 ? "text-emerald-400" : sci > 0 ? "text-yellow-400" : "text-red-400";

    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <Link href="/tools" className="text-sm text-gray-500 hover:text-gray-300 mb-6 inline-block">← Toolbox</Link>
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🧭</div>
          <h1 className="text-2xl font-black text-white mb-2">Your Concordance Profile</h1>
          <div className={`text-lg font-bold ${sciColor}`}>{sciLabel}</div>
          <p className="text-gray-500 text-sm mt-1">Self-Concordance Index: <span className={sciColor}>{sci > 0 ? "+" : ""}{sci}</span></p>
        </div>

        <div className="space-y-3 mb-8">
          {(Object.keys(typeInfo) as ScoreKey[]).map((key) => {
            const info = typeInfo[key];
            const score = avg[key];
            const pct = Math.round((score / 7) * 100);
            const colorClass = {
              emerald: "bg-emerald-500",
              blue: "bg-blue-500",
              yellow: "bg-yellow-500",
              red: "bg-red-500",
            }[info.color];

            return (
              <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{info.emoji}</span>
                    <span className="text-sm font-semibold text-white">{info.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-300">{score}/7</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${colorClass} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-500">{info.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">What does this mean?</h3>
          <p className="text-sm text-gray-400">
            {sci > 2
              ? "You're acting from a place of genuine motivation. Your habits are likely to be sustainable and energizing."
              : sci > 0
              ? "You have a mix of intrinsic and external motivations. Consider deepening the connection to your personal values."
              : "Your actions may be driven more by external pressure. Try the Value Lantern tool to reconnect with what truly matters to you."}
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setAnswers({}); setCompleted(false); }}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors">
            Redo
          </button>
          <Link href="/tools/value-lantern" className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-medium text-center transition-colors">
            Try Value Lantern 🏮
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link href="/tools" className="text-sm text-gray-500 hover:text-gray-300 mb-6 inline-block">← Toolbox</Link>
      <div className="mb-8">
        <div className="text-4xl mb-3">🧭</div>
        <h1 className="text-2xl font-black text-white mb-2">Self-Concordance Assessment</h1>
        <p className="text-gray-500 text-sm">Think of a habit or goal you're working on. Rate each statement from 1 (not at all true) to 7 (completely true).</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(answered / total) * 100}%` }} />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{answered}/{total}</span>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item, idx) => (
          <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-300 mb-3">
              <span className="text-gray-600 text-xs mr-2">{idx + 1}.</span>
              {item.text}
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((v) => (
                <button
                  key={v}
                  onClick={() => setAnswers({ ...answers, [item.id]: v })}
                  className={`flex-1 h-8 rounded-lg text-xs font-bold transition-colors ${
                    answers[item.id] === v
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-600 mt-1 px-1">
              <span>Not at all</span>
              <span>Completely</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={complete}
        disabled={answered < total || saving}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
      >
        {saving ? "Saving..." : answered < total ? `Answer all questions (${total - answered} remaining)` : "See My Results →"}
      </button>
    </div>
  );
}
