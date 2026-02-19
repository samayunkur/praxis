"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/issues", label: "Issues", icon: "🎯" },
  { href: "/goals", label: "Goals", icon: "📌" },
  { href: "/tools", label: "Tools", icon: "🧰" },
  { href: "/feed", label: "Feed", icon: "🌐" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-gray-900 border-r border-gray-800 z-40 px-4 py-6">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-black text-blue-400">⚗️</span>
          <span className="text-xl font-black text-white">Praxis</span>
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {links.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        {session?.user && (
          <div className="mt-auto pt-4 border-t border-gray-800">
            <Link
              href={`/${(session.user as any).username}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center text-sm font-bold text-blue-400">
                {session.user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                <p className="text-xs text-gray-500 truncate">@{(session.user as any).username}</p>
              </div>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40 flex">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors",
              pathname.startsWith(href) ? "text-blue-400" : "text-gray-500"
            )}
          >
            <span className="text-lg">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
