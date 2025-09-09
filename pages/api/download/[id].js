// pages/api/download/[id].js
import { readRepoFile } from "../../../lib/github";

export default async function handler(req, res) {
  const { id } = req.query;
  const vjson = await readRepoFile("videos.json");
  if (!vjson) return res.status(404).json({ error: "no_videos" });
  const videos = JSON.parse(vjson.content);
  const video = videos.find(x => x.id === id);
  if (!video) return res.status(404).json({ error: "not_found" });

  try {
    const file = await readRepoFile(video.filename);
    if (!file) return res.status(404).json({ error: "file_not_in_repo" });
    const buffer = Buffer.from(file.content, "base64");
    res.setHeader("Content-Disposition", `attachment; filename="${video.title}${getExt(video.filename)}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    return res.send(buffer);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "download_failed" });
  }
}

function getExt(p){ const m = p.match(/\.([0-9a-zA-Z]+)$/); return m ? "."+m[1] : ""; }
