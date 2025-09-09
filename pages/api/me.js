// pages/api/me.js
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "change_this";

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "no_auth" });
  try {
    const user = jwt.verify(auth.split(" ")[1], SECRET);
    res.json({ user });
  } catch (e) {
    res.status(401).json({ error: "bad_token" });
  }
}
