// pages/api/videos.js
import { readRepoFile } from "../../lib/github";

export default async function handler(req, res) {
  const q = (req.query.q || "").toLowerCase();
  const v = await readRepoFile("videos.json");
  const videos = v ? JSON.parse(v.content) : [];
  const filtered = q ? videos.filter(x => (x.title||"").toLowerCase().includes(q) || (x.uploader||"").toLowerCase().includes(q)) : videos;
  res.json(filtered.reverse());
}
