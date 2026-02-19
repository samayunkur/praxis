"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { difficultyColor, difficultyLabel } from "@/lib/utils";

interface Goal {
  id: string;
  frequency: string;
  targetDays: number;
  card: { id: string; title: string; issue: { emoji: string; name: string } };
  logs: { doneAt: string }[];
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function removeGoal(goalId: string) {
    await fetch("/api/goals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId }),
    });
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }

  async function logGoal(goalId: string, cardId: string) {
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, goalId }),
    });
    load();
  }

  function getStreak(logs: { doneAt: string }[]) {
    if (logs.length === 0) return 0;
    const sorted = [...logs].sort((a, b) => new Date(b.doneAt).getTime() - new Date(a.doneAt).getTime());
    let streak = 0;
    let prev = new Date();
    prev.setHours(0, 0, 0, 0);
    for (const log of sorted) {
      const d = new Date(log.doneAt);
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((prev.getTime() - d.getTime()) / 86400000);
      if (diff <= 1) {
        streak++;
        prev = d;
      } else break;
    }
    return streak;
  }

  function getTodayLogs(logs: { doneAt: string }[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return logs.filter((l) => new Date(l.doneAt) >= today).length;
  }

  // Mini calendar (last 7 days)
  function getWeekMap(logs: { doneAt: string }[]) {
    const map: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      map.push(logs.some((l) => new Date(l.doneAt) >= d && new Date(l.doneAt) < next));
    }
    return map;
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">📌 My Goals</h1>
          <p className="text-gray-500 mt-1">Track your daily commitments.</p>
        </div>
        <Link href="/issues" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors">
          + Add Goal
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">📌</p>
          <p className="font-medium">No goals yet</p>
          <p className="text-sm mt-2">Browse action cards and add them to your goals.</p>
          <Link href="/issues" className="mt-4 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-colors">
            Explore Cards →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const streak = getStreak(goal.logs);
            const todayDone = getTodayLogs(goal.logs) > 0;
            const weekMap = getWeekMap(goal.logs);
            const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
            const startDay = new Date();
            startDay.setDate(startDay.getDate() - 6);
            const labels = Array.from({ length: 7 }, (_, i) => {
              const d = new Date(startDay);
              d.setDate(startDay.getDate() + i);
              return dayLabels[d.getDay()];
            });

            return (
              <div key={goal.id} className={`bg-gray-900 border rounded-2xl p-5 ${todayDone ? "border-emerald-800/50" : "border-gray-800"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.card.issue.emoji}</span>
                    <div>
                      <Link href={`/cards/${goal.card.id}`} className="text-sm font-semibold text-white hover:text-blue-400 transition-colors">
                        {goal.card.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {goal.frequency} · {goal.card.issue.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {streak > 0 && (
                      <span className="text-xs text-orange-400 font-bold">🔥 {streak}d streak</span>
                    )}
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Week calendar */}
                <div className="flex gap-1 mb-4">
                  {weekMap.map((done, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-full h-7 rounded ${done ? "bg-emerald-500" : "bg-gray-800"}`} />
                      <span className="text-[10px] text-gray-600">{labels[i]}</span>
                    </div>
                  ))}
                </div>

                {/* Log button */}
                <button
                  onClick={() => logGoal(goal.id, goal.card.id)}
                  disabled={todayDone}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    todayDone
                      ? "bg-emerald-800/30 text-emerald-400 border border-emerald-700/50 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                  }`}
                >
                  {todayDone ? "✓ Done today!" : "✅ Mark as done today"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
