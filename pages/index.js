// pages/index.js
import { useEffect, useState } from "react";

const API_PREFIX = "/api";

export default function Home() {
  const [token, setToken] = useState("");
  const [me, setMe] = useState(null);
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) { setToken(t); fetchMe(t); }
    fetchVideos();
  }, []);

  async function fetchMe(t) {
    try {
      const r = await fetch(`${API_PREFIX}/me`, { headers: { Authorization: "Bearer " + t }});
      if (!r.ok) { setMe(null); return; }
      const j = await r.json(); setMe(j.user);
    } catch (e){ console.error(e); }
  }

  async function fetchVideos(qv) {
    const url = qv ? `${API_PREFIX}/videos?q=${encodeURIComponent(qv)}` : `${API_PREFIX}/videos`;
    const r = await fetch(url); const j = await r.json(); setVideos(j);
  }

  async function register(e) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.target));
    const r = await fetch("/api/register", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(form) });
    const j = await r.json();
    alert(j.ok ? "registered" : (j.error||"err"));
  }

  async function login(e){
    e.preventDefault();
    const { username, password } = Object.fromEntries(new FormData(e.target));
    const r = await fetch("/api/login", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ username, password })});
    const j = await r.json();
    if (j.token) { localStorage.setItem("token", j.token); setToken(j.token); fetchMe(j.token); alert("login ok"); }
    else alert(j.error || "fail");
  }

  async function upload(e){
    e.preventDefault();
    if (!token) return alert("login dulu");
    if (!file) return alert("choose file");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    const r = await fetch("/api/upload", { method: "POST", body: fd, headers: { Authorization: "Bearer " + token }});
    const j = await r.json();
    if (j.ok) { alert("uploaded"); fetchVideos(); setFile(null); setTitle(""); }
    else alert(j.error || "upload failed");
  }

  async function download(id){
    const link = document.createElement("a");
    link.href = `/api/download/${id}`;
    link.click();
  }

  async function delVideo(id){
    if (!confirm("Delete?")) return;
    const r = await fetch(`/api/delete/${id}`, { method: "DELETE", headers: { Authorization: "Bearer " + token }});
    const j = await r.json();
    if (j.ok) { alert("deleted"); fetchVideos(); }
    else alert(j.error || "failed");
  }

  const filtered = videos.filter(v => (v.title || "").toLowerCase().includes(q.toLowerCase()) || (v.uploader||"").toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ maxWidth: 960, margin: "24px auto", padding: 12 }}>
      <h1>VideoHub — GitHub storage</h1>

      {!me ? (
        <div style={{ display: "flex", gap: 24 }}>
          <form onSubmit={register}>
            <h3>Register</h3>
            <input name="email" placeholder="email" /><br/>
            <input name="username" placeholder="username" /><br/>
            <input name="password" placeholder="password" type="password" /><br/>
            <button>Register</button>
          </form>
          <form onSubmit={login}>
            <h3>Login</h3>
            <input name="username" placeholder="username" /><br/>
            <input name="password" placeholder="password" type="password" /><br/>
            <button>Login</button>
          </form>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>Logged in as <b>{me.username}</b></div>
            <div>
              <button onClick={() => { localStorage.removeItem("token"); setToken(""); setMe(null); }}>Logout</button>
            </div>
          </div>

          <hr />
          <form onSubmit={upload}>
            <h3>Upload (max 60MB)</h3>
            <input type="text" placeholder="title" value={title} onChange={e=>setTitle(e.target.value)} /> <br/>
            <input type="file" onChange={e=>setFile(e.target.files[0])} /> <br/>
            <button>Upload</button>
          </form>
        </div>
      )}

      <hr />
      <div style={{ margin: "12px 0" }}>
        <input placeholder="Search title or uploader" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={()=>fetchVideos(q)}>Search</button>
        <button onClick={()=>{ setQ(""); fetchVideos(); }}>Reset</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
        {filtered.map(v => (
          <div key={v.id} style={{ border: "1px solid #ddd", padding: 8 }}>
            <div style={{ height: 140, background: "#000" }}>
              <video style={{ width: "100%", height: "100%", objectFit: "cover" }} src={`/api/download/${v.id}`} />
            </div>
            <div style={{ paddingTop: 6 }}>
              <div style={{ fontWeight: 600 }}>{v.title}</div>
              <div style={{ fontSize: 12, color: "#666" }}>by {v.uploader}</div>
              <div style={{ marginTop: 6 }}>
                <button onClick={()=>setSelected(v)}>Play</button>
                <button onClick={()=>download(v.id)} style={{ marginLeft: 8 }}>Download</button>
                {me && me.username === v.uploader && <button onClick={()=>delVideo(v.id)} style={{ marginLeft: 8 }}>Delete</button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ marginTop: 20 }}>
          <h3>{selected.title}</h3>
          <video controls autoPlay src={`/api/download/${selected.id}`} style={{ width: "100%", maxHeight: 540 }} />
          <div><button onClick={()=>setSelected(null)}>Close</button></div>
        </div>
      )}
    </div>
  );
}
