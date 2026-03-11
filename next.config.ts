import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // keep config minimal for Vercel stability

  // Ensure Markdown content is bundled for server functions (Vercel file tracing can miss directory reads).
  outputFileTracingIncludes: {
    "/posts/[slug]": ["./content/posts/**/*"],
    "/": ["./content/posts/**/*"],
  },
};

export default nextConfig;
