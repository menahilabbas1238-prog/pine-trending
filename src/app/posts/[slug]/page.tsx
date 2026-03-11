import { notFound } from "next/navigation";
import { ArrowUpRight, Clock3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import readingTime from "reading-time";

import { SiteShell } from "@/components/SiteShell";
import { getPostBySlug } from "@/lib/posts";

// Vercel 환경에서 content/posts 디렉토리 번들링/권한 이슈로 404가 나오는 케이스가 있어,
// 1) 로컬 파일시스템에서 먼저 읽고
// 2) 없으면 GitHub raw로 fallback 해서 항상 글을 보여주도록 처리.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 60;

async function fetchPostFromGitHub(slug: string) {
  const url = `https://raw.githubusercontent.com/menahilabbas1238-prog/pine-trending/main/content/posts/${slug}.md`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    console.error("fetchPostFromGitHub failed", { slug, status: res.status, url });
    return null;
  }
  const raw = await res.text();
  const { data, content } = matter(raw);
  const rt = readingTime(content);
  return {
    slug,
    frontmatter: data as any,
    content,
    readingMinutes: Math.max(1, Math.round(rt.minutes)),
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolved = await Promise.resolve(params as any);
  const slug = resolved?.slug;
  if (!slug) return notFound();

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    post = await fetchPostFromGitHub(slug);
    if (!post) return notFound();
  }

  return (
    <SiteShell>
      <article className="prose prose-zinc max-w-none">
        <header className="not-prose mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Review
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {post.frontmatter.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <div className="font-medium">{post.frontmatter.date}</div>
            <div className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {post.readingMinutes} min
            </div>
            {post.frontmatter.repoUrl ? (
              <a
                className="inline-flex items-center gap-2 font-medium text-zinc-900 hover:underline"
                href={post.frontmatter.repoUrl}
                target="_blank"
                rel="noreferrer"
              >
                {post.frontmatter.repo ?? "Repository"}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </header>

        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </article>
    </SiteShell>
  );
}
