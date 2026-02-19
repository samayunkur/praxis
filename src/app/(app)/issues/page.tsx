import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const colorMap: Record<string, string> = {
  blue: "from-blue-900/30 to-blue-800/10 border-blue-800/50",
  green: "from-green-900/30 to-green-800/10 border-green-800/50",
  emerald: "from-emerald-900/30 to-emerald-800/10 border-emerald-800/50",
  purple: "from-purple-900/30 to-purple-800/10 border-purple-800/50",
  pink: "from-pink-900/30 to-pink-800/10 border-pink-800/50",
  orange: "from-orange-900/30 to-orange-800/10 border-orange-800/50",
  yellow: "from-yellow-900/30 to-yellow-800/10 border-yellow-800/50",
};

export default async function IssuesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const userId = session!.user.id;

  const issues = await prisma.issue.findMany({
    include: { cards: { include: { logs: { where: { userId } } } } },
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">🎯 Life Issues</h1>
        <p className="text-gray-500 mt-1">Choose an area to explore evidence-based action cards.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => {
          const totalCards = issue.cards.length;
          const completedCards = issue.cards.filter((c) => c.logs.length > 0).length;
          const pct = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
          const gradient = colorMap[issue.color] ?? "from-gray-900/30 to-gray-800/10 border-gray-800/50";

          return (
            <Link
              key={issue.id}
              href={`/issues/${issue.id}`}
              className={`bg-gradient-to-br ${gradient} border rounded-2xl p-5 hover:scale-[1.02] transition-all group`}
            >
              <div className="text-4xl mb-3">{issue.emoji}</div>
              <h2 className="text-lg font-bold text-white mb-1">{issue.name}</h2>
              <p className="text-xs text-gray-400 mb-4 line-clamp-2">{issue.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{totalCards} cards</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pct > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-800 text-gray-500"}`}>
                  {pct > 0 ? `${pct}% done` : "Start"}
                </span>
              </div>
              {pct > 0 && (
                <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
