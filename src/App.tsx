import { useState, useCallback, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ⚙️  GITHUB CONFIG — fill in your own values
// ─────────────────────────────────────────────────────────────────────────────
const GH_TOKEN  = "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";        // Personal Access Token
const GH_OWNER  = "Indika2016";         // e.g. "johnsmith"
const GH_REPO   = "UFM-Web";               // e.g. "bakery-calculator"
const GH_FILE   = "recipes_db.json";              // file path in repo root
const GH_BRANCH = "main";
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #0f1117; --surface:  #1a1d27; --surface2: #22263a;
    --border:  #2e3450; --cyan:     #00c8ff; --amber:    #f5a623;
    --green:   #3ecf72; --red:      #e05252; --text:     #e8eaf0;
    --muted:   #7a82a0; --purple:   #7c4dff;
    --mono: 'JetBrains Mono', monospace; --sans: 'Inter', sans-serif;
  }

  body { background:var(--bg); color:var(--text); font-family:var(--sans); min-height:100vh; }

  /* LOGIN */
  .login-wrap { display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .login-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:40px 36px; width:340px; }
  .login-title { font-size:26px; font-weight:700; color:var(--cyan); letter-spacing:2px; margin-bottom:28px; text-align:center; }
  .field { margin-bottom:16px; }
  .field label { display:block; font-size:12px; font-weight:600; color:var(--muted); letter-spacing:1px; margin-bottom:6px; }
  .field input { width:100%; padding:10px 14px; border-radius:8px; background:var(--surface2); border:1px solid var(--border); color:var(--text); font-size:15px; font-family:var(--sans); outline:none; transition:border-color .15s; }
  .field input:focus { border-color:var(--cyan); }
  .btn-primary { width:100%; padding:12px; border-radius:8px; border:none; cursor:pointer; background:var(--cyan); color:#0f1117; font-size:15px; font-weight:700; font-family:var(--sans); letter-spacing:.5px; transition:opacity .15s; }
  .btn-primary:hover { opacity:.88; }
  .error-msg { color:var(--red); font-size:13px; margin-top:10px; text-align:center; min-height:20px; }

  /* DASHBOARD */
  .app-wrap { max-width:960px; margin:0 auto; padding:24px 16px; }
  .app-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; }
  .app-title { font-size:20px; font-weight:700; color:var(--cyan); letter-spacing:1px; }
  .btn-logout { padding:8px 18px; border-radius:6px; border:1px solid var(--red); background:transparent; color:var(--red); font-size:13px; font-weight:600; cursor:pointer; font-family:var(--sans); transition:background .15s; }
  .btn-logout:hover { background:rgba(224,82,82,.12); }
  .grid-2x2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .calc-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:28px 24px; cursor:pointer; transition:border-color .2s, transform .15s; display:flex; flex-direction:column; gap:8px; }
  .calc-card:hover { border-color:var(--cyan); transform:translateY(-2px); }
  .card-num { font-size:11px; font-weight:700; color:var(--muted); letter-spacing:2px; }
  .card-title { font-size:18px; font-weight:700; }
  .card-sub { font-size:13px; color:var(--muted); }

  /* MODAL */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); display:flex; align-items:center; justify-content:center; z-index:100; padding:16px; }
  .modal { background:var(--surface); border:1px solid var(--border); border-radius:12px; width:100%; max-width:500px; max-height:90vh; display:flex; flex-direction:column; }
  .modal-header { padding:18px 22px 14px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .modal-title { font-size:16px; font-weight:700; color:var(--cyan); }
  .modal-close { background:none; border:none; color:var(--muted); font-size:20px; cursor:pointer; line-height:1; padding:2px 6px; border-radius:4px; }
  .modal-close:hover { color:var(--text); }
  .modal-body { padding:20px 22px; overflow-y:auto; flex:1; }
  .modal-footer { padding:14px 22px; border-top:1px solid var(--border); display:flex; gap:10px; flex-shrink:0; flex-wrap:wrap; }

  /* FORM */
  .form-row { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .form-label { font-size:13px; color:var(--muted); min-width:140px; font-weight:500; }
  .form-input { flex:1; padding:9px 12px; border-radius:7px; background:var(--surface2); border:1px solid var(--border); color:var(--text); font-family:var(--mono); font-size:14px; outline:none; transition:border-color .15s; }
  .form-input:focus { border-color:var(--cyan); }
  .form-input[readonly] { color:var(--cyan); background:rgba(0,200,255,.07); border-color:rgba(0,200,255,.2); }

  /* BUTTONS */
  .btn { padding:10px 18px; border-radius:7px; border:none; cursor:pointer; font-size:14px; font-weight:600; font-family:var(--sans); transition:opacity .15s; }
  .btn:hover { opacity:.85; }
  .btn-green  { background:var(--green);   color:#0f1117; }
  .btn-blue   { background:var(--cyan);    color:#0f1117; }
  .btn-purple { background:var(--purple);  color:#fff; }
  .btn-red    { background:var(--red);     color:#fff; }
  .btn-gray   { background:var(--surface2); color:var(--text); border:1px solid var(--border); }
  .btn-teal   { background:#00b3a0;        color:#0f1117; }
  .btn-amber  { background:var(--amber);   color:#0f1117; }
  .btn-small  { padding:6px 12px; font-size:12px; }
  .get-btn { padding:9px 12px; border-radius:7px; border:none; background:var(--cyan); color:#0f1117; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap; }

  /* RECIPE MODAL */
  .recipe-modal { max-width:700px; }
  .recipe-ctrl-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .recipe-active-label { font-size:13px; font-weight:700; color:var(--amber); }
  .autocal-row { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); }
  .autocal-row input[type=checkbox] { accent-color:var(--cyan); width:14px; height:14px; }

  /* TOTALS BAR */
  .totals-bar { display:grid; grid-template-columns:1fr; gap:8px; background:var(--surface2); border-radius:8px; padding:10px 12px; margin-bottom:14px; }
  @media(min-width:480px) { .totals-bar { grid-template-columns:repeat(3,1fr); } }
  .total-cell { display:flex; flex-direction:column; gap:3px; }
  .total-cell label { font-size:10px; color:var(--muted); letter-spacing:.5px; font-weight:600; }
  .total-cell input { padding:6px 8px; border-radius:5px; border:1px solid var(--border); background:var(--surface); color:var(--text); font-family:var(--mono); font-size:13px; outline:none; transition:border-color .15s; width:100%; }
  .total-cell input:focus { border-color:var(--cyan); }
  .total-cell input[readonly] { color:var(--cyan); background:rgba(0,200,255,.06); }

  /* SECTION / ING */
  .section-hdr { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 28px; padding:6px 8px; background:var(--surface2); border-radius:6px; margin-bottom:6px; font-size:11px; font-weight:700; color:var(--muted); letter-spacing:.5px; gap:4px; }
  .ing-outer { position:relative; overflow:hidden; border-radius:6px; margin-bottom:4px; }
  .ing-row { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 28px; gap:4px; align-items:center; background:var(--bg); border-radius:6px; position:relative; z-index:1; }
  .ing-name-wrap { display:flex; align-items:center; overflow:hidden; padding:0 2px; }
  .ing-name { font-size:13px; font-weight:500; padding:0 2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer; user-select:none; flex:1; }
  .ing-name-edit { font-size:13px; font-weight:500; flex:1; background:transparent; border:none; border-bottom:1px solid var(--cyan); color:var(--cyan); outline:none; font-family:var(--sans); padding:0 2px; min-width:0; }
  .ing-input { padding:6px 6px; border-radius:5px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-family:var(--mono); font-size:13px; outline:none; width:100%; transition:border-color .15s; }
  .ing-input:focus { border-color:var(--cyan); }
  .del-btn { background:none; border:none; color:transparent; font-size:13px; cursor:pointer; padding:3px; border-radius:4px; width:28px; text-align:center; transition:color .15s, background .15s; flex-shrink:0; }
  .ing-outer:hover .del-btn { color:rgba(224,82,82,.45); }
  .del-btn:hover { color:var(--red) !important; background:rgba(224,82,82,.12); }

  .summary-row { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:4px; align-items:center; margin-top:6px; background:rgba(0,200,255,.05); border-radius:6px; padding:6px 0; }
  .summary-label { font-size:12px; font-weight:700; color:var(--muted); padding:0 4px; }
  .summary-val { padding:6px 6px; border-radius:5px; font-family:var(--mono); font-size:13px; color:var(--cyan); text-align:center; background:rgba(0,200,255,.07); border:1px solid rgba(0,200,255,.2); }
  .summary-val.warn { color:var(--red); background:rgba(224,82,82,.1); border-color:rgba(224,82,82,.3); }
  .add-ing-btn { width:100%; padding:7px; border-radius:6px; border:1px dashed var(--border); background:transparent; color:var(--muted); font-size:12px; cursor:pointer; font-family:var(--sans); margin-top:4px; margin-bottom:12px; transition:border-color .15s, color .15s; }
  .add-ing-btn:hover { border-color:var(--green); color:var(--green); }

  /* LIBRARY */
  .library-list { display:flex; flex-direction:column; gap:8px; }
  .lib-item { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; padding:12px 14px; background:var(--surface2); border-radius:8px; border:1px solid var(--border); cursor:pointer; transition:border-color .15s; }
  .lib-item:hover { border-color:var(--cyan); }
  .lib-item-left { display:flex; flex-direction:column; gap:3px; }
  .lib-item-name { font-size:14px; font-weight:600; }
  .lib-item-meta { font-size:11px; color:var(--muted); }
  .lib-item-right { display:flex; align-items:center; gap:6px; flex-shrink:0; }
  .source-badge { font-size:10px; font-weight:700; letter-spacing:.5px; padding:2px 7px; border-radius:10px; }
  .source-badge.local { background:rgba(124,77,255,.18); color:var(--purple); border:1px solid rgba(124,77,255,.3); }
  .source-badge.cloud { background:rgba(0,200,255,.13); color:var(--cyan);   border:1px solid rgba(0,200,255,.25); }

  /* FILTER BAR */
  .filter-bar { display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:14px; }
  .filter-btn { padding:5px 12px; border-radius:20px; border:1px solid var(--border); background:var(--surface2); color:var(--muted); font-size:12px; font-weight:600; cursor:pointer; font-family:var(--sans); transition:all .15s; }
  .filter-btn.active { border-color:var(--cyan); color:var(--cyan); background:rgba(0,200,255,.1); }
  .sort-select { padding:5px 10px; border-radius:20px; border:1px solid var(--border); background:var(--surface2); color:var(--muted); font-size:12px; font-family:var(--sans); outline:none; cursor:pointer; }
  .sort-select:focus { border-color:var(--cyan); }
  .cloud-status { font-size:11px; display:flex; align-items:center; gap:4px; }
  .cloud-status.ok   { color:var(--green); }
  .cloud-status.err  { color:var(--red); }
  .cloud-status.busy { color:var(--amber); }

  /* PREVIEW TABLE */
  .preview-table { width:100%; border-collapse:collapse; font-size:13px; margin-bottom:10px; }
  .preview-table th { background:var(--surface2); padding:6px 8px; text-align:center; font-size:11px; color:var(--muted); font-weight:700; }
  .preview-table td { padding:6px 8px; text-align:center; border-bottom:1px solid var(--border); font-family:var(--mono); }

  /* SAVE DESTINATION TOGGLE */
  .dest-toggle { display:flex; gap:8px; margin-bottom:14px; }
  .dest-btn { flex:1; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--surface2); color:var(--muted); font-size:13px; font-weight:600; cursor:pointer; font-family:var(--sans); text-align:center; transition:all .15s; }
  .dest-btn.active.local  { border-color:var(--purple); color:var(--purple); background:rgba(124,77,255,.1); }
  .dest-btn.active.cloud  { border-color:var(--cyan);   color:var(--cyan);   background:rgba(0,200,255,.1); }

  /* ADMIN PROMPT */
  .admin-overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); display:flex; align-items:center; justify-content:center; z-index:200; padding:16px; }
  .admin-card { background:var(--surface); border:1px solid var(--red); border-radius:12px; padding:24px; width:100%; max-width:320px; }
  .admin-title { font-size:15px; font-weight:700; color:var(--red); margin-bottom:6px; }
  .admin-sub   { font-size:12px; color:var(--muted); margin-bottom:14px; line-height:1.5; }
  .admin-input { width:100%; padding:9px 12px; border-radius:7px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-family:var(--mono); font-size:14px; outline:none; margin-bottom:6px; transition:border-color .15s; }
  .admin-input:focus { border-color:var(--red); }
  .admin-err { font-size:11px; color:var(--red); min-height:16px; margin-bottom:8px; }
  .admin-btns { display:flex; gap:8px; }

  .toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:10px 20px; font-size:13px; font-weight:600; z-index:300; box-shadow:0 4px 20px rgba(0,0,0,.4); pointer-events:none; transition:opacity .3s; }
  .toast.success { border-color:var(--green); color:var(--green); }
  .toast.error   { border-color:var(--red);   color:var(--red); }
  .toast.info    { border-color:var(--cyan);  color:var(--cyan); }

  @media(max-width:600px) {
    .grid-2x2 { grid-template-columns:1fr; }
    .modal { max-width:100%; }
    .recipe-modal { max-width:100%; }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const f = (v: any, d = 0) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
const fmt = (n: number) => isNaN(n) ? "" : String(Math.round(n * 100) / 100);

type IngRow = { bakers: string; true: string; weight: string };
type IngMap = Record<string, IngRow>;
type RecipeEntry = {
  dataset: string[][];
  top_totals: { weight: string; flour: string; water: string };
  bottom_totals: { bakers: string; true: string; weight: string };
  savedBy: string;
  savedAt: string;  // ISO date string
  source: "local" | "cloud";
};
type RecipesDB = Record<string, RecipeEntry>;

// ── GitHub API ────────────────────────────────────────────────────────────────
const GH_API = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_FILE}`;

async function ghFetch(db: RecipesDB): Promise<RecipesDB> {
  const res = await fetch(GH_API, {
    headers: { Authorization: `token ${GH_TOKEN}`, Accept: "application/vnd.github.v3+json" }
  });
  if (res.status === 404) return {};
  if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
  const data = await res.json();
  const content = JSON.parse(atob(data.content.replace(/\n/g, "")));
  // tag all as cloud
  Object.keys(content).forEach(k => { content[k].source = "cloud"; });
  return content;
}

async function ghSave(db: RecipesDB, entry: RecipeEntry, name: string): Promise<void> {
  // get current sha
  let sha: string | undefined;
  const getRes = await fetch(GH_API, {
    headers: { Authorization: `token ${GH_TOKEN}`, Accept: "application/vnd.github.v3+json" }
  });
  if (getRes.ok) { const d = await getRes.json(); sha = d.sha; }

  const cloudEntry = { ...entry, source: "cloud" };
  const newDb = { ...db, [name]: cloudEntry };
  // remove source field before storing (we re-tag on load)
  const toStore: any = {};
  Object.keys(newDb).forEach(k => {
    const { source, ...rest } = newDb[k] as any;
    toStore[k] = rest;
  });

  const body: any = {
    message: `Save recipe: ${name}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(toStore, null, 2)))),
    branch: GH_BRANCH,
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(GH_API, {
    method: "PUT",
    headers: { Authorization: `token ${GH_TOKEN}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!putRes.ok) throw new Error(`GitHub save failed: ${putRes.status}`);
}

async function ghDelete(cloudDb: RecipesDB, name: string): Promise<void> {
  let sha: string | undefined;
  const getRes = await fetch(GH_API, {
    headers: { Authorization: `token ${GH_TOKEN}`, Accept: "application/vnd.github.v3+json" }
  });
  if (getRes.ok) { const d = await getRes.json(); sha = d.sha; }

  const newDb = { ...cloudDb };
  delete newDb[name];
  const toStore: any = {};
  Object.keys(newDb).forEach(k => {
    const { source, ...rest } = newDb[k] as any;
    toStore[k] = rest;
  });

  const body: any = {
    message: `Delete recipe: ${name}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(toStore, null, 2)))),
    branch: GH_BRANCH,
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(GH_API, {
    method: "PUT",
    headers: { Authorization: `token ${GH_TOKEN}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!putRes.ok) throw new Error(`GitHub delete failed: ${putRes.status}`);
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer, wide }: {
  title: string; onClose: () => void; children: React.ReactNode;
  footer?: React.ReactNode; wide?: boolean;
}) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? " recipe-modal" : ""}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "success"|"error"|"info" }) {
  return <div className={`toast ${type}`}>{msg}</div>;
}

// ── Admin prompt ──────────────────────────────────────────────────────────────
function AdminPrompt({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const attempt = () => { if (pw === "8707") onConfirm(); else { setErr("Incorrect password."); setPw(""); } };
  return (
    <div className="admin-overlay">
      <div className="admin-card">
        <div className="admin-title">🔒 Admin Verification</div>
        <div className="admin-sub">{message}</div>
        <input className="admin-input" type="password" placeholder="Admin password" value={pw} autoFocus
          onChange={e => { setPw(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && attempt()} />
        <div className="admin-err">{err}</div>
        <div className="admin-btns">
          <button className="btn btn-red btn-small" style={{flex:1}} onClick={attempt}>Confirm</button>
          <button className="btn btn-gray btn-small" style={{flex:1}} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── FF Calculator ─────────────────────────────────────────────────────────────
function FFCalc({ onClose, onResult }: { onClose:()=>void; onResult:(v:number)=>void }) {
  const [wt,setWt]=useState(""); const [ft,setFt]=useState(""); const [adt,setAdt]=useState(""); const [result,setResult]=useState("");
  const calc=()=>{ try{ const r=(3*f(adt))-f(ft)-f(wt)-f(ft); setResult(fmt(r)); onResult(r); }catch{ setResult("Error"); } };
  return (
    <Modal title="01. FF Calculator" onClose={onClose}
      footer={<><button className="btn btn-green" onClick={calc}>Calculate</button><button className="btn btn-red" onClick={onClose}>Close</button></>}>
      {([["01. WT",wt,setWt],["02. FT",ft,setFt],["03. ADT",adt,setAdt]] as [string,string,React.Dispatch<React.SetStateAction<string>>][]).map(([l,v,s])=>(
        <div className="form-row" key={l}><span className="form-label">{l}</span><input className="form-input" type="number" value={v} onChange={e=>s(e.target.value)} placeholder="0.00"/></div>
      ))}
      <div className="form-row"><span className="form-label">04. FF (Result)</span><input className="form-input" readOnly value={result} placeholder="—"/></div>
    </Modal>
  );
}

// ── Water Temp Calculator ─────────────────────────────────────────────────────
function WaterTempCalc({ onClose, lastFF, onResult }: { onClose:()=>void; lastFF:number; onResult:(v:number)=>void }) {
  const [ddt,setDdt]=useState(""); const [rt,setRt]=useState(""); const [ft,setFt]=useState(""); const [ff,setFf]=useState(""); const [result,setResult]=useState("");
  const calc=()=>{ try{ const r=(3*f(ddt))-f(rt)-f(ft)-f(ff); setResult(fmt(r)); onResult(r); }catch{ setResult("Error"); } };
  return (
    <Modal title="02. Water Temp Calculator" onClose={onClose}
      footer={<><button className="btn btn-teal" onClick={calc}>Calculate</button><button className="btn btn-red" onClick={onClose}>Close</button></>}>
      {([["01. DDT",ddt,setDdt],["02. RT",rt,setRt],["03. FT",ft,setFt]] as [string,string,React.Dispatch<React.SetStateAction<string>>][]).map(([l,v,s])=>(
        <div className="form-row" key={l}><span className="form-label">{l}</span><input className="form-input" type="number" value={v} onChange={e=>s(e.target.value)} placeholder="0.00"/></div>
      ))}
      <div className="form-row">
        <span className="form-label">04. FF</span>
        <input className="form-input" type="number" value={ff} onChange={e=>setFf(e.target.value)} placeholder="0.00" style={{flex:1}}/>
        <button className="get-btn" onClick={()=>setFf(fmt(lastFF))}>Get FF</button>
      </div>
      <div className="form-row"><span className="form-label">05. Cal WT (Result)</span><input className="form-input" readOnly value={result} placeholder="—"/></div>
    </Modal>
  );
}

// ── Ice Temp Calculator ───────────────────────────────────────────────────────
function IceTempCalc({ onClose, lastWT }: { onClose:()=>void; lastWT:number }) {
  const [reqWater,setReqWater]=useState(""); const [wt,setWt]=useState(""); const [calWt,setCalWt]=useState(""); const [iceRes,setIceRes]=useState(""); const [waterRes,setWaterRes]=useState("");
  const calc=()=>{ try{ const rw=f(reqWater),w=f(wt),c=f(calWt); if((w+80)===0){setIceRes("Div/0");setWaterRes("Error");return;} const ice=rw*(w-c)/(w+80); setIceRes(fmt(ice)); setWaterRes(fmt(rw-ice)); }catch{ setIceRes("Error"); setWaterRes("Error"); } };
  return (
    <Modal title="03. Ice Temp Calculator" onClose={onClose}
      footer={<><button className="btn btn-blue" onClick={calc}>Calculate</button><button className="btn btn-red" onClick={onClose}>Close</button></>}>
      <div className="form-row"><span className="form-label">01. Req Water Wt</span><input className="form-input" type="number" value={reqWater} onChange={e=>setReqWater(e.target.value)} placeholder="0.00"/></div>
      <div className="form-row"><span className="form-label">02. WT</span><input className="form-input" type="number" value={wt} onChange={e=>setWt(e.target.value)} placeholder="0.00"/></div>
      <div className="form-row">
        <span className="form-label">03. Cal WT</span>
        <input className="form-input" type="number" value={calWt} onChange={e=>setCalWt(e.target.value)} placeholder="0.00" style={{flex:1}}/>
        <button className="get-btn" onClick={()=>setCalWt(fmt(lastWT))}>Get WT</button>
      </div>
      <div className="form-row"><span className="form-label">04. Calc Ice Wt</span><input className="form-input" readOnly value={iceRes} placeholder="—"/></div>
      <div className="form-row"><span className="form-label">05. Calc Water Wt</span><input className="form-input" readOnly value={waterRes} placeholder="—"/></div>
    </Modal>
  );
}

// ── Recipe Calculator ─────────────────────────────────────────────────────────
const DEFAULT_SPONGE = ["Flour","Water","Yeast"];
const DEFAULT_DOUGH  = ["Flour","Water","Sugar","Shortening","MSNF"];

function makeIngMap(names: string[]): IngMap {
  const m: IngMap = {};
  names.forEach(n => { m[n] = { bakers:"", true:"", weight:"" }; });
  return m;
}

function RecipeCalc({ onClose, currentUser }: { onClose:()=>void; currentUser:string }) {
  // ── Local + cloud DB ────────────────────────────────────────────────────────
  const [localDb,  setLocalDb]  = useState<RecipesDB>(()=>{ try{ const raw=JSON.parse(localStorage.getItem("recipes_db")||"{}"); Object.keys(raw).forEach(k=>{raw[k].source="local";}); return raw; }catch{return {};} });
  const [cloudDb,  setCloudDb]  = useState<RecipesDB>({});
  const [cloudStatus, setCloudStatus] = useState<"idle"|"loading"|"ok"|"err">("idle");
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"|"info"}|null>(null);

  const showToast = (msg: string, type: "success"|"error"|"info") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 2800);
  };

  // load cloud on mount
  useEffect(()=>{
    setCloudStatus("loading");
    ghFetch(cloudDb).then(db=>{ setCloudDb(db); setCloudStatus("ok"); }).catch(()=>setCloudStatus("err"));
  },[]);

  // merged view: cloud overrides local for same key (cloud is source of truth)
  const mergedDb: RecipesDB = { ...localDb, ...cloudDb };

  // ── Recipe form state ───────────────────────────────────────────────────────
  const [activeLabel, setActiveLabel] = useState("New Formulation");
  const [autoCal, setAutoCal]         = useState(false);
  const [totalWt, setTotalWt]         = useState("");
  const [totalFlour, setTotalFlour]   = useState("0.00");
  const [totalWater, setTotalWater]   = useState("0.00");
  const [totBakers, setTotBakers]     = useState("0.00");
  const [totTrue, setTotTrue]         = useState("0.00");
  const [totWeight, setTotWeight]     = useState("0.00");
  const [trueWarn, setTrueWarn]       = useState(false);
  const [sponge, setSponge]           = useState<IngMap>(()=>makeIngMap(DEFAULT_SPONGE));
  const [dough, setDough]             = useState<IngMap>(()=>makeIngMap(DEFAULT_DOUGH));
  const [view, setView]               = useState("calc");
  const [previewKey, setPreviewKey]   = useState<string|null>(null);
  const [saveNameInput, setSaveNameInput] = useState("");
  const [saveDest, setSaveDest]       = useState<"local"|"cloud">("local");
  const [newIngSection, setNewIngSection] = useState<string|null>(null);
  const [newIngName, setNewIngName]   = useState("");
  const [renamingKey, setRenamingKey] = useState<{sec:string;name:string}|null>(null);
  const [renameVal, setRenameVal]     = useState("");
  const [adminPrompt, setAdminPrompt] = useState<{key:string;source:"local"|"cloud"}|null>(null);
  const [isSaving, setIsSaving]       = useState(false);
  // filter/sort
  const [filterSource, setFilterSource] = useState<"all"|"local"|"cloud">("all");
  const [sortBy, setSortBy]           = useState<"name-az"|"name-za"|"date-new"|"date-old">("date-new");
  const calcRef   = useRef(false);
  const holdTimers = useRef<Record<string,any>>({});

  // ── Calculation engine ──────────────────────────────────────────────────────
  const runCalc = useCallback((tWt:string, spongeMap:IngMap, doughMap:IngMap, trigField:string|null=null, trigIng:string|null=null, trigSec:string|null=null)=>{
    const _f=(v:any)=>{const n=parseFloat(v);return(isNaN(n)||!isFinite(n))?0:n;};
    const spongeHas=Object.values(spongeMap).some((r:any)=>r.bakers||r.true||r.weight);
    const doughHas =Object.values(doughMap).some((r:any)=>r.bakers||r.true||r.weight);
    const newS:IngMap=JSON.parse(JSON.stringify(spongeMap));
    const newD:IngMap=JSON.parse(JSON.stringify(doughMap));
    let totalDoughWeight=_f(tWt);

    if(trigField==="true"&&trigIng&&trigSec){ const target=trigSec==="Sponge"?newS:newD; if(target[trigIng]){ const ingTrueVal=_f(target[trigIng].true); let flourTruePct=0; for(const sec of[newS,newD]){if(sec["Flour"]){const c=_f(sec["Flour"].true);if(c>0){flourTruePct=c;break;}}} if(flourTruePct>0&&ingTrueVal>0)target[trigIng].bakers=fmt((ingTrueVal/flourTruePct)*100); } }
    if((trigField==="weight"||trigField==="true")&&trigIng&&trigSec){ const target=trigSec==="Sponge"?newS:newD; if(target[trigIng]){ const rowTrue=_f(target[trigIng].true),rowWt=_f(target[trigIng].weight); if(rowTrue>0&&rowWt>0){const derived=(rowWt/rowTrue)*100;const newTw=fmt(derived);if(totalDoughWeight===0||newTw!==fmt(totalDoughWeight)){totalDoughWeight=derived;setTotalWt(newTw);}} } }
    if(!spongeHas&&doughHas&&newD["Flour"]){if(!(trigField==="bakers"&&trigIng==="Flour"&&trigSec==="Dough")){if(_f(newD["Flour"].bakers)===0)newD["Flour"].bakers="100.00";}}

    let totalBakersSum=0;
    Object.entries(newS).forEach(([n,r])=>{if(n!=="Water")totalBakersSum+=_f(r.bakers);});
    Object.values(newD).forEach((r:any)=>{totalBakersSum+=_f(r.bakers);});
    if(totalBakersSum===0)totalBakersSum=100;

    let runTrueSum=0,runFlourWt=0,runWaterWt=0,totalAccumWt=0;
    for(const [secName,secMap] of [["Sponge",newS],["Dough",newD]] as [string,IngMap][]){
      for(const [name,row] of Object.entries(secMap)){
        let bVal=_f(row.bakers),tVal=_f(row.true),wVal=_f(row.weight);
        const ownT=trigField==="true"&&trigIng===name&&trigSec===secName;
        const ownW=trigField==="weight"&&trigIng===name&&trigSec===secName;
        if(bVal>0&&!ownT){ let compTrue:number; if(name==="Water"&&secName==="Sponge"){const sfb=_f(newS["Flour"]?.bakers??0);compTrue=totalBakersSum>0?(sfb*bVal)/totalBakersSum:0;}else if(name==="Water"&&secName==="Dough"){const swt=_f(newS["Water"]?.true??0);const raw=totalBakersSum>0?(bVal/totalBakersSum)*100:0;compTrue=Math.max(raw-swt,0);}else{compTrue=(bVal*100)/totalBakersSum;} const nt=compTrue>0?fmt(compTrue):""; if(row.true!==nt)row.true=nt; tVal=compTrue; }
        if(tVal>0&&totalDoughWeight>0&&!ownW){const cw=(totalDoughWeight*tVal)/100;const nw=cw>0?fmt(cw):"";if(row.weight!==nw)row.weight=nw;wVal=cw;}
        else if(wVal>0&&bVal===0&&totalDoughWeight>0&&!ownT){const ct=(wVal/totalDoughWeight)*100;const nt=ct>0?fmt(ct):"";if(row.true!==nt)row.true=nt;tVal=ct;}
        tVal=_f(row.true);wVal=_f(row.weight);
        if(name.toLowerCase()==="flour")runFlourWt+=wVal;
        if(name.toLowerCase()==="water")runWaterWt+=wVal;
        runTrueSum+=tVal;totalAccumWt+=wVal;
      }
    }
    setTotalFlour(fmt(runFlourWt)||"0.00"); setTotalWater(fmt(runWaterWt)||"0.00");
    if(trigField!=="total_weight"&&totalAccumWt>0&&totalDoughWeight===0)setTotalWt(fmt(totalAccumWt));
    setTotBakers(fmt(totalBakersSum)); setTotTrue(fmt(runTrueSum)); setTotWeight(fmt(totalAccumWt));
    setTrueWarn(runTrueSum>0&&!(runTrueSum>=99&&runTrueSum<=100.01));
    setSponge(newS); setDough(newD);
  },[]);

  const triggerCalc=(field:string|null,ing:string|null,sec:string|null,spongeMap?:IngMap,doughMap?:IngMap,tw?:string)=>{
    if(calcRef.current)return; calcRef.current=true;
    runCalc(tw??totalWt,spongeMap??sponge,doughMap??dough,field,ing,sec);
    calcRef.current=false;
  };

  const handleIngChange=(sec:string,name:string,key:string,val:string)=>{
    const prev=sec==="Sponge"?{...sponge}:{...dough};
    prev[name]={...prev[name],[key]:val};
    if(sec==="Sponge")setSponge(prev);else setDough(prev);
    if(autoCal){calcRef.current=false;setTimeout(()=>{triggerCalc(key,name,sec,sec==="Sponge"?prev:sponge,sec==="Dough"?prev:dough,totalWt);},0);}
  };

  const handleTotalWtChange=(val:string)=>{setTotalWt(val);if(autoCal)setTimeout(()=>triggerCalc("total_weight",null,null,sponge,dough,val),0);};

  const deleteIngredient=(sec:string,name:string)=>{
    if(sec==="Sponge")setSponge(p=>{const n={...p};delete n[name];return n;});
    else setDough(p=>{const n={...p};delete n[name];return n;});
  };

  const startRename=(sec:string,name:string)=>{ setRenamingKey({sec,name}); setRenameVal(name); };
  const commitRename=()=>{
    if(!renamingKey)return;
    const newName=renameVal.trim();
    if(!newName||newName===renamingKey.name){setRenamingKey(null);return;}
    const rebuild=(map:IngMap):IngMap=>{const r:IngMap={};Object.keys(map).forEach(k=>{r[k===renamingKey.name?newName:k]=map[k];});return r;};
    if(renamingKey.sec==="Sponge")setSponge(rebuild(sponge));else setDough(rebuild(dough));
    setRenamingKey(null);
  };

  const addIngredient=()=>{
    const n=newIngName.trim();if(!n)return;
    if(newIngSection==="sponge")setSponge(p=>({...p,[n]:{bakers:"",true:"",weight:""}}));
    else setDough(p=>({...p,[n]:{bakers:"",true:"",weight:""}}));
    setNewIngName("");setNewIngSection(null);
  };

  const collectRows=()=>{
    const rows:string[][]=[];
    Object.entries(sponge).forEach(([n,r])=>{if(r.bakers||r.true||r.weight)rows.push(["Sponge",n,r.bakers||"0.00",r.true||"0.00",r.weight||"0.00"]);});
    Object.entries(dough).forEach(([n,r])=>{if(r.bakers||r.true||r.weight)rows.push(["Dough",n,r.bakers||"0.00",r.true||"0.00",r.weight||"0.00"]);});
    return rows;
  };

  // ── SAVE ────────────────────────────────────────────────────────────────────
  const saveRecipe=async()=>{
    const n=saveNameInput.trim();if(!n)return;
    const rows=collectRows();
    const entry:RecipeEntry={
      dataset:rows,
      top_totals:{weight:totalWt,flour:totalFlour,water:totalWater},
      bottom_totals:{bakers:totBakers,true:totTrue,weight:totWeight},
      savedBy:currentUser,
      savedAt:new Date().toISOString(),
      source:saveDest,
    };
    if(saveDest==="local"){
      const newLocal={...localDb,[n]:{...entry,source:"local" as const}};
      setLocalDb(newLocal);
      const toStore:any={};
      Object.keys(newLocal).forEach(k=>{const{source,...rest}=newLocal[k] as any;toStore[k]=rest;});
      try{localStorage.setItem("recipes_db",JSON.stringify(toStore));}catch{}
      showToast(`"${n}" saved locally ✓`,"success");
    } else {
      setIsSaving(true);
      try{
        await ghSave(cloudDb,entry,n);
        const updated=await ghFetch(cloudDb);
        setCloudDb(updated);
        setCloudStatus("ok");
        showToast(`"${n}" saved to GitHub ✓`,"success");
      }catch(e:any){
        showToast("GitHub save failed: "+e.message,"error");
      }finally{setIsSaving(false);}
    }
    setActiveLabel(n);setSaveNameInput("");setView("calc");
  };

  // ── DELETE ──────────────────────────────────────────────────────────────────
  const deleteRecipe=async(key:string,source:"local"|"cloud")=>{
    if(source==="local"){
      const newLocal={...localDb};delete newLocal[key];
      setLocalDb(newLocal);
      const toStore:any={};
      Object.keys(newLocal).forEach(k=>{const{source:_s,...rest}=newLocal[k] as any;toStore[k]=rest;});
      try{localStorage.setItem("recipes_db",JSON.stringify(toStore));}catch{}
      showToast(`"${key}" deleted locally`,"info");
    } else {
      setIsSaving(true);
      try{
        await ghDelete(cloudDb,key);
        const updated=await ghFetch({});
        setCloudDb(updated);
        showToast(`"${key}" deleted from GitHub`,"info");
      }catch(e:any){
        showToast("GitHub delete failed: "+e.message,"error");
      }finally{setIsSaving(false);}
    }
    setAdminPrompt(null);
    setView("load");
  };

  // ── LOAD ────────────────────────────────────────────────────────────────────
  const loadRecipe=(key:string)=>{
    const rec=mergedDb[key];if(!rec)return;
    const newS=makeIngMap(DEFAULT_SPONGE);
    const newD=makeIngMap(DEFAULT_DOUGH);
    rec.dataset.forEach(([sec,name,bp,tp,wt])=>{
      const target=sec==="Sponge"?newS:newD;
      if(!target[name])target[name]={bakers:"",true:"",weight:""};
      target[name]={bakers:bp,true:tp,weight:wt};
    });
    setSponge(newS);setDough(newD);
    setTotalWt(rec.top_totals.weight);setTotalFlour(rec.top_totals.flour);setTotalWater(rec.top_totals.water);
    setTotBakers(rec.bottom_totals.bakers);setTotTrue(rec.bottom_totals.true);setTotWeight(rec.bottom_totals.weight);
    setActiveLabel(key);setView("calc");
  };

  // ── Filtered + sorted list ──────────────────────────────────────────────────
  const filteredKeys = Object.keys(mergedDb)
    .filter(k => filterSource==="all" || mergedDb[k].source===filterSource)
    .sort((a,b)=>{
      const ra=mergedDb[a], rb=mergedDb[b];
      if(sortBy==="name-az") return a.localeCompare(b);
      if(sortBy==="name-za") return b.localeCompare(a);
      if(sortBy==="date-new") return new Date(rb.savedAt||0).getTime()-new Date(ra.savedAt||0).getTime();
      return new Date(ra.savedAt||0).getTime()-new Date(rb.savedAt||0).getTime();
    });

  // ── Section renderer ────────────────────────────────────────────────────────
  const renderSection=(title:string,map:IngMap,secName:string)=>(
    <>
      <div className="section-hdr">
        <span style={{color:"var(--cyan)"}}>{title}</span>
        <span style={{textAlign:"center"}}>Bakers %</span>
        <span style={{textAlign:"center"}}>True %</span>
        <span style={{textAlign:"center"}}>Weight</span>
        <span></span>
      </div>
      {Object.entries(map).map(([name,row])=>{
        const isRenaming=renamingKey?.sec===secName&&renamingKey?.name===name;
        const holdKey=`${secName}__${name}`;
        return (
          <div className="ing-outer" key={name}>
            <div className="ing-row">
              <div className="ing-name-wrap">
                {isRenaming
                  ? <input className="ing-name-edit" autoFocus value={renameVal} onChange={e=>setRenameVal(e.target.value)} onBlur={commitRename} onKeyDown={e=>{if(e.key==="Enter")commitRename();if(e.key==="Escape")setRenamingKey(null);}}/>
                  : <span className="ing-name" title="Hold to rename"
                      onMouseDown={()=>{holdTimers.current[holdKey]=setTimeout(()=>startRename(secName,name),600);}}
                      onMouseUp={()=>clearTimeout(holdTimers.current[holdKey])}
                      onMouseLeave={()=>clearTimeout(holdTimers.current[holdKey])}
                      onTouchStart={()=>{holdTimers.current[holdKey]=setTimeout(()=>startRename(secName,name),600);}}
                      onTouchEnd={()=>clearTimeout(holdTimers.current[holdKey])}
                    >{name}</span>
                }
              </div>
              {(["bakers","true","weight"] as const).map(k=>(
                <input key={k} className="ing-input" type="number" value={row[k]} onChange={e=>handleIngChange(secName,name,k,e.target.value)} placeholder="0.00"/>
              ))}
              <button className="del-btn" title="Delete ingredient" onClick={()=>deleteIngredient(secName,name)}>🗑</button>
            </div>
          </div>
        );
      })}
      <button className="add-ing-btn" onClick={()=>{setNewIngSection(secName.toLowerCase());setNewIngName("");}}>
        + Add Ingredient ({secName})
      </button>
    </>
  );

  const rows=collectRows();

  // ── Views ───────────────────────────────────────────────────────────────────
  if(view==="save") return (
    <Modal title="Save Recipe" onClose={()=>setView("calc")} wide
      footer={<>
        <button className="btn btn-green" onClick={saveRecipe} style={{opacity:isSaving?.5:1}}>
          {isSaving?"Saving…":"Save"}
        </button>
        <button className="btn btn-red" onClick={()=>setView("calc")}>Cancel</button>
      </>}>
      <table className="preview-table">
        <thead><tr><th>Sec</th><th>Ingredient</th><th>Bakers %</th><th>True %</th><th>Weight</th></tr></thead>
        <tbody>{rows.map(([sec,n,b,t,w],i)=><tr key={i}><td>{sec}</td><td>{n}</td><td>{b}</td><td>{t}</td><td>{w}</td></tr>)}</tbody>
      </table>
      <div className="form-row">
        <span className="form-label">Recipe Name</span>
        <input className="form-input" value={saveNameInput} onChange={e=>setSaveNameInput(e.target.value)} placeholder="Enter recipe name"/>
      </div>
      <div style={{fontSize:12,color:"var(--muted)",marginBottom:8,fontWeight:600}}>Save to:</div>
      <div className="dest-toggle">
        <button className={`dest-btn${saveDest==="local"?" active local":""}`} onClick={()=>setSaveDest("local")}>💾 Local (this device)</button>
        <button className={`dest-btn${saveDest==="cloud"?" active cloud":""}`} onClick={()=>setSaveDest("cloud")}>☁️ Cloud (GitHub)</button>
      </div>
      {saveDest==="cloud"&&<div style={{fontSize:11,color:"var(--muted)"}}>Visible to all users on any device.</div>}
      {saveDest==="local"&&<div style={{fontSize:11,color:"var(--muted)"}}>Saved on this browser only.</div>}
    </Modal>
  );

  if(view==="load") return (
    <Modal title="Recipe Library" onClose={()=>setView("calc")} wide
      footer={<>
        <button className="btn btn-blue btn-small" onClick={()=>{setCloudStatus("loading");ghFetch({}).then(db=>{setCloudDb(db);setCloudStatus("ok");showToast("Cloud recipes refreshed","info");}).catch(()=>{setCloudStatus("err");showToast("Cloud refresh failed","error");});}}>
          ↻ Refresh Cloud
        </button>
        <button className="btn btn-red btn-small" onClick={()=>setView("calc")}>Close</button>
        <span className={`cloud-status ${cloudStatus==="ok"?"ok":cloudStatus==="err"?"err":"busy"}`}>
          {cloudStatus==="loading"?"⏳ Loading…":cloudStatus==="ok"?"☁️ Cloud OK":cloudStatus==="err"?"⚠️ Cloud error":""}
        </span>
      </>}>
      {/* Filter + Sort bar */}
      <div className="filter-bar">
        {(["all","local","cloud"] as const).map(s=>(
          <button key={s} className={`filter-btn${filterSource===s?" active":""}`} onClick={()=>setFilterSource(s)}>
            {s==="all"?"All":s==="local"?"💾 Local":"☁️ Cloud"}
          </button>
        ))}
        <select className="sort-select" value={sortBy} onChange={e=>setSortBy(e.target.value as any)}>
          <option value="date-new">Newest first</option>
          <option value="date-old">Oldest first</option>
          <option value="name-az">Name A→Z</option>
          <option value="name-za">Name Z→A</option>
        </select>
      </div>

      {filteredKeys.length===0
        ? <p style={{color:"var(--muted)",textAlign:"center",padding:"20px 0"}}>No recipes found.</p>
        : <div className="library-list">
            {filteredKeys.map(k=>{
              const rec=mergedDb[k];
              const dateStr=rec.savedAt?new Date(rec.savedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—";
              return (
                <div key={k} className="lib-item" onClick={()=>{setPreviewKey(k);setView("preview");}}>
                  <div className="lib-item-left">
                    <span className="lib-item-name">{k}</span>
                    <span className="lib-item-meta">By {rec.savedBy||"unknown"} · {dateStr}</span>
                  </div>
                  <div className="lib-item-right">
                    <span className={`source-badge ${rec.source}`}>{rec.source==="cloud"?"☁ CLOUD":"💾 LOCAL"}</span>
                    <span style={{color:"var(--muted)",fontSize:12}}>→</span>
                  </div>
                </div>
              );
            })}
          </div>
      }
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
    </Modal>
  );

  if(view==="preview"&&previewKey){
    const rec=mergedDb[previewKey];
    const dateStr=rec?.savedAt?new Date(rec.savedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—";
    return (
      <>
        {adminPrompt&&(
          <AdminPrompt
            message={`Delete "${adminPrompt.key}" from ${adminPrompt.source==="cloud"?"GitHub (affects all users)":"local storage"}?`}
            onConfirm={()=>deleteRecipe(adminPrompt.key,adminPrompt.source)}
            onCancel={()=>setAdminPrompt(null)}
          />
        )}
        <Modal title={`Preview: ${previewKey}`} onClose={()=>setView("load")} wide
          footer={<>
            <button className="btn btn-blue btn-small" onClick={()=>loadRecipe(previewKey)}>Load</button>
            <button className="btn btn-red btn-small" onClick={()=>setAdminPrompt({key:previewKey,source:rec.source})}>Delete</button>
            <button className="btn btn-gray btn-small" onClick={()=>setView("load")}>Back</button>
          </>}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12,fontSize:12,color:"var(--muted)"}}>
            <span>By <strong style={{color:"var(--text)"}}>{rec.savedBy||"unknown"}</strong></span>
            <span>·</span>
            <span>{dateStr}</span>
            <span>·</span>
            <span className={`source-badge ${rec.source}`}>{rec.source==="cloud"?"☁ CLOUD":"💾 LOCAL"}</span>
          </div>
          <table className="preview-table">
            <thead><tr><th>Ingredient</th><th>Bakers %</th><th>True %</th><th>Weight</th></tr></thead>
            <tbody>{rec.dataset.map(([sec,n,b,t,w],i)=><tr key={i}><td>{n} ({sec})</td><td>{b}</td><td>{t}</td><td>{w}</td></tr>)}</tbody>
          </table>
        </Modal>
      </>
    );
  }

  // ── Main calc view ──────────────────────────────────────────────────────────
  return (
    <>
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      <Modal title="04. Recipe Calculator" onClose={onClose} wide
        footer={<>
          <button className="btn btn-green btn-small" onClick={()=>{if(collectRows().length>2)setView("save");}}>Save</button>
          <button className="btn btn-blue btn-small" onClick={()=>setView("load")}>Load</button>
          <button className="btn btn-purple btn-small" onClick={()=>triggerCalc(null,null,null,sponge,dough,totalWt)}>Calculate</button>
          <button className="btn btn-red btn-small" onClick={onClose}>Close</button>
        </>}>

        {newIngSection&&(
          <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"12px 14px",marginBottom:14}}>
            <p style={{fontSize:13,marginBottom:8,color:"var(--muted)",fontWeight:600}}>New ingredient name ({newIngSection}):</p>
            <div style={{display:"flex",gap:8}}>
              <input className="form-input" value={newIngName} onChange={e=>setNewIngName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addIngredient()} placeholder="e.g. Salt, Milk…" style={{flex:1}}/>
              <button className="btn btn-green btn-small" onClick={addIngredient}>Add</button>
              <button className="btn btn-gray btn-small" onClick={()=>setNewIngSection(null)}>✕</button>
            </div>
          </div>
        )}

        <div className="recipe-ctrl-bar">
          <span className="recipe-active-label">Active: {activeLabel}</span>
          <label className="autocal-row">
            <input type="checkbox" checked={autoCal} onChange={e=>setAutoCal(e.target.checked)}/>
            Auto-calculate
          </label>
        </div>

        <div className="totals-bar">
          <div className="total-cell"><label>TOTAL WT</label><input type="number" value={totalWt} onChange={e=>handleTotalWtChange(e.target.value)} placeholder="0.00"/></div>
          <div className="total-cell"><label>TOTAL FLOUR</label><input type="number" readOnly value={totalFlour} placeholder="0.00"/></div>
          <div className="total-cell"><label>TOTAL WATER</label><input type="number" readOnly value={totalWater} placeholder="0.00"/></div>
        </div>

        <div style={{maxHeight:"42vh",overflowY:"auto",paddingRight:2}}>
          {renderSection("Sponge Section",sponge,"Sponge")}
          {renderSection("Dough / Batter Section",dough,"Dough")}
          <div className="summary-row">
            <span className="summary-label">Total</span>
            <div className="summary-val">{totBakers}</div>
            <div className={`summary-val${trueWarn?" warn":""}`}>{totTrue}</div>
            <div className="summary-val">{totWeight}</div>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]     = useState("login");
  const [userInput, setUser]    = useState("");
  const [passInput, setPass]    = useState("");
  const [loginErr, setErr]      = useState("");
  const [modal, setModal]       = useState<string|null>(null);
  const [lastFF, setLastFF]     = useState(0);
  const [lastWT, setLastWT]     = useState(0);
  const [currentUser, setCurrentUser] = useState("");

  const login=()=>{
    const USERS:Record<string,string>={admin:"8707",user:"ufm46"};
    if(USERS[userInput]&&USERS[userInput]===passInput){setCurrentUser(userInput);setScreen("dashboard");setErr("");}
    else setErr("Invalid username or password.");
  };

  const cards=[
    {num:"01",title:"FF Calculator",         sub:"Friction factor from WT, FT & ADT",    key:"ff"},
    {num:"02",title:"Water Temp Calculator", sub:"Calculate water temperature (Cal WT)", key:"wt"},
    {num:"03",title:"Ice Temp Calculator",   sub:"Calc ice weight & remaining water",     key:"ice"},
    {num:"04",title:"Recipe Calculator",     sub:"Bidirectional bakers % matrix",         key:"recipe"},
  ];

  return (
    <>
      <style>{CSS}</style>
      {screen==="login"&&(
        <div className="login-wrap">
          <div className="login-card">
            <div className="login-title">WELCOME</div>
            <div className="field"><label>USERNAME</label><input value={userInput} onChange={e=>setUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="admin"/></div>
            <div className="field"><label>PASSWORD</label><input type="password" value={passInput} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="••••"/></div>
            <button className="btn-primary" onClick={login}>LOGIN</button>
            <div className="error-msg">{loginErr}</div>
          </div>
        </div>
      )}
      {screen==="dashboard"&&(
        <div className="app-wrap">
          <div className="app-header">
            <div className="app-title">BAKERY CALCULATORS</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:12,color:"var(--muted)"}}>👤 {currentUser}</span>
              <button className="btn-logout" onClick={()=>{setScreen("login");setUser("");setPass("");setCurrentUser("");}}>Logout</button>
            </div>
          </div>
          <div className="grid-2x2">
            {cards.map(c=>(
              <div key={c.key} className="calc-card" onClick={()=>setModal(c.key)}>
                <div className="card-num">{c.num}</div>
                <div className="card-title" style={{color:"var(--text)"}}>{c.title}</div>
                <div className="card-sub">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {modal==="ff"     &&<FFCalc        onClose={()=>setModal(null)} onResult={setLastFF}/>}
      {modal==="wt"     &&<WaterTempCalc onClose={()=>setModal(null)} lastFF={lastFF} onResult={setLastWT}/>}
      {modal==="ice"    &&<IceTempCalc   onClose={()=>setModal(null)} lastWT={lastWT}/>}
      {modal==="recipe" &&<RecipeCalc    onClose={()=>setModal(null)} currentUser={currentUser}/>}
    </>
  );
}
