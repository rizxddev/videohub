// pages/api/delete/[id].js
import jwt from "jsonwebtoken";
import { readRepoFile, deleteFile, createOrUpdateFile } from "../../../lib/github";

const SECRET = process.env.JWT_SECRET || "change_this";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "no_auth" });
  let user;
  try { user = jwt.verify(auth.split(" ")[1], SECRET); } catch { return res.status(401).json({ error: "bad_token" }); }

  const { id } = req.query;
  const vjson = await readRepoFile("videos.json");
  if (!vjson) return res.status(404).json({ error: "no_videos" });
  const videos = JSON.parse(vjson.content);
  const video = videos.find(x => x.id === id);
  if (!video) return res.status(404).json({ error: "not_found" });
  if (video.uploader !== user.username) return res.status(403).json({ error: "not_owner" });

  try {
    await deleteFile(video.filename, `delete ${video.filename}`);
    const newVideos = videos.filter(x => x.id !== id);
    await createOrUpdateFile("videos.json", JSON.stringify(newVideos, null, 2), `remove metadata ${id}`);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "delete_failed" });
  }
}
