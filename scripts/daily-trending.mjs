import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { load as loadHtml } from "cheerio";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const REVIEWED_PATH = path.join(DATA_DIR, "reviewed.json");
const POSTS_DIR = path.join(ROOT, "content", "posts");

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

function todayKST() {
  // Force KST date string
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function readReviewed() {
  if (!fs.existsSync(REVIEWED_PATH)) return { repos: [] };
  return JSON.parse(fs.readFileSync(REVIEWED_PATH, "utf8"));
}

function writeReviewed(data) {
  fs.writeFileSync(REVIEWED_PATH, JSON.stringify(data, null, 2) + "\n");
}

async function fetchText(url, headers = {}) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "gh-trending-daily-bot",
      ...headers,
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return await res.text();
}

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "gh-trending-daily-bot",
      ...headers,
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return await res.json();
}

function slugify(date, fullName) {
  return `${date}-${fullName.replace("/", "-").toLowerCase()}`;
}

function fmEscape(s) {
  return String(s ?? "").replace(/"/g, "\\\"");
}

function renderPost({ title, date, repo, repoUrl, description, body, tags }) {
  const tagList = tags?.length ? `[${tags.map((t) => `\"${fmEscape(t)}\"`).join(", ")}]` : "[]";
  return [
    "---",
    `title: \"${fmEscape(title)}\"`,
    `date: \"${date}\"`,
    `repo: \"${fmEscape(repo)}\"`,
    `repoUrl: \"${fmEscape(repoUrl)}\"`,
    `description: \"${fmEscape(description)}\"`,
    `tags: ${tagList}`,
    "---",
    "",
    body.trim() + "\n",
  ].join("\n");
}

async function pickTrendingRepo(reviewedSet) {
  const html = await fetchText("https://github.com/trending?since=daily");
  const $ = loadHtml(html);

  const repos = [];
  $("article.Box-row h2 a").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href) return;
    const full = href.replace(/^\//, "").split("/").slice(0, 2).join("/");
    if (full.includes(" ")) return;
    repos.push(full);
  });

  for (const r of repos) {
    if (!reviewedSet.has(r)) return r;
  }
  throw new Error("No new repo found in trending list (all duplicates).\nConsider clearing reviewed.json or widening criteria.");
}

async function main() {
  ensureDirs();

  const date = todayKST();
  const reviewed = readReviewed();
  const reviewedSet = new Set(reviewed.repos ?? []);

  const repo = await pickTrendingRepo(reviewedSet);
  const repoUrl = `https://github.com/${repo}`;

  const token = process.env.GITHUB_TOKEN;
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  const meta = await fetchJson(`https://api.github.com/repos/${repo}`, headers);

  const desc = meta.description || "";
  const stars = meta.stargazers_count ?? null;
  const lang = meta.language ?? "";
  const homepage = meta.homepage ?? "";

  const title = `${repo} — Daily Trending Review`;

  const body = `## TL;DR\n\n- 무엇: ${desc || "(설명 없음)"}\n- 언어: ${lang || "(미상)"}${stars ? ` · Stars: ${stars.toLocaleString()}` : ""}\n- 링크: ${repoUrl}\n\n## 왜 오늘 트렌딩일까 (가설)\n\n- README/데모 완성도가 높은 편이거나, 공유하기 좋은 문제를 건드렸을 가능성이 큼\n- 최근 릴리즈/업데이트로 재조명됐을 수 있음\n\n## 빠른 리뷰\n\n### 장점\n\n- 문제 정의가 명확하면 채택 비용이 낮음\n- 문서/예제가 있으면 팀 확산이 쉬움\n\n### 리스크/주의\n\n- 유지보수(최근 커밋, 이슈 대응 속도) 확인 필요\n- 라이선스 확인 필요\n\n## 써볼 사람\n\n- 현재 스택에서 \"${desc || "이 기능"}\"이 필요했던 사람\n- 프로토타입을 빠르게 뽑아야 하는 팀\n\n## 다음 체크\n\n- 설치/Quickstart의 실제 난이도\n- 핵심 API/구성 요소의 안정성\n${homepage ? `- 공식 사이트/데모: ${homepage}\n` : ""}`;

  const post = renderPost({
    title,
    date,
    repo,
    repoUrl,
    description: desc || `Daily GitHub Trending review for ${repo}`,
    tags: ["trending", "daily"],
    body,
  });

  const slug = slugify(date, repo);
  const outPath = path.join(POSTS_DIR, `${slug}.md`);
  fs.writeFileSync(outPath, post);

  reviewedSet.add(repo);
  writeReviewed({ repos: Array.from(reviewedSet) });

  const shouldCommit = process.env.COMMIT === "1";
  const shouldPush = process.env.PUSH === "1";

  if (shouldCommit) {
    execSync(`git add ${JSON.stringify(outPath)} ${JSON.stringify(REVIEWED_PATH)}`, {
      stdio: "inherit",
    });
    execSync(`git commit -m ${JSON.stringify(`daily: ${repo} (${date})`)}`, {
      stdio: "inherit",
    });
  }

  if (shouldPush) {
    execSync("git push", { stdio: "inherit" });
  }

  console.log(JSON.stringify({ date, repo, outPath }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
