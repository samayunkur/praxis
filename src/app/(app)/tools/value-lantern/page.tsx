"use client";
import { useState } from "react";
import Link from "next/link";

const steps = [
  {
    key: "flame",
    emoji: "🔥",
    label: "Flame",
    title: "What sets you on fire?",
    description: "Think about moments when you felt completely alive and energized. What were you doing? What values were you expressing?",
    placeholder: "When I'm creating something new, teaching others, connecting with nature...",
    color: "from-orange-900/40 to-red-900/20 border-orange-800/50",
    accent: "text-orange-400",
  },
  {
    key: "protection",
    emoji: "🛡️",
    label: "Protection",
    title: "What do you protect above all else?",
    description: "What boundaries do you refuse to cross? What would you defend even at personal cost? These reveal your deepest values.",
    placeholder: "My honesty, my family's wellbeing, creative freedom...",
    color: "from-blue-900/40 to-indigo-900/20 border-blue-800/50",
    accent: "text-blue-400",
  },
  {
    key: "handle",
    emoji: "🤝",
    label: "Handle",
    title: "What do you handle with great care?",
    description: "What do you treat as precious and fragile? What requires your most careful, intentional attention?",
    placeholder: "Relationships, my own mental health, words I speak to others...",
    color: "from-emerald-900/40 to-teal-900/20 border-emerald-800/50",
    accent: "text-emerald-400",
  },
  {
    key: "light",
    emoji: "💡",
    label: "Light",
    title: "What do you want to illuminate?",
    description: "If you could shine a light on any dark corner of the world, what would it be? What truth do you want others to see?",
    placeholder: "The importance of self-compassion, injustice, the beauty in everyday moments...",
    color: "from-yellow-900/40 to-amber-900/20 border-yellow-800/50",
    accent: "text-yellow-400",
  },
];

export default function ValueLanternPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({ flame: "", protection: "", handle: "", light: "" });
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedValues, setSavedValues] = useState<string[]>([]);

  const current = steps[step];

  async function handleNext() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setSaving(true);
      // Extract core values from answers
      const values = Object.values(answers).flatMap(a =>
        a.split(/[,、・]/).map(v => v.trim()).filter(v => v.length > 2 && v.length < 50)
      ).slice(0, 8);
      setSavedValues(values);
      await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "value-lantern", result: { answers, extractedValues: values } }),
      });
      setSaving(false);
      setCompleted(true);
    }
  }

  if (completed) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <Link href="/tools" className="text-sm text-gray-500 hover:text-gray-300 mb-6 inline-block">← Toolbox</Link>
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏮</div>
          <h1 className="text-2xl font-black text-white mb-2">Your Value Lantern</h1>
          <p className="text-gray-500">These are the values illuminated through your reflections.</p>
        </div>

        <div className="space-y-4 mb-8">
          {steps.map((s) => (
            <div key={s.key} className={`bg-gradient-to-r ${s.color} border rounded-xl p-5`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{s.emoji}</span>
                <h3 className={`font-semibold ${s.accent}`}>{s.label}</h3>
              </div>
              <p className="text-sm text-gray-300">{answers[s.key] || "(no answer)"}</p>
            </div>
          ))}
        </div>

        {savedValues.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Core Values Identified</h3>
            <div className="flex flex-wrap gap-2">
              {savedValues.map((v, i) => (
                <span key={i} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-sm">
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => { setStep(0); setCompleted(false); setAnswers({ flame: "", protection: "", handle: "", light: "" }); }}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors">
            Redo Assessment
          </button>
          <Link href="/tools" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-center transition-colors">
            Back to Toolbox
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link href="/tools" className="text-sm text-gray-500 hover:text-gray-300 mb-6 inline-block">← Toolbox</Link>

      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? "bg-blue-500" : "bg-gray-800"}`} />
        ))}
      </div>

      <div className={`bg-gradient-to-br ${current.color} border rounded-2xl p-8`}>
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">{current.emoji}</span>
          <span className={`text-sm font-semibold uppercase tracking-wider ${current.accent}`}>{current.label}</span>
          <h2 className="text-xl font-black text-white mt-2 mb-3">{current.title}</h2>
          <p className="text-sm text-gray-400">{current.description}</p>
        </div>

        <textarea
          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none text-sm"
          rows={4}
          placeholder={current.placeholder}
          value={answers[current.key]}
          onChange={(e) => setAnswers({ ...answers, [current.key]: e.target.value })}
        />

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-4 py-2 text-sm text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
          >
            ← Back
          </button>
          <span className="text-xs text-gray-600">{step + 1} / {steps.length}</span>
          <button
            onClick={handleNext}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${current.accent === "text-orange-400" ? "bg-orange-600 hover:bg-orange-500" : current.accent === "text-blue-400" ? "bg-blue-600 hover:bg-blue-500" : current.accent === "text-emerald-400" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-yellow-600 hover:bg-yellow-500"}`}
          >
            {saving ? "Saving..." : step === steps.length - 1 ? "Complete ✓" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
