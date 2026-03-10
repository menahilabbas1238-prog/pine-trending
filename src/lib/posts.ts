import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type PostFrontmatter = {
  title: string;
  date: string; // YYYY-MM-DD
  repo?: string; // owner/name
  repoUrl?: string;
  description?: string;
  tags?: string[];
};

export type Post = {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  readingMinutes: number;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function ensureDir() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

export function getAllPostSlugs(): string[] {
  ensureDir();
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort()
    .reverse();
}

export function getPostBySlug(slug: string): Post {
  ensureDir();
  const fullPath = path.join(POSTS_DIR, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found: ${slug}`);
  }
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const rt = readingTime(content);

  return {
    slug,
    frontmatter: data as PostFrontmatter,
    content,
    readingMinutes: Math.max(1, Math.round(rt.minutes)),
  };
}

export function getAllPosts(): Post[] {
  return getAllPostSlugs().map(getPostBySlug);
}
