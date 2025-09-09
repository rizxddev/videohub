// pages/api/login.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readRepoFile } from "../../lib/github";

const SECRET = process.env.JWT_SECRET || "change_this";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "missing" });

  const usersJson = await readRepoFile("users.json");
  if (!usersJson) return res.status(400).json({ error: "no_users" });
  const users = JSON.parse(usersJson.content);
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: "invalid" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: "invalid" });

  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET, { expiresIn: "7d" });
  res.json({ token });
}
