import LoginForm from "@/components/LoginForm";

const features = [
  { icon: "🃏", title: "Action Cards", desc: "Evidence-based micro-actions for every area of life" },
  { icon: "📌", title: "Goal Tracking", desc: "Set daily goals and visualize your streaks" },
  { icon: "🧰", title: "Science Tools", desc: "Value Lantern, Concordance assessment & more" },
  { icon: "🌐", title: "Community", desc: "Share wins and follow peers on their journey" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="text-5xl">⚗️</span>
            <h1 className="text-5xl font-black text-white tracking-tight">Praxis</h1>
          </div>
          <p className="text-2xl font-light text-blue-400 mb-4 italic">Science into action.</p>
          <p className="text-gray-400 max-w-md mx-auto text-lg">
            Build better habits with evidence-based action plans.
            Backed by research, designed for real life.
          </p>
        </div>

        {/* Login form (client component) */}
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl w-full">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-700">
        © 2025 Praxis · Science into action.
      </footer>
    </div>
  );
}
