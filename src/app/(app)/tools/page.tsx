import Link from "next/link";

const tools = [
  {
    id: "value-lantern",
    emoji: "🏮",
    title: "Value Lantern",
    description: "Illuminate your core values through 4 guided prompts — Flame, Protection, Handle, and Light.",
    time: "~10 min",
    color: "from-yellow-900/30 to-orange-900/20 border-yellow-800/40",
  },
  {
    id: "concordance",
    emoji: "🧭",
    title: "Self-Concordance Assessment",
    description: "Discover whether your goals are driven by intrinsic motivation or external pressure.",
    time: "~5 min",
    color: "from-blue-900/30 to-indigo-900/20 border-blue-800/40",
  },
];

export default function ToolsPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">🧰 Toolbox</h1>
        <p className="text-gray-500 mt-1">Science-backed assessments to deepen self-understanding.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.id}`}
            className={`bg-gradient-to-br ${tool.color} border rounded-2xl p-6 hover:scale-[1.02] transition-all group`}
          >
            <span className="text-4xl block mb-3">{tool.emoji}</span>
            <h2 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{tool.title}</h2>
            <p className="text-sm text-gray-400 mb-4">{tool.description}</p>
            <span className="text-xs text-gray-500">⏱ {tool.time}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">What are these tools?</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Praxis Toolbox is a collection of evidence-based self-assessment frameworks. They help you understand
          your core values, motivation styles, and psychological patterns — so you can take action that truly aligns
          with who you are.
        </p>
      </div>
    </div>
  );
}
