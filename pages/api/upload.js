// pages/api/upload.js
import formidable from "formidable";
import fs from "fs";
import jwt from "jsonwebtoken";
import { createOrUpdateFile, readRepoFile } from "../../lib/github";

export const config = { api: { bodyParser: false } };

const SECRET = process.env.JWT_SECRET || "change_this";
const MAX_SIZE = 60 * 1024 * 1024; // 60 MB

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "no_auth" });
  let user;
  try {
    user = jwt.verify(auth.split(" ")[1], SECRET);
  } catch (e) {
    return res.status(401).json({ error: "invalid_token" });
  }

  const form = new formidable.IncomingForm({ multiples: false, maxFileSize: MAX_SIZE });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      const msg = err.message || "parse_error";
      return res.status(400).json({ error: msg });
    }
    const title = fields.title || (files.file && files.file.originalFilename) || "untitled";
    const file = files.file;
    if (!file) return res.status(400).json({ error: "no_file" });

    const buffer = fs.readFileSync(file.filepath);
    if (buffer.length > MAX_SIZE) return res.status(400).json({ error: "file_too_large" });

    const filename = `${Date.now()}-${file.originalFilename}`.replace(/\s+/g, "_");
    const repoPath = `videos/${user.username}/${filename}`;

    try {
      await createOrUpdateFile(repoPath, buffer, `upload video ${filename}`);

      const vjson = await readRepoFile("videos.json");
      const videos = vjson ? JSON.parse(vjson.content) : [];
      const meta = { id: Date.now().toString(), title, filename: repoPath, uploader: user.username, created_at: Date.now() };
      videos.push(meta);
      await createOrUpdateFile("videos.json", JSON.stringify(videos, null, 2), `add metadata ${meta.id}`);

      return res.json({ ok: true, meta });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message || "upload_failed" });
    }
  });
}
