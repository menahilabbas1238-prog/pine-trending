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

  // Pick a *recent GitHub Issue* from the repo and write a ~1500-char review.
  async function pickLatestIssue(fullName) {
    const [owner, name] = fullName.split("/");
    const issues = await fetchJson(
      `https://api.github.com/repos/${owner}/${name}/issues?state=all&sort=created&direction=desc&per_page=20`,
      headers
    );
    const first = (issues || []).find((it) => !it.pull_request);
    return first || null;
  }

  function trimToChars(text, target = 1500) {
    const s = String(text ?? "").trim();
    if (s.length <= target) return s;
    // keep markdown sane: cut and add ellipsis
    return s.slice(0, Math.max(0, target - 1)).trimEnd() + "…";
  }

  function padToMinChars(text, min = 1450) {
    let s = String(text ?? "").trim();
    if (s.length >= min) return s;

    const chunks = [
      `\n\n## 추가 관찰(체크리스트)\n\n- 보안: 토큰/키가 로그에 찍히지 않는지, 기본 CORS가 과하게 열려있지 않은지\n- DX: 이슈 템플릿에 버전/OS/재현 단계가 잘 유도되는지\n- 품질: 관련 테스트가 있는지(없으면 최소 재현 테스트부터 추가)\n- 운영: 라벨링/triage 속도, 최근 릴리즈 노트 품질`,
      `\n\n## 내가 유지보수자라면\n\n- “재현 → 원인 후보 → 해결 → 회귀 방지(테스트)” 4단계로 이슈를 닫는 흐름을 템플릿화할 거야.\n- 특히 트렌딩 타는 시기엔 신규 유입이 많아서, 답변이 늦으면 같은 질문이 중복으로 쌓여서 비용이 폭발함.\n- 그래서 *짧게라도* 상태 업데이트(확인중/재현됨/다음 릴리즈 예정)를 남겨주는 게 제일 가성비가 좋음.`,
      `\n\n요지는 단순해: **이슈가 명확하면 해결은 빨라지고, 해결이 빠르면 도입 리스크가 줄어든다.**`,
    ];

    let i = 0;
    while (s.length < min) {
      s += chunks[i % chunks.length];
      i += 1;
      if (i > 12) break; // 안전장치
    }
    return s;
  }

  function compactOneLine(s, max = 160) {
    const one = String(s ?? "")
      .replace(/\r/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return one.length > max ? one.slice(0, max - 1).trimEnd() + "…" : one;
  }

  const issue = await pickLatestIssue(repo);

  const issueTitle = issue?.title || "(이 레포에는 최근 이슈가 안 보였음)";
  const issueUrl = issue?.html_url || repoUrl;
  const issueState = issue?.state || "unknown";
  const issueCreated = issue?.created_at ? issue.created_at.slice(0, 10) : "";
  const issueComments = typeof issue?.comments === "number" ? issue.comments : null;
  const issueLabels = Array.isArray(issue?.labels)
    ? issue.labels.map((l) => (typeof l === "string" ? l : l?.name)).filter(Boolean)
    : [];
  const issueSnippet = compactOneLine(issue?.body || "", 220);

  const title = `${repo} — 최신 이슈 1개 리뷰`;

  const draft = `## TL;DR\n\n- 오늘 트렌딩: **${repo}** (${lang || "언어 미상"}${stars ? ` · ⭐ ${stars.toLocaleString()}` : ""})\n- 고른 이슈: **${issueTitle}** (${issueState}${issueCreated ? ` · ${issueCreated}` : ""})\n- 링크: ${issueUrl}\n\n## 이슈 요약 (내가 이해한 문제)\n\n${issueSnippet ? `- 한 줄 요약: ${issueSnippet}\n` : "- 한 줄 요약: (본문이 짧거나 비어있음)\n"}\n## 왜 이게 중요함\n\n- 사용자 경험/신뢰에 바로 영향 줄 수 있는 유형인지 체크\n- 유지보수 관점에서: 비슷한 이슈가 반복되면 제품/라이브러리 채택 비용이 급상승\n\n## 빠른 분석\n\n- 재현 가능성: 이슈 본문이 구체적이면 **해결 속도**가 빨라짐\n- 영향 범위: 코어 기능/빌드/배포를 깨면 우선순위가 급상승\n- 커뮤니케이션: 라벨/템플릿/로그 요구가 잘 되어 있으면 건강한 레포\n\n## 내가 제안하는 다음 액션\n\n1) 이슈 템플릿대로 재현 절차 + 로그/버전 정보 보강\n2) 최소 재현 리포(MRE) 있으면 바로 붙이기\n3) 원인 후보를 2~3개로 좁혀서(최근 커밋/릴리즈, 환경 차이, breaking change) 확인\n\n## 개인 의견\n\n${desc ? `이 프로젝트는 \"${desc}\" 쪽 문제를 건드려서 트렌딩 탔을 확률이 높고, 이슈 관리가 탄탄하면 ‘팀에 도입’까지 이어질 가능성이 큼. ` : "이 프로젝트는 기능 대비 관심이 붙은 상태라, 이슈 대응 속도가 곧 신뢰도로 이어질 가능성이 큼. "}${issueComments !== null ? `현재 이 이슈의 댓글 수는 ${issueComments}개라서, 관심도/논의 강도를 가늠할 수 있음. ` : ""}${issueLabels.length ? `라벨은 ${issueLabels.map((x) => `\`${x}\``).join(", ")}가 붙어있어서 분류는 어느 정도 되어 보임. ` : "라벨이 거의 없으면 triage를 먼저 하는 게 좋음. "}\n\n---\n\n${homepage ? `참고: ${homepage}\n` : ""}`;

  const body = trimToChars(padToMinChars(draft, 1450), 1500);

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
