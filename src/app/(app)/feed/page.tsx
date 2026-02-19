"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Post {
  id: string;
  content: string;
  cardId: string | null;
  createdAt: string;
  user: { id: string; username: string; name: string; image: string | null };
  likes: { userId: string }[];
}

export default function FeedPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<"all" | "following">("all");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load(f = filter) {
    setLoading(true);
    const res = await fetch(`/api/posts?filter=${f}`);
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  }

  useEffect(() => { load(filter); }, [filter]);

  async function post() {
    if (!content.trim()) return;
    setPosting(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const newPost = await res.json();
    setPosts((prev) => [newPost, ...prev]);
    setContent("");
    setPosting(false);
  }

  async function toggleLike(postId: string, liked: boolean) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const userId = session?.user?.id ?? "";
        return {
          ...p,
          likes: liked
            ? p.likes.filter((l) => l.userId !== userId)
            : [...p.likes, { userId }],
        };
      })
    );
    await fetch("/api/likes", {
      method: liked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
  }

  function formatTime(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-white mb-6">🌐 Feed</h1>

      {/* Post composer */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
        <textarea
          className="w-full bg-transparent text-white placeholder-gray-600 text-sm resize-none focus:outline-none"
          rows={3}
          placeholder="Share your win, reflection, or insight..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-800">
          <span className="text-xs text-gray-600">{content.length}/280</span>
          <button
            onClick={post}
            disabled={posting || !content.trim() || content.length > 280}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "following"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {f === "all" ? "🌍 All" : "👥 Following"}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🌐</p>
          <p>No posts yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const liked = post.likes.some((l) => l.userId === session?.user?.id);
            return (
              <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Link href={`/${post.user.username}`}>
                    <div className="w-9 h-9 rounded-full bg-blue-500/30 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0">
                      {post.user.name?.[0]?.toUpperCase()}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/${post.user.username}`} className="text-sm font-semibold text-white hover:text-blue-400 transition-colors">
                        {post.user.name}
                      </Link>
                      <span className="text-xs text-gray-600">@{post.user.username}</span>
                      <span className="text-xs text-gray-700">·</span>
                      <span className="text-xs text-gray-600">{formatTime(post.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 leading-relaxed">{post.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
                  <button
                    onClick={() => toggleLike(post.id, liked)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-red-400" : "text-gray-600 hover:text-red-400"}`}
                  >
                    <span>{liked ? "❤️" : "🤍"}</span>
                    <span>{post.likes.length}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
