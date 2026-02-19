import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { rankColor } from "@/lib/utils";
import ActivityCalendar from "@/components/ActivityCalendar";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: { logs: true, goals: true, posts: true, follows: true, followers: true },
      },
    },
  });

  if (!user) return notFound();

  const isOwn = currentUserId === user.id;
  const isFollowing = currentUserId
    ? !!(await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: currentUserId, followingId: user.id } } }))
    : false;

  const recentLogs = await prisma.actionLog.findMany({
    where: { userId: user.id },
    include: { card: { include: { issue: true } } },
    orderBy: { doneAt: "desc" },
    take: 10,
  });

  const allLogs = await prisma.actionLog.findMany({
    where: { userId: user.id },
    select: { doneAt: true },
    take: 500,
  });

  const recentPosts = await prisma.post.findMany({
    where: { userId: user.id },
    include: { likes: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Badges
  const badges: { emoji: string; label: string }[] = [];
  if (user._count.logs >= 1) badges.push({ emoji: "🌱", label: "First Action" });
  if (user._count.logs >= 10) badges.push({ emoji: "⚡", label: "10 Actions" });
  if (user._count.logs >= 50) badges.push({ emoji: "🔥", label: "50 Actions" });
  if (user._count.logs >= 100) badges.push({ emoji: "💎", label: "Century" });
  if (user._count.goals >= 3) badges.push({ emoji: "🎯", label: "Goal Setter" });
  if (user._count.posts >= 5) badges.push({ emoji: "📢", label: "Sharer" });
  if (user.rank !== "Bronze") badges.push({ emoji: "🏅", label: user.rank });

  function formatTime(date: Date) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Profile header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/30 flex items-center justify-center text-2xl font-black text-blue-400">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{user.name}</h1>
              <p className="text-sm text-gray-500">@{user.username}</p>
              <p className={`text-sm font-semibold mt-1 ${rankColor(user.rank)}`}>🏅 {user.rank} · {user.points} pts</p>
            </div>
          </div>
          {!isOwn && currentUserId && (
            <form action={async () => {
              "use server";
              // handled client-side via component; this is placeholder
            }}>
              <FollowButton userId={user.id} isFollowing={isFollowing} />
            </form>
          )}
        </div>

        {user.bio && <p className="text-sm text-gray-400 mt-4">{user.bio}</p>}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-800 text-center">
          <div>
            <p className="text-lg font-black text-white">{user._count.logs}</p>
            <p className="text-xs text-gray-500">Actions</p>
          </div>
          <div>
            <p className="text-lg font-black text-white">{user._count.goals}</p>
            <p className="text-xs text-gray-500">Goals</p>
          </div>
          <div>
            <p className="text-lg font-black text-white">{user._count.follows}</p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
          <div>
            <p className="text-lg font-black text-white">{user._count.followers}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
        </div>
      </div>

      {/* Activity Calendar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Activity</h2>
        <ActivityCalendar logs={allLogs.map((l) => ({ doneAt: l.doneAt.toISOString() }))} />
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span key={b.label} className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full flex items-center gap-1.5">
                <span>{b.emoji}</span>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Actions */}
      {recentLogs.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Actions</h2>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                <span>{log.card.issue.emoji}</span>
                <Link href={`/cards/${log.card.id}`} className="text-sm text-gray-300 hover:text-blue-400 flex-1 truncate transition-colors">
                  {log.card.title}
                </Link>
                <span className="text-xs text-gray-600 shrink-0">{formatTime(log.doneAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Posts</h2>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="py-3 border-b border-gray-800 last:border-0">
                <p className="text-sm text-gray-300 leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                  <span>❤️ {post.likes.length}</span>
                  <span>{formatTime(post.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Client component for follow button
function FollowButton({ userId, isFollowing }: { userId: string; isFollowing: boolean }) {
  return (
    <a
      href={`/api/follow-toggle?targetUserId=${userId}&following=${isFollowing}`}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
        isFollowing
          ? "bg-gray-800 hover:bg-red-900/30 text-gray-300 hover:text-red-400 border border-gray-700"
          : "bg-blue-600 hover:bg-blue-500 text-white"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </a>
  );
}
