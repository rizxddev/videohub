// lib/github.js
import { Octokit } from "@octokit/rest";

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;

if (!OWNER || !REPO || !TOKEN) {
  console.warn("GITHUB_OWNER / GITHUB_REPO / GITHUB_TOKEN should be set");
}

const octo = new Octokit({ auth: TOKEN });

export async function readRepoFile(path) {
  try {
    const res = await octo.repos.getContent({ owner: OWNER, repo: REPO, path });
    const content = Buffer.from(res.data.content, "base64").toString("utf8");
    return { sha: res.data.sha, content };
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

export async function createOrUpdateFile(path, contentBufferOrString, message = "update") {
  const contentBase64 = Buffer.isBuffer(contentBufferOrString)
    ? contentBufferOrString.toString("base64")
    : Buffer.from(String(contentBufferOrString), "utf8").toString("base64");

  const existing = await readRepoFile(path);
  const params = {
    owner: OWNER, repo: REPO, path,
    message,
    content: contentBase64
  };
  if (existing && existing.sha) params.sha = existing.sha;
  return octo.repos.createOrUpdateFileContents(params);
}

export async function deleteFile(path, message = "delete") {
  const existing = await readRepoFile(path);
  if (!existing) throw new Error("file-not-found");
  return octo.repos.deleteFile({ owner: OWNER, repo: REPO, path, message, sha: existing.sha });
}
