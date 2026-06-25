import { useState, useCallback, useRef } from "react";

// ── Design tokens ────────────────────────────────────────────────────────────
// Palette: deep navy bg, warm cream text, cyan accent, amber highlight
// Aesthetic: professional bakery data tool — clean grid, monospaced numerics
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0f1117;
    --surface:   #1a1d27;
    --surface2:  #22263a;
    --border:    #2e3450;
    --cyan:      #00c8ff;
    --amber:     #f5a623;
    --green:     #3ecf72;
    --red:       #e05252;
    --text:      #e8eaf0;
    --muted:     #7a82a0;
    --mono:      'JetBrains Mono', monospace;
    --sans:      'Inter', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--sans); min-height: 100vh; }

  /* LOGIN */
  .login-wrap { display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .login-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 40px 36px;
    width: 340px;
  }
  .login-title { font-size: 26px; font-weight: 700; color: var(--cyan); letter-spacing: 2px; margin-bottom: 28px; text-align:center; }
  .field { margin-bottom: 16px; }
  .field label { display:block; font-size: 12px; font-weight:600; color: var(--muted); letter-spacing:1px; margin-bottom:6px; }
  .field input {
    width:100%; padding: 10px 14px; border-radius:8px;
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); font-size: 15px; font-family: var(--sans);
    outline:none; transition: border-color .15s;
  }
  .field input:focus { border-color: var(--cyan); }
  .btn-primary {
    width:100%; padding:12px; border-radius:8px; border:none; cursor:pointer;
    background: var(--cyan); color: #0f1117; font-size:15px; font-weight:700;
    font-family:var(--sans); letter-spacing:.5px; transition: opacity .15s;
  }
  .btn-primary:hover { opacity:.88; }
  .error-msg { color: var(--red); font-size:13px; margin-top:10px; text-align:center; min-height:20px; }

  /* DASHBOARD */
  .app-wrap { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
  .app-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; }
  .app-title { font-size: 20px; font-weight:700; color: var(--cyan); letter-spacing:1px; }
  .btn-logout {
    padding: 8px 18px; border-radius:6px; border:1px solid var(--red);
    background:transparent; color: var(--red); font-size:13px; font-weight:600;
    cursor:pointer; font-family:var(--sans); transition: background .15s;
  }
  .btn-logout:hover { background: rgba(224,82,82,.12); }

  .grid-2x2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .calc-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius:12px; padding:28px 24px; cursor:pointer;
    transition: border-color .2s, transform .15s;
    display:flex; flex-direction:column; gap:8px;
  }
  .calc-card:hover { border-color: var(--cyan); transform: translateY(-2px); }
  .card-num { font-size:11px; font-weight:700; color: var(--muted); letter-spacing:2px; }
  .card-title { font-size:18px; font-weight:700; }
  .card-sub { font-size:13px; color: var(--muted); }

  /* MODAL */
  .modal-overlay {
    position:fixed; inset:0; background: rgba(0,0,0,.65);
    display:flex; align-items:center; justify-content:center; z-index:100;
    padding: 16px;
  }
  .modal {
    background: var(--surface); border:1px solid var(--border);
    border-radius:12px; width:100%; max-width:500px;
    max-height:90vh; display:flex; flex-direction:column;
  }
  .modal-header {
    padding:18px 22px 14px; border-bottom:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
  }
  .modal-title { font-size:16px; font-weight:700; color: var(--cyan); }
  .modal-close {
    background:none; border:none; color: var(--muted); font-size:20px;
    cursor:pointer; line-height:1; padding:2px 6px; border-radius:4px;
  }
  .modal-close:hover { color: var(--text); }
  .modal-body { padding:20px 22px; overflow-y:auto; flex:1; }
  .modal-footer { padding:14px 22px; border-top:1px solid var(--border); display:flex; gap:10px; flex-shrink:0; }

  /* FORM ROWS */
  .form-row { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .form-label { font-size:13px; color: var(--muted); min-width:140px; font-weight:500; }
  .form-input {
    flex:1; padding:9px 12px; border-radius:7px;
    background: var(--surface2); border:1px solid var(--border);
    color: var(--text); font-family: var(--mono); font-size:14px;
    outline:none; transition: border-color .15s;
  }
  .form-input:focus { border-color: var(--cyan); }
  .form-input[readonly] { color: var(--cyan); background: rgba(0,200,255,.07); border-color: rgba(0,200,255,.2); }
  .form-input.error { border-color: var(--red); background: rgba(224,82,82,.07); color: var(--red); }

  /* BUTTONS */
  .btn { padding:10px 18px; border-radius:7px; border:none; cursor:pointer; font-size:14px; font-weight:600; font-family:var(--sans); transition: opacity .15s; }
  .btn:hover { opacity:.85; }
  .btn-green  { background: var(--green);  color:#0f1117; }
  .btn-blue   { background: var(--cyan);   color:#0f1117; }
  .btn-purple { background: #7c4dff;       color:#fff; }
  .btn-red    { background: var(--red);    color:#fff; }
  .btn-gray   { background: var(--surface2); color:var(--text); border:1px solid var(--border); }
  .btn-teal   { background: #00b3a0;       color:#0f1117; }
  .btn-small  { padding:6px 12px; font-size:12px; }

  /* GET BUTTON inline */
  .get-btn {
    padding:9px 12px; border-radius:7px; border:none; background: var(--cyan);
    color:#0f1117; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap;
  }

  /* RECIPE CALCULATOR */
  .recipe-modal { max-width:700px; }
  .recipe-ctrl-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .recipe-active-label { font-size:13px; font-weight:700; color: var(--amber); }
  .autocal-row { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); }
  .autocal-row input[type=checkbox] { accent-color: var(--cyan); width:14px; height:14px; }

  .totals-bar {
    display:grid; grid-template-columns:repeat(3,1fr); gap:8px;
    background: var(--surface2); border-radius:8px; padding:10px 12px; margin-bottom:14px;
  }
  .total-cell { display:flex; flex-direction:column; gap:3px; }
  .total-cell label { font-size:10px; color:var(--muted); letter-spacing:.5px; font-weight:600; }
  .total-cell input {
    padding:6px 8px; border-radius:5px; border:1px solid var(--border);
    background:var(--surface); color:var(--text); font-family:var(--mono); font-size:13px; outline:none;
    transition: border-color .15s;
  }
  .total-cell input:focus { border-color: var(--cyan); }
  .total-cell input[readonly] { color:var(--cyan); background:rgba(0,200,255,.06); }

  .section-hdr {
    display:grid; grid-template-columns:2fr 1fr 1fr 1fr;
    padding:6px 8px; background:var(--surface2); border-radius:6px; margin-bottom:6px;
    font-size:11px; font-weight:700; color:var(--muted); letter-spacing:.5px; gap:4px;
  }
  .ing-row {
    display:grid; grid-template-columns:2fr 1fr 1fr 1fr;
    gap:4px; margin-bottom:4px; align-items:center;
  }
  .ing-name { font-size:13px; font-weight:500; padding:0 4px; }
  .ing-input {
    padding:6px 6px; border-radius:5px; border:1px solid var(--border);
    background:var(--surface2); color:var(--text); font-family:var(--mono);
    font-size:13px; outline:none; width:100%; transition: border-color .15s;
  }
  .ing-input:focus { border-color:var(--cyan); }
  .ing-input.error-field { border-color:var(--red); background:rgba(224,82,82,.08); }

  .summary-row {
    display:grid; grid-template-columns:2fr 1fr 1fr 1fr;
    gap:4px; align-items:center; margin-top:6px;
    background:rgba(0,200,255,.05); border-radius:6px; padding:6px 0;
  }
  .summary-label { font-size:12px; font-weight:700; color:var(--muted); padding:0 4px; }
  .summary-val {
    padding:6px 6px; border-radius:5px; font-family:var(--mono); font-size:13px;
    color:var(--cyan); text-align:center; background:rgba(0,200,255,.07);
    border:1px solid rgba(0,200,255,.2);
  }
  .summary-val.warn { color:var(--red); background:rgba(224,82,82,.1); border-color:rgba(224,82,82,.3); }
  .add-ing-btn {
    width:100%; padding:7px; border-radius:6px; border:1px dashed var(--border);
    background:transparent; color:var(--muted); font-size:12px; cursor:pointer;
    font-family:var(--sans); margin-top:4px; margin-bottom:12px; transition: border-color .15s, color .15s;
  }
  .add-ing-btn:hover { border-color: var(--green); color: var(--green); }

  /* RECIPE LIBRARY */
  .library-list { display:flex; flex-direction:column; gap:8px; }
  .lib-item {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 14px; background:var(--surface2); border-radius:8px;
    border:1px solid var(--border); cursor:pointer; transition: border-color .15s;
  }
  .lib-item:hover { border-color:var(--cyan); }
  .lib-item-name { font-size:14px; font-weight:600; }
  .preview-table { width:100%; border-collapse:collapse; font-size:13px; margin-bottom:10px; }
  .preview-table th { background:var(--surface2); padding:6px 8px; text-align:center; font-size:11px; color:var(--muted); font-weight:700; }
  .preview-table td { padding:6px 8px; text-align:center; border-bottom:1px solid var(--border); font-family:var(--mono); }

  @media(max-width:600px) {
    .grid-2x2 { grid-template-columns:1fr; }
    .modal { max-width:100%; }
    .recipe-modal { max-width:100%; }
  }
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
const f = (v, d = 0) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
const fmt = (n) => isNaN(n) ? "" : String(Math.round(n * 100) / 100);

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer, wide }) {
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

// ── FF Calculator ─────────────────────────────────────────────────────────────
function FFCalc({ onClose, onResult }) {
  const [wt, setWt] = useState(""); const [ft, setFt] = useState(""); const [adt, setAdt] = useState("");
  const [result, setResult] = useState("");
  const calc = () => {
    try {
      const r = (3 * f(adt)) - f(ft) - f(wt) - f(ft);
      const res = fmt(r);
      setResult(res);
      onResult(r);
    } catch { setResult("Error"); }
  };
  return (
    <Modal title="01. FF Calculator" onClose={onClose}
      footer={<><button className="btn btn-green" onClick={calc}>Calculate</button><button className="btn btn-red" onClick={onClose}>Close</button></>}>
      {[["01. WT", wt, setWt], ["02. FT", ft, setFt], ["03. ADT", adt, setAdt]].map(([l, v, s]) => (
        <div className="form-row" key={l}>
          <span className="form-label">{l}</span>
          <input className="form-input" type="number" value={v} onChange={e => s(e.target.value)} placeholder="0.00" />
        </div>
      ))}
      <div className="form-row">
        <span className="form-label">04. FF (Result)</span>
        <input className="form-input" readOnly value={result} placeholder="—" />
      </div>
    </Modal>
  );
}

// ── Water Temp Calculator ─────────────────────────────────────────────────────
function WaterTempCalc({ onClose, lastFF, onResult }) {
  const [ddt, setDdt] = useState(""); const [rt, setRt] = useState(""); const [ft, setFt] = useState("");
  const [ff, setFf] = useState(""); const [result, setResult] = useState("");
  const calc = () => {
    try {
      const r = (3 * f(ddt)) - f(rt) - f(ft) - f(ff);
      const res = fmt(r);
      setResult(res);
      onResult(r);
    } catch { setResult("Error"); }
  };
  return (
    <Modal title="02. Water Temp Calculator" onClose={onClose}
      footer={<><button className="btn btn-teal" onClick={calc}>Calculate</button><button className="btn btn-red" onClick={onClose}>Close</button></>}>
      {[["01. DDT", ddt, setDdt], ["02. RT", rt, setRt], ["03. FT", ft, setFt]].map(([l, v, s]) => (
        <div className="form-row" key={l}>
          <span className="form-label">{l}</span>
          <input className="form-input" type="number" value={v} onChange={e => s(e.target.value)} placeholder="0.00" />
        </div>
      ))}
      <div className="form-row">
        <span className="form-label">04. FF</span>
        <input className="form-input" type="number" value={ff} onChange={e => setFf(e.target.value)} placeholder="0.00" style={{flex:1}} />
        <button className="get-btn" onClick={() => setFf(fmt(lastFF))}>Get FF</button>
      </div>
      <div className="form-row">
        <span className="form-label">05. Cal WT (Result)</span>
        <input className="form-input" readOnly value={result} placeholder="—" />
      </div>
    </Modal>
  );
}

// ── Ice Temp Calculator ───────────────────────────────────────────────────────
function IceTempCalc({ onClose, lastWT }) {
  const [reqWater, setReqWater] = useState(""); const [wt, setWt] = useState("");
  const [calWt, setCalWt] = useState(""); const [iceRes, setIceRes] = useState(""); const [waterRes, setWaterRes] = useState("");
  const calc = () => {
    try {
      const rw = f(reqWater), w = f(wt), c = f(calWt);
      if ((w + 80) === 0) { setIceRes("Div/0"); setWaterRes("Error"); return; }
      const ice = rw * (w - c) / (w + 80);
      const water = rw - ice;
      setIceRes(fmt(ice)); setWaterRes(fmt(water));
    } catch { setIceRes("Error"); setWaterRes("Error"); }
  };
  return (
    <Modal title="03. Ice Temp Calculator" onClose={onClose}
      footer={<><button className="btn btn-blue" onClick={calc}>Calculate</button><button className="btn btn-red" onClick={onClose}>Close</button></>}>
      <div className="form-row">
        <span className="form-label">01. Req Water Wt</span>
        <input className="form-input" type="number" value={reqWater} onChange={e => setReqWater(e.target.value)} placeholder="0.00" />
      </div>
      <div className="form-row">
        <span className="form-label">02. WT</span>
        <input className="form-input" type="number" value={wt} onChange={e => setWt(e.target.value)} placeholder="0.00" />
      </div>
      <div className="form-row">
        <span className="form-label">03. Cal WT</span>
        <input className="form-input" type="number" value={calWt} onChange={e => setCalWt(e.target.value)} placeholder="0.00" style={{flex:1}} />
        <button className="get-btn" onClick={() => setCalWt(fmt(lastWT))}>Get WT</button>
      </div>
      <div className="form-row">
        <span className="form-label">04. Calc Ice Wt</span>
        <input className="form-input" readOnly value={iceRes} placeholder="—" />
      </div>
      <div className="form-row">
        <span className="form-label">05. Calc Water Wt</span>
        <input className="form-input" readOnly value={waterRes} placeholder="—" />
      </div>
    </Modal>
  );
}

// ── Recipe Calculator ─────────────────────────────────────────────────────────
const DEFAULT_SPONGE = ["Flour", "Water", "Yeast"];
const DEFAULT_DOUGH  = ["Flour", "Water", "Sugar", "Shortening", "MSNF"];

function makeIngMap(names) {
  const m = {};
  names.forEach(n => { m[n] = { bakers: "", true: "", weight: "" }; });
  return m;
}

function RecipeCalc({ onClose, db, setDb }) {
  const [activeLabel, setActiveLabel]   = useState("New Formulation");
  const [autoCal, setAutoCal]           = useState(false);
  const [totalWt, setTotalWt]           = useState("");
  const [totalFlour, setTotalFlour]     = useState("0.00");
  const [totalWater, setTotalWater]     = useState("0.00");
  const [totBakers, setTotBakers]       = useState("0.00");
  const [totTrue, setTotTrue]           = useState("0.00");
  const [totWeight, setTotWeight]       = useState("0.00");
  const [trueWarn, setTrueWarn]         = useState(false);
  const [sponge, setSponge]             = useState(() => makeIngMap(DEFAULT_SPONGE));
  const [dough, setDough]               = useState(() => makeIngMap(DEFAULT_DOUGH));
  const [view, setView]                 = useState("calc"); // calc | save | load | preview
  const [previewKey, setPreviewKey]     = useState(null);
  const [saveNameInput, setSaveNameInput] = useState("");
  const [newIngSection, setNewIngSection] = useState(null);
  const [newIngName, setNewIngName]     = useState("");
  const calcRef = useRef(false);

  // ── Calculation engine ──────────────────────────────────────────────────────
  const runCalc = useCallback((
    tWt, spongeMap, doughMap,
    trigField = null, trigIng = null, trigSec = null
  ) => {
    const _f = (v) => { const n = parseFloat(v); return (isNaN(n) || !isFinite(n)) ? 0 : n; };

    const spongeHas = Object.values(spongeMap).some(r => r.bakers || r.true || r.weight);
    const doughHas  = Object.values(doughMap).some(r => r.bakers || r.true || r.weight);

    const newS = JSON.parse(JSON.stringify(spongeMap));
    const newD = JSON.parse(JSON.stringify(doughMap));

    let totalDoughWeight = _f(tWt);

    // STEP 3: True% → Bakers%
    if (trigField === "true" && trigIng && trigSec) {
      const target = trigSec === "Sponge" ? newS : newD;
      if (target[trigIng]) {
        const ingTrueVal = _f(target[trigIng].true);
        let flourTruePct = 0;
        for (const sec of [newS, newD]) {
          if (sec["Flour"]) { const c = _f(sec["Flour"].true); if (c > 0) { flourTruePct = c; break; } }
        }
        if (flourTruePct > 0 && ingTrueVal > 0) {
          target[trigIng].bakers = fmt((ingTrueVal / flourTruePct) * 100);
        }
      }
    }

    // STEP 4: True% + Weight → Total Dough Weight
    if ((trigField === "weight" || trigField === "true") && trigIng && trigSec) {
      const target = trigSec === "Sponge" ? newS : newD;
      if (target[trigIng]) {
        const rowTrue = _f(target[trigIng].true), rowWt = _f(target[trigIng].weight);
        if (rowTrue > 0 && rowWt > 0) {
          const derived = (rowWt / rowTrue) * 100;
          const newTw = fmt(derived);
          if (totalDoughWeight === 0 || newTw !== fmt(totalDoughWeight)) {
            totalDoughWeight = derived;
            setTotalWt(newTw);
          }
        }
      }
    }

    // STEP 5: Flour auto-100% for dough-only
    if (!spongeHas && doughHas && newD["Flour"]) {
      if (!(trigField === "bakers" && trigIng === "Flour" && trigSec === "Dough")) {
        if (_f(newD["Flour"].bakers) === 0) newD["Flour"].bakers = "100.00";
      }
    }

    // STEP 6: Total bakers sum (sponge water excluded)
    let totalBakersSum = 0;
    Object.entries(newS).forEach(([n, r]) => { if (n !== "Water") totalBakersSum += _f(r.bakers); });
    Object.values(newD).forEach(r => { totalBakersSum += _f(r.bakers); });
    if (totalBakersSum === 0) totalBakersSum = 100;

    // STEP 7: full matrix
    let runTrueSum = 0, runFlourWt = 0, runWaterWt = 0, totalAccumWt = 0;

    for (const [secName, secMap] of [["Sponge", newS], ["Dough", newD]]) {
      for (const [name, row] of Object.entries(secMap)) {
        let bVal = _f(row.bakers), tVal = _f(row.true), wVal = _f(row.weight);
        const ownB = trigField === "bakers" && trigIng === name && trigSec === secName;
        const ownT = trigField === "true"   && trigIng === name && trigSec === secName;
        const ownW = trigField === "weight" && trigIng === name && trigSec === secName;

        // Derive true from bakers
        if (bVal > 0 && !ownT) {
          let compTrue;
          if (name === "Water" && secName === "Sponge") {
            const sfb = _f(newS["Flour"]?.bakers ?? 0);
            compTrue = totalBakersSum > 0 ? (sfb * bVal) / totalBakersSum : 0;
          } else if (name === "Water" && secName === "Dough") {
            const swt = _f(newS["Water"]?.true ?? 0);
            const raw = totalBakersSum > 0 ? (bVal / totalBakersSum) * 100 : 0;
            compTrue = Math.max(raw - swt, 0);
          } else {
            compTrue = (bVal * 100) / totalBakersSum;
          }
          const nt = compTrue > 0 ? fmt(compTrue) : "";
          if (row.true !== nt) row.true = nt;
          tVal = compTrue;
        }

        // Weight from true
        if (tVal > 0 && totalDoughWeight > 0 && !ownW) {
          const cw = (totalDoughWeight * tVal) / 100;
          const nw = cw > 0 ? fmt(cw) : "";
          if (row.weight !== nw) row.weight = nw;
          wVal = cw;
        } else if (wVal > 0 && bVal === 0 && totalDoughWeight > 0 && !ownT) {
          const ct = (wVal / totalDoughWeight) * 100;
          const nt = ct > 0 ? fmt(ct) : "";
          if (row.true !== nt) row.true = nt;
          tVal = ct;
        }

        tVal = _f(row.true); wVal = _f(row.weight);
        if (name.toLowerCase() === "flour") runFlourWt += wVal;
        if (name.toLowerCase() === "water") runWaterWt += wVal;
        runTrueSum  += tVal;
        totalAccumWt += wVal;
      }
    }

    setTotalFlour(fmt(runFlourWt) || "0.00");
    setTotalWater(fmt(runWaterWt) || "0.00");
    if (trigField !== "total_weight" && totalAccumWt > 0 && totalDoughWeight === 0) {
      const newTw = fmt(totalAccumWt);
      setTotalWt(newTw);
    }
    setTotBakers(fmt(totalBakersSum));
    setTotTrue(fmt(runTrueSum));
    setTotWeight(fmt(totalAccumWt));
    setTrueWarn(runTrueSum > 0 && !(runTrueSum >= 99 && runTrueSum <= 100.01));

    setSponge(newS);
    setDough(newD);
  }, []);

  const triggerCalc = (field, ing, sec, spongeMap, doughMap, tw) => {
    if (calcRef.current) return;
    calcRef.current = true;
    runCalc(tw ?? totalWt, spongeMap ?? sponge, doughMap ?? dough, field, ing, sec);
    calcRef.current = false;
  };

  const handleIngChange = (sec, name, key, val) => {
    const prev = sec === "Sponge" ? { ...sponge } : { ...dough };
    prev[name] = { ...prev[name], [key]: val };
    if (sec === "Sponge") setSponge(prev); else setDough(prev);
    if (autoCal) {
      calcRef.current = false;
      setTimeout(() => {
        triggerCalc(key, name, sec, sec === "Sponge" ? prev : sponge, sec === "Dough" ? prev : dough, totalWt);
      }, 0);
    }
  };

  const handleTotalWtChange = (val) => {
    setTotalWt(val);
    if (autoCal) setTimeout(() => triggerCalc("total_weight", null, null, sponge, dough, val), 0);
  };

  const addIngredient = () => {
    const n = newIngName.trim();
    if (!n) return;
    if (newIngSection === "sponge") setSponge(p => ({ ...p, [n]: { bakers:"", true:"", weight:"" } }));
    else setDough(p => ({ ...p, [n]: { bakers:"", true:"", weight:"" } }));
    setNewIngName(""); setNewIngSection(null);
  };

  // ── SAVE ──
  const collectRows = () => {
    const rows = [];
    Object.entries(sponge).forEach(([n, r]) => {
      if (r.bakers || r.true || r.weight) rows.push(["Sponge", n, r.bakers||"0.00", r.true||"0.00", r.weight||"0.00"]);
    });
    Object.entries(dough).forEach(([n, r]) => {
      if (r.bakers || r.true || r.weight) rows.push(["Dough", n, r.bakers||"0.00", r.true||"0.00", r.weight||"0.00"]);
    });
    return rows;
  };

  const saveRecipe = () => {
    const n = saveNameInput.trim(); if (!n) return;
    const rows = collectRows();
    const newDb = { ...db, [n]: {
      dataset: rows,
      top_totals: { weight: totalWt, flour: totalFlour, water: totalWater },
      bottom_totals: { bakers: totBakers, true: totTrue, weight: totWeight }
    }};
    setDb(newDb);
    try { localStorage.setItem("recipes_db", JSON.stringify(newDb)); } catch {}
    setActiveLabel(n); setSaveNameInput(""); setView("calc");
  };

  const deleteRecipe = (key) => {
    const newDb = { ...db }; delete newDb[key];
    setDb(newDb);
    try { localStorage.setItem("recipes_db", JSON.stringify(newDb)); } catch {}
    setView("load");
  };

  const loadRecipe = (key) => {
    const rec = db[key]; if (!rec) return;
    const newS = makeIngMap(DEFAULT_SPONGE);
    const newD = makeIngMap(DEFAULT_DOUGH);
    rec.dataset.forEach(([sec, name, bp, tp, wt]) => {
      const target = sec === "Sponge" ? newS : newD;
      if (!target[name]) target[name] = { bakers:"", true:"", weight:"" };
      target[name] = { bakers: bp, true: tp, weight: wt };
    });
    setSponge(newS); setDough(newD);
    setTotalWt(rec.top_totals.weight); setTotalFlour(rec.top_totals.flour); setTotalWater(rec.top_totals.water);
    setTotBakers(rec.bottom_totals.bakers); setTotTrue(rec.bottom_totals.true); setTotWeight(rec.bottom_totals.weight);
    setActiveLabel(key); setView("calc");
  };

  const rows = collectRows();

  // ── Section renderer ────────────────────────────────────────────────────────
  const renderSection = (title, map, secName) => (
    <>
      <div className="section-hdr">
        <span style={{color: "var(--cyan)"}}>{title}</span>
        <span style={{textAlign:"center"}}>Bakers %</span>
        <span style={{textAlign:"center"}}>True %</span>
        <span style={{textAlign:"center"}}>Weight</span>
      </div>
      {Object.entries(map).map(([name, row]) => (
        <div className="ing-row" key={name}>
          <span className="ing-name">{name}</span>
          {["bakers","true","weight"].map(k => (
            <input key={k} className="ing-input" type="number" value={row[k]}
              onChange={e => handleIngChange(secName, name, k, e.target.value)}
              placeholder="0.00" />
          ))}
        </div>
      ))}
      <button className="add-ing-btn" onClick={() => { setNewIngSection(secName.toLowerCase()); setNewIngName(""); }}>
        + Add Ingredient ({secName})
      </button>
    </>
  );

  // ── Views ───────────────────────────────────────────────────────────────────
  if (view === "save") return (
    <Modal title="Save Recipe" onClose={() => setView("calc")} wide
      footer={<><button className="btn btn-green" onClick={saveRecipe}>Save</button><button className="btn btn-red" onClick={() => setView("calc")}>Cancel</button></>}>
      <table className="preview-table">
        <thead><tr><th>Sec</th><th>Ingredient</th><th>Bakers %</th><th>True %</th><th>Weight</th></tr></thead>
        <tbody>{rows.map(([sec,n,b,t,w],i) => <tr key={i}><td>{sec}</td><td>{n}</td><td>{b}</td><td>{t}</td><td>{w}</td></tr>)}</tbody>
      </table>
      <div className="form-row">
        <span className="form-label">Recipe Name</span>
        <input className="form-input" value={saveNameInput} onChange={e => setSaveNameInput(e.target.value)} placeholder="Enter recipe name" />
      </div>
    </Modal>
  );

  if (view === "load") return (
    <Modal title="Database Library" onClose={() => setView("calc")} wide
      footer={<button className="btn btn-red" onClick={() => setView("calc")}>Cancel</button>}>
      {Object.keys(db).length === 0
        ? <p style={{color:"var(--muted)", textAlign:"center", padding:"20px 0"}}>No saved recipes found.</p>
        : <div className="library-list">
            {Object.keys(db).map(k => (
              <div key={k} className="lib-item" onClick={() => { setPreviewKey(k); setView("preview"); }}>
                <span className="lib-item-name">{k}</span>
                <span style={{color:"var(--muted)", fontSize:12}}>View →</span>
              </div>
            ))}
          </div>}
    </Modal>
  );

  if (view === "preview" && previewKey) {
    const rec = db[previewKey];
    return (
      <Modal title={`Preview: ${previewKey}`} onClose={() => setView("load")} wide
        footer={<>
          <button className="btn btn-blue" onClick={() => loadRecipe(previewKey)}>Load</button>
          <button className="btn btn-red" onClick={() => deleteRecipe(previewKey)}>Delete</button>
          <button className="btn btn-gray" onClick={() => setView("load")}>Back</button>
        </>}>
        <table className="preview-table">
          <thead><tr><th>Ingredient</th><th>Bakers %</th><th>True %</th><th>Weight</th></tr></thead>
          <tbody>{rec.dataset.map(([sec,n,b,t,w],i) => <tr key={i}><td>{n} ({sec})</td><td>{b}</td><td>{t}</td><td>{w}</td></tr>)}</tbody>
        </table>
      </Modal>
    );
  }

  return (
    <Modal title="04. Recipe Calculator" onClose={onClose} wide
      footer={<>
        <button className="btn btn-green btn-small" onClick={() => { if (collectRows().length > 2) setView("save"); }}>Save</button>
        <button className="btn btn-blue btn-small"  onClick={() => setView("load")}>Load</button>
        <button className="btn btn-purple btn-small" onClick={() => triggerCalc(null, null, null, sponge, dough, totalWt)}>Calculate</button>
        <button className="btn btn-red btn-small"   onClick={onClose}>Close</button>
      </>}>

      {/* Add ingredient dialog */}
      {newIngSection && (
        <div style={{background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8, padding:"12px 14px", marginBottom:14}}>
          <p style={{fontSize:13, marginBottom:8, color:"var(--muted)", fontWeight:600}}>New ingredient name ({newIngSection}):</p>
          <div style={{display:"flex", gap:8}}>
            <input className="form-input" value={newIngName} onChange={e => setNewIngName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addIngredient()} placeholder="e.g. Salt, Milk…" style={{flex:1}} />
            <button className="btn btn-green btn-small" onClick={addIngredient}>Add</button>
            <button className="btn btn-gray btn-small" onClick={() => setNewIngSection(null)}>✕</button>
          </div>
        </div>
      )}

      <div className="recipe-ctrl-bar">
        <span className="recipe-active-label">Active: {activeLabel}</span>
        <label className="autocal-row">
          <input type="checkbox" checked={autoCal} onChange={e => setAutoCal(e.target.checked)} />
          Auto-calculate
        </label>
      </div>

      <div className="totals-bar">
        {[["Total Wt", totalWt, setTotalWtWrapper, false], ["Total Flour", totalFlour, null, true], ["Total Water", totalWater, null, true]].map(([l,v,s,ro]) => (
          <div className="total-cell" key={l}>
            <label>{l}</label>
            <input type="number" value={v} readOnly={ro}
              onChange={ro ? undefined : e => handleTotalWtChange(e.target.value)}
              placeholder="0.00" />
          </div>
        ))}
      </div>

      <div style={{maxHeight:"42vh", overflowY:"auto", paddingRight:2}}>
        {renderSection("Sponge Section", sponge, "Sponge")}
        {renderSection("Dough Section", dough, "Dough")}

        <div className="summary-row">
          <span className="summary-label">Total</span>
          <div className="summary-val">{totBakers}</div>
          <div className={`summary-val${trueWarn ? " warn" : ""}`}>{totTrue}</div>
          <div className="summary-val">{totWeight}</div>
        </div>
      </div>
    </Modal>
  );

  function setTotalWtWrapper(val) { handleTotalWtChange(val); }
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]   = useState("login");
  const [userInput, setUser]  = useState(""); const [passInput, setPass] = useState("");
  const [loginErr, setErr]    = useState("");
  const [modal, setModal]     = useState(null);
  const [lastFF, setLastFF]   = useState(0);
  const [lastWT, setLastWT]   = useState(0);
  const [db, setDb]           = useState(() => {
    try { return JSON.parse(localStorage.getItem("recipes_db") || "{}"); } catch { return {}; }
  });

  const login = () => {
    const USERS = { admin: "8707", user: "ufm46" };
    if (USERS[userInput] && USERS[userInput] === passInput) { setScreen("dashboard"); setErr(""); }
    else setErr("Invalid username or password.");
  };

  const cards = [
    { num:"01", title:"FF Calculator",          sub:"Friction factor from WT, FT & ADT",     color:"#1a6fa8", key:"ff" },
    { num:"02", title:"Water Temp Calculator",  sub:"Calculate water temperature (Cal WT)",  color:"#136b6b", key:"wt" },
    { num:"03", title:"Ice Temp Calculator",    sub:"Calc ice weight & remaining water",      color:"#1a5a7f", key:"ice" },
    { num:"04", title:"Recipe Calculator",      sub:"Bidirectional bakers % matrix",          color:"#3a3570", key:"recipe" },
  ];

  return (
    <>
      <style>{CSS}</style>
      {screen === "login" && (
        <div className="login-wrap">
          <div className="login-card">
            <div className="login-title">WELCOME</div>
            <div className="field">
              <label>USERNAME</label>
              <input value={userInput} onChange={e => setUser(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()} placeholder="admin" />
            </div>
            <div className="field">
              <label>PASSWORD</label>
              <input type="password" value={passInput} onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()} placeholder="••••" />
            </div>
            <button className="btn-primary" onClick={login}>LOGIN</button>
            <div className="error-msg">{loginErr}</div>
          </div>
        </div>
      )}

      {screen === "dashboard" && (
        <div className="app-wrap">
          <div className="app-header">
            <div className="app-title">BAKERY CALCULATORS</div>
            <button className="btn-logout" onClick={() => { setScreen("login"); setUser(""); setPass(""); }}>Logout</button>
          </div>
          <div className="grid-2x2">
            {cards.map(c => (
              <div key={c.key} className="calc-card" style={{"--accent": c.color}}
                onClick={() => setModal(c.key)}>
                <div className="card-num">{c.num}</div>
                <div className="card-title" style={{color: "var(--text)"}}>{c.title}</div>
                <div className="card-sub">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal === "ff"     && <FFCalc      onClose={() => setModal(null)} onResult={setLastFF} />}
      {modal === "wt"     && <WaterTempCalc onClose={() => setModal(null)} lastFF={lastFF} onResult={setLastWT} />}
      {modal === "ice"    && <IceTempCalc  onClose={() => setModal(null)} lastWT={lastWT} />}
      {modal === "recipe" && <RecipeCalc   onClose={() => setModal(null)} db={db} setDb={setDb} />}
    </>
  );
}