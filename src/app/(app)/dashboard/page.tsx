import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ActivityCalendar from "@/components/ActivityCalendar";
import { difficultyColor, difficultyLabel, rankColor } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const userId = session!.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const allCards = await prisma.actionCard.findMany({ include: { issue: true }, take: 100 });
  const randomCards = allCards.sort(() => Math.random() - 0.5).slice(0, 3);

  const goals = await prisma.goal.findMany({
    where: { userId, isActive: true },
    include: { card: { include: { issue: true } }, logs: { where: { doneAt: { gte: new Date(Date.now() - 7 * 86400000) } } } },
    take: 5,
  });

  const recentLogs = await prisma.actionLog.findMany({
    where: { userId },
    include: { card: { include: { issue: true } } },
    orderBy: { doneAt: "desc" },
    take: 5,
  });

  const allLogs = await prisma.actionLog.findMany({
    where: { userId },
    select: { doneAt: true },
    orderBy: { doneAt: "desc" },
    take: 500,
  });

  const nextRankPoints = { Bronze: 200, Silver: 800, Gold: 2000, Platinum: 5000, Diamond: 9999 };
  const currentPoints = user?.points ?? 0;
  const rank = user?.rank ?? "Bronze";
  const target = nextRankPoints[rank as keyof typeof nextRankPoints] ?? 200;
  const prevTarget = { Bronze: 0, Silver: 200, Gold: 800, Platinum: 2000, Diamond: 5000 }[rank as keyof typeof nextRankPoints] ?? 0;
  const pct = Math.min(100, Math.round(((currentPoints - prevTarget) / (target - prevTarget)) * 100));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Good {getTimeOfDay()}, {user?.name} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Science into action.</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${rankColor(rank)}`}>🏅 {rank}</p>
          <p className="text-sm text-gray-500">{currentPoints} pts</p>
        </div>
      </div>

      {/* Rank progress */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{rank}</span>
          <span>{pct}% to next rank</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Today's recommended actions */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">🎲 Suggested Today</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {randomCards.map((card) => (
            <Link key={card.id} href={`/cards/${card.id}`} className="bg-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-xl p-4 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{card.issue.emoji}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColor(card.difficulty)}`}>
                  {difficultyLabel(card.difficulty)}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">{card.title}</h3>
              <p className="text-xs text-gray-500">{card.duration}min · {card.issue.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Weekly goals */}
      {goals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">📌 This Week's Goals</h2>
            <Link href="/goals" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {goals.map((goal) => {
              const done = goal.logs.length;
              const target = goal.targetDays;
              const pct = Math.min(100, Math.round((done / target) * 100));
              return (
                <div key={goal.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span>{goal.card.issue.emoji}</span>
                    <p className="text-sm font-medium text-white flex-1 truncate">{goal.card.title}</p>
                    <span className="text-xs text-gray-500">{done}/{target}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Activity calendar */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">📅 Activity (365 days)</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <ActivityCalendar logs={allLogs.map(l => ({ doneAt: l.doneAt.toISOString() }))} />
        </div>
      </section>

      {/* Recent logs */}
      {recentLogs.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4">⚡ Recent Actions</h2>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <span>{log.card.issue.emoji}</span>
                <p className="text-sm text-gray-300 flex-1 truncate">{log.card.title}</p>
                <span className="text-xs text-gray-600">{formatTime(log.doneAt)}</span>
                <span className="text-xs text-emerald-400">+{log.points}pt</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function formatTime(date: Date) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}
