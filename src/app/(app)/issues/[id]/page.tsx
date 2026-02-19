import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { difficultyColor, difficultyLabel } from "@/lib/utils";
import StarRating from "@/components/StarRating";

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const userId = session!.user.id;
  const { id } = await params;

  const issue = await prisma.issue.findUnique({
    where: { id },
    include: {
      cards: {
        include: {
          logs: { where: { userId }, take: 1 },
          tags: { include: { tag: true } },
        },
      },
    },
  });

  if (!issue) return notFound();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <Link href="/issues" className="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">← Issues</Link>
      <div className="flex items-center gap-4 mb-2">
        <span className="text-5xl">{issue.emoji}</span>
        <div>
          <h1 className="text-3xl font-black text-white">{issue.name}</h1>
          <p className="text-gray-400 mt-1">{issue.description}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-8">{issue.cards.length} action cards</p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {issue.cards.map((card) => {
          const done = card.logs.length > 0;
          return (
            <Link key={card.id} href={`/cards/${card.id}`} className={`bg-gray-900 border rounded-xl p-5 hover:border-blue-500/50 transition-all group ${done ? "border-emerald-800/50" : "border-gray-800"}`}>
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColor(card.difficulty)}`}>
                  {difficultyLabel(card.difficulty)}
                </span>
                {done && <span className="text-xs text-emerald-400">✓ Done</span>}
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors mb-2 leading-snug">
                {card.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{card.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>⏱ {card.duration}min</span>
                  <span>⚡ Impact</span>
                  <StarRating value={card.impact} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
