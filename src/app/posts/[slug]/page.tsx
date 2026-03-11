import { notFound } from "next/navigation";
import { ArrowUpRight, Clock3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { SiteShell } from "@/components/SiteShell";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";

// Ensure this route is built as static pages on Vercel (pre-rendered at build time).
export const dynamic = "force-static";
export const revalidate = false;

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export default function PostPage({ params }: { params: { slug: string } }) {
  let post;
  try {
    post = getPostBySlug(params.slug);
  } catch {
    return notFound();
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
