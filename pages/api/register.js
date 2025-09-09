// pages/api/register.js
import bcrypt from "bcryptjs";
import { readRepoFile, createOrUpdateFile } from "../../lib/github";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, username, password } = req.body || {};
  if (!email || !username || !password) return res.status(400).json({ error: "missing" });

  let usersJson = await readRepoFile("users.json");
  let users = [];
  if (usersJson) {
    users = JSON.parse(usersJson.content);
  }

  if (users.find(u => u.username === username || u.email === email)) {
    return res.status(400).json({ error: "user_exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), email, username, password: hashed, created_at: Date.now() };
  users.push(user);

  await createOrUpdateFile("users.json", JSON.stringify(users, null, 2), `add user ${username}`);
  res.json({ ok: true });
}
