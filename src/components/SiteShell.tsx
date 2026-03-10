import Link from "next/link";
import { Github, Rss } from "lucide-react";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-white text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Daily Trending Review
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-600">
            <a
              href="/feed.xml"
              className="inline-flex items-center gap-2 hover:text-zinc-900"
            >
              <Rss className="h-4 w-4" />
              RSS
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 hover:text-zinc-900"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>

      <footer className="border-t border-zinc-200/70">
        <div className="mx-auto max-w-4xl px-6 py-10 text-sm text-zinc-600">
          <div className="flex flex-col gap-2">
            <div className="font-medium text-zinc-900">Daily GitHub Trending Review</div>
            <div>
              One repo a day. Clean notes, fast scanning, actionable takeaways.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
