"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import StarRating from "@/components/StarRating";
import { difficultyColor, difficultyLabel } from "@/lib/utils";

interface Card {
  id: string;
  title: string;
  description: string;
  detail: string;
  evidence: string | null;
  difficulty: number;
  duration: number;
  impact: number;
  issue: { id: string; name: string; emoji: string };
}

function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '')
    .split('\n').filter(Boolean).join('\n');
}

export default function CardDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [addingGoal, setAddingGoal] = useState(false);
  const [logDone, setLogDone] = useState(false);
  const [goalDone, setGoalDone] = useState(false);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [relatedCards, setRelatedCards] = useState<Card[]>([]);

  useEffect(() => {
    fetch(`/api/cards/${params.id}`).then(r => r.json()).then(data => {
      setCard(data.card);
      setRelatedCards(data.related ?? []);
      setLoading(false);
    });
  }, [params.id]);

  async function logAction() {
    setLogging(true);
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: params.id, note }),
    });
    setLogDone(true);
    setLogging(false);
    setShowNote(false);
  }

  async function addGoal() {
    setAddingGoal(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: params.id }),
    });
    if (res.status === 409) {
      alert("Already in your goals!");
    } else {
      setGoalDone(true);
    }
    setAddingGoal(false);
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!card) return <div className="p-8 text-gray-500">Card not found.</div>;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <Link href={`/issues/${card.issue.id}`} className="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">
        ← {card.issue.emoji} {card.issue.name}
      </Link>

      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColor(card.difficulty)}`}>
            {difficultyLabel(card.difficulty)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">⏱ {card.duration} min</span>
        </div>
        <h1 className="text-xl font-black text-white mb-3">{card.title}</h1>
        <p className="text-gray-400 mb-4">{card.description}</p>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-800">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Difficulty</p>
            <StarRating value={card.difficulty} />
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Duration</p>
            <p className="text-sm font-semibold text-white">{card.duration}m</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Life Impact</p>
            <StarRating value={card.impact} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {!logDone ? (
            <button
              onClick={() => setShowNote(true)}
              disabled={logging}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50"
            >
              ✅ Done it!
            </button>
          ) : (
            <div className="flex-1 py-3 rounded-xl bg-emerald-800/30 text-emerald-400 font-semibold text-center border border-emerald-700/50">
              ✓ Logged! +10 pts
            </div>
          )}
          <button
            onClick={addGoal}
            disabled={addingGoal || goalDone}
            className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {goalDone ? "📌 Added to Goals!" : addingGoal ? "Adding..." : "📌 Add to Goals"}
          </button>
        </div>

        {/* Note input */}
        {showNote && (
          <div className="mt-4 space-y-2">
            <textarea
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              rows={2}
              placeholder="Add a note (optional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={logAction} disabled={logging} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-medium transition-colors disabled:opacity-50">
                {logging ? "Saving..." : "Save"}
              </button>
              <button onClick={() => { setShowNote(false); logAction(); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors">
                Skip note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail (markdown) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">How it works</h2>
        <div
          className="prose-dark"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(card.detail) }}
        />
      </div>

      {/* Evidence */}
      {card.evidence && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">🔬 Scientific Evidence</h2>
          <p className="text-xs text-gray-500 italic leading-relaxed">{card.evidence}</p>
        </div>
      )}

      {/* Related cards */}
      {relatedCards.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Related Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedCards.map((rc) => (
              <Link key={rc.id} href={`/cards/${rc.id}`} className="bg-gray-900 border border-gray-800 hover:border-blue-500/40 rounded-xl p-4 transition-colors group">
                <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">{rc.title}</p>
                <p className="text-xs text-gray-500 mt-1">{rc.duration}min</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
