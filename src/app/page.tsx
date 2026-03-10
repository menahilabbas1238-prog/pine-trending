import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <SiteShell>
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_55%)]" />
        <div className="relative p-8 sm:p-10">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Daily
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              GitHub Trending,
              <span className="block">one repo at a time.</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">
              매일 오전 10시(KST), GitHub Trending(Daily)에서 중복 없이 1개를 골라
              짧고 밀도 있게 리뷰합니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://github.com/trending?since=daily"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Trending (Daily)
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link
                href="#posts"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900"
              >
                최근 리뷰 보기
                <Calendar className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="posts" className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Latest</h2>
          <div className="text-xs text-zinc-500">{posts.length} posts</div>
        </div>

        <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200">
          {posts.length === 0 ? (
            <div className="p-6 text-sm text-zinc-600">
              아직 포스트가 없습니다. 첫 글이 생성되면 여기에 표시됩니다.
            </div>
          ) : (
            posts.map((p) => (
              <Link
                key={p.slug}
                href={`/posts/${p.slug}`}
                className="block p-6 hover:bg-zinc-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold tracking-tight">
                      {p.frontmatter.title}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">
                      {p.frontmatter.description ?? ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs font-medium text-zinc-500">
                    {p.frontmatter.date}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </SiteShell>
  );
}
