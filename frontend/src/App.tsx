// @ts-nocheck
import { useState, useEffect } from "react";

// ── Kleuren & stijlen ──────────────────────────────────────────────
const C = {
  oranje: "#E8580A",
  oranjeLight: "#FF8C42",
  wit: "#FFFFFF",
  zwart: "#1A1A1A",
  grijs: "#F4F4F4",
  grijsDark: "#D0D0D0",
  tekst: "#1A1A1A",
  succes: "#2E7D32",
  gevaar: "#C62828",
};

const s = {
  app: { fontFamily: "'Segoe UI',sans-serif", background: C.grijs, minHeight: "100vh", color: C.tekst },
  header: { background: C.oranje, color: C.wit, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 },
  logo: { fontWeight: 900, fontSize: 22, letterSpacing: 1 },
  sub: { fontSize: 13, opacity: 0.85 },
  nav: { background: C.zwart, display: "flex", gap: 2, padding: "0 12px", overflowX: "auto" },
  navBtn: (active) => ({ background: active ? C.oranje : "transparent", color: C.wit, border: "none", padding: "10px 16px", cursor: "pointer", fontWeight: active ? 700 : 400, fontSize: 13, whiteSpace: "nowrap", borderBottom: active ? "3px solid #fff" : "3px solid transparent" }),
  page: { padding: "16px", maxWidth: 1100, margin: "0 auto" },
  card: { background: C.wit, borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" },
  h2: { margin: "0 0 14px", fontSize: 18, fontWeight: 700, color: C.oranje },
  h3: { margin: "0 0 10px", fontSize: 15, fontWeight: 600 },
  btn: (variant = "primary") => ({
    background: variant === "primary" ? C.oranje : variant === "danger" ? C.gevaar : variant === "success" ? C.succes : C.grijsDark,
    color: C.wit, border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, margin: "2px"
  }),
  input: { border: `1px solid ${C.grijsDark}`, borderRadius: 6, padding: "7px 10px", fontSize: 13, width: "100%", boxSizing: "border-box", marginBottom: 8 },
  select: { border: `1px solid ${C.grijsDark}`, borderRadius: 6, padding: "7px 10px", fontSize: 13, width: "100%", boxSizing: "border-box", marginBottom: 8 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { background: C.oranje, color: C.wit, padding: "8px 10px", textAlign: "left" },
  td: { padding: "7px 10px", borderBottom: `1px solid ${C.grijsDark}` },
  badge: (kleur) => ({ background: kleur, color: C.wit, borderRadius: 12, padding: "2px 8px", fontSize: 11, fontWeight: 600, display: "inline-block" }),
  row: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" },
  col: { flex: 1, minWidth: 200 },
};

const DOELTYPEN = ["Strafworp", "Vrije worp", "Doorloopbal", "Korte kans", "Schot"];
const HELFTEN = ["1e helft", "2e helft", "Verlenging"];
const ROLLEN = ["Teammanager", "Speler"];

// ── localStorage helpers ───────────────────────────────────────────
const load = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

let _id = Date.now();
const uid = () => String(++_id);

// ── Excel export (CSV-based) ───────────────────────────────────────
function exportCSV(rows, filename) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(","), ...rows.map(r => keys.map(k => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

// ── Hoofd-App ─────────────────────────────────────────────────────
export default function App() {
  const [teams, setTeams] = useState(() => load("ow_teams", []));
  const [spelers, setSpelers] = useState(() => load("ow_spelers", []));
  const [wedstrijden, setWedstrijden] = useState(() => load("ow_wedstrijden", []));
  const [gebruikers, setGebruikers] = useState(() => load("ow_gebruikers", [{ id: "1", naam: "Manager", rol: "Teammanager", teamId: null, wachtwoord: "admin" }]));
  const [huidigGebruiker, setHuidigGebruiker] = useState(() => load("ow_huidigGebruiker", null));
  const [tab, setTab] = useState("dashboard");
  const [loginForm, setLoginForm] = useState({ naam: "", wachtwoord: "" });
  const [loginFout, setLoginFout] = useState("");

  useEffect(() => { save("ow_teams", teams); }, [teams]);
  useEffect(() => { save("ow_spelers", spelers); }, [spelers]);
  useEffect(() => { save("ow_wedstrijden", wedstrijden); }, [wedstrijden]);
  useEffect(() => { save("ow_gebruikers", gebruikers); }, [gebruikers]);
  useEffect(() => { save("ow_huidigGebruiker", huidigGebruiker); }, [huidigGebruiker]);

  const isManager = huidigGebruiker?.rol === "Teammanager";

  function login() {
    const g = gebruikers.find(u => u.naam === loginForm.naam && u.wachtwoord === loginForm.wachtwoord);
    if (g) { setHuidigGebruiker(g); setLoginFout(""); }
    else setLoginFout("Ongeldige gebruikersnaam of wachtwoord.");
  }

  if (!huidigGebruiker) return (
    <div style={{ ...s.app, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div style={{ ...s.card, width: 340, padding: 28 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>🏐</div>
          <div style={{ fontWeight: 900, fontSize: 20, color: C.oranje }}>CKV Oranje Wit</div>
          <div style={{ fontSize: 13, color: "#666" }}>Wedstrijdregistratie Dordrecht</div>
        </div>
        <input style={s.input} placeholder="Gebruikersnaam" value={loginForm.naam} onChange={e => setLoginForm(f => ({ ...f, naam: e.target.value }))} />
        <input style={s.input} type="password" placeholder="Wachtwoord" value={loginForm.wachtwoord} onChange={e => setLoginForm(f => ({ ...f, wachtwoord: e.target.value }))} onKeyDown={e => e.key === "Enter" && login()} />
        {loginFout && <div style={{ color: C.gevaar, fontSize: 13, marginBottom: 8 }}>{loginFout}</div>}
        <button style={{ ...s.btn(), width: "100%", padding: 10 }} onClick={login}>Inloggen</button>
        <div style={{ fontSize: 11, color: "#999", marginTop: 10, textAlign: "center" }}>Standaard: Manager / admin</div>
      </div>
    </div>
  );

  const tabs = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "wedstrijden", label: "⚽ Wedstrijden" },
    { id: "teams", label: "👕 Teams" },
    { id: "spelers", label: "👤 Spelers" },
    ...(isManager ? [{ id: "gebruikers", label: "🔐 Gebruikers" }] : []),
    { id: "statistieken", label: "📈 Statistieken" },
  ];

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={{ fontSize: 28 }}>🏐</div>
        <div>
          <div style={s.logo}>CKV Oranje Wit – Dordrecht</div>
          <div style={s.sub}>Ingelogd als: {huidigGebruiker.naam} ({huidigGebruiker.rol})</div>
        </div>
        <button onClick={() => setHuidigGebruiker(null)} style={{ ...s.btn("secondary"), marginLeft: "auto", background: "rgba(255,255,255,0.2)" }}>Uitloggen</button>
      </div>
      <div style={s.nav}>
        {tabs.map(t => <button key={t.id} style={s.navBtn(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>
      <div style={s.page}>
        {tab === "dashboard" && <Dashboard wedstrijden={wedstrijden} spelers={spelers} teams={teams} huidigGebruiker={huidigGebruiker} />}
        {tab === "wedstrijden" && <Wedstrijden wedstrijden={wedstrijden} setWedstrijden={setWedstrijden} teams={teams} spelers={spelers} isManager={isManager} huidigGebruiker={huidigGebruiker} />}
        {tab === "teams" && <Teams teams={teams} setTeams={setTeams} spelers={spelers} isManager={isManager} />}
        {tab === "spelers" && <Spelers spelers={spelers} setSpelers={setSpelers} teams={teams} wedstrijden={wedstrijden} isManager={isManager} huidigGebruiker={huidigGebruiker} />}
        {tab === "gebruikers" && isManager && <Gebruikers gebruikers={gebruikers} setGebruikers={setGebruikers} teams={teams} />}
        {tab === "statistieken" && <Statistieken wedstrijden={wedstrijden} spelers={spelers} teams={teams} huidigGebruiker={huidigGebruiker} isManager={isManager} />}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
function Dashboard({ wedstrijden, spelers, teams, huidigGebruiker }) {
  const isManager = huidigGebruiker?.rol === "Teammanager";
  const mijnTeamId = huidigGebruiker?.teamId;
  const relevanteW = isManager ? wedstrijden : wedstrijden.filter(w => w.thuisTeamId === mijnTeamId || w.uitTeamId === mijnTeamId);
  const gespeeld = relevanteW.filter(w => w.status === "Gespeeld");
  const gepland = relevanteW.filter(w => w.status === "Gepland");

  const totaalDoelpunten = gespeeld.reduce((s, w) => s + (w.events?.filter(e => e.type === "doelpunt").length || 0), 0);

  return (
    <div>
      <h2 style={s.h2}>📊 Dashboard</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        {[
          { label: "Wedstrijden gespeeld", val: gespeeld.length, icon: "✅" },
          { label: "Gepland", val: gepland.length, icon: "📅" },
          { label: "Teams", val: teams.length, icon: "👕" },
          { label: "Spelers", val: spelers.length, icon: "👤" },
          { label: "Totaal doelpunten", val: totaalDoelpunten, icon: "🥅" },
        ].map(({ label, val, icon }) => (
          <div key={label} style={{ ...s.card, flex: "1 1 150px", textAlign: "center", marginBottom: 0, padding: "14px 10px" }}>
            <div style={{ fontSize: 28 }}>{icon}</div>
            <div style={{ fontWeight: 900, fontSize: 26, color: C.oranje }}>{val}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={s.card}>
        <h3 style={s.h3}>Laatste wedstrijden</h3>
        {gespeeld.length === 0 ? <div style={{ color: "#999", fontSize: 13 }}>Nog geen wedstrijden gespeeld.</div> :
          <table style={s.table}>
            <thead><tr>{["Datum", "Thuis", "Score", "Uit", "Locatie"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>{gespeeld.slice(-5).reverse().map(w => {
              const thuisDp = w.events?.filter(e => e.type === "doelpunt" && e.scorendTeamId === w.thuisTeamId).length || 0;
              const uitDp = w.events?.filter(e => e.type === "doelpunt" && e.scorendTeamId === w.uitTeamId).length || 0;
              return <tr key={w.id}>
                <td style={s.td}>{w.datum}</td>
                <td style={s.td}>{teams.find(t => t.id === w.thuisTeamId)?.naam || "—"}</td>
                <td style={{ ...s.td, fontWeight: 700, color: C.oranje }}>{thuisDp} – {uitDp}</td>
                <td style={s.td}>{teams.find(t => t.id === w.uitTeamId)?.naam || "—"}</td>
                <td style={s.td}>{w.locatie || "—"}</td>
              </tr>;
            })}</tbody>
          </table>}
      </div>
    </div>
  );
}

// ── Teams ─────────────────────────────────────────────────────────
function Teams({ teams, setTeams, spelers, isManager }) {
  const [nieuw, setNieuw] = useState({ naam: "", manager: "" });
  function voegToe() {
    if (!nieuw.naam.trim()) return;
    setTeams(t => [...t, { id: uid(), naam: nieuw.naam.trim(), manager: nieuw.manager.trim() }]);
    setNieuw({ naam: "", manager: "" });
  }
  function verwijder(id) { if (window.confirm("Team verwijderen?")) setTeams(t => t.filter(x => x.id !== id)); }

  return (
    <div>
      <h2 style={s.h2}>👕 Teams</h2>
      {isManager && <div style={s.card}>
        <h3 style={s.h3}>Nieuw team toevoegen</h3>
        <div style={s.row}>
          <div style={s.col}><input style={s.input} placeholder="Teamnaam" value={nieuw.naam} onChange={e => setNieuw(f => ({ ...f, naam: e.target.value }))} /></div>
          <div style={s.col}><input style={s.input} placeholder="Teammanager (naam)" value={nieuw.manager} onChange={e => setNieuw(f => ({ ...f, manager: e.target.value }))} /></div>
        </div>
        <button style={s.btn()} onClick={voegToe}>➕ Team toevoegen</button>
      </div>}
      <div style={s.card}>
        {teams.length === 0 ? <div style={{ color: "#999", fontSize: 13 }}>Nog geen teams aangemaakt.</div> :
          <table style={s.table}>
            <thead><tr>{["Team", "Manager", "Spelers", ...(isManager ? ["Actie"] : [])].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>{teams.map(t => (
              <tr key={t.id}>
                <td style={s.td}><strong>{t.naam}</strong></td>
                <td style={s.td}>{t.manager || "—"}</td>
                <td style={s.td}>{spelers.filter(s => s.teamId === t.id).length}</td>
                {isManager && <td style={s.td}><button style={s.btn("danger")} onClick={() => verwijder(t.id)}>🗑 Verwijder</button></td>}
              </tr>
            ))}</tbody>
          </table>}
      </div>
    </div>
  );
}

// ── Spelers ───────────────────────────────────────────────────────
function Spelers({ spelers, setSpelers, teams, wedstrijden, isManager, huidigGebruiker }) {
  const [nieuw, setNieuw] = useState({ naam: "", teamId: "", nummer: "" });
  const mijnTeamId = huidigGebruiker?.teamId;
  const zichtbareTeams = isManager ? teams : teams.filter(t => t.id === mijnTeamId);
  const zichtbareSpelers = isManager ? spelers : spelers.filter(s => s.teamId === mijnTeamId);

  function voegToe() {
    if (!nieuw.naam.trim() || !nieuw.teamId) return;
    setSpelers(p => [...p, { id: uid(), naam: nieuw.naam.trim(), teamId: nieuw.teamId, nummer: nieuw.nummer }]);
    setNieuw({ naam: "", teamId: "", nummer: "" });
  }
  function verwijder(id) { if (window.confirm("Speler verwijderen?")) setSpelers(p => p.filter(x => x.id !== id)); }

  function spelersStats(spelerId) {
    let doelpunten = 0, minuten = 0;
    wedstrijden.forEach(w => {
      (w.events || []).forEach(e => {
        if (e.type === "doelpunt" && e.spelerId === spelerId) doelpunten++;
        if (e.type === "wissel" && e.inSpelerId === spelerId && e.uitSpelerId) {
          // minuten worden bijgehouden in wissel-events
        }
      });
      (w.speeltijden || []).filter(st => st.spelerId === spelerId).forEach(st => { minuten += st.minuten || 0; });
    });
    return { doelpunten, minuten };
  }

  return (
    <div>
      <h2 style={s.h2}>👤 Spelers</h2>
      {(isManager || mijnTeamId) && <div style={s.card}>
        <h3 style={s.h3}>Speler toevoegen</h3>
        <div style={s.row}>
          <div style={s.col}><input style={s.input} placeholder="Naam" value={nieuw.naam} onChange={e => setNieuw(f => ({ ...f, naam: e.target.value }))} /></div>
          <div style={s.col}><input style={s.input} placeholder="Rugnummer" value={nieuw.nummer} onChange={e => setNieuw(f => ({ ...f, nummer: e.target.value }))} /></div>
          <div style={s.col}>
            <select style={s.select} value={nieuw.teamId} onChange={e => setNieuw(f => ({ ...f, teamId: e.target.value }))}>
              <option value="">-- Selecteer team --</option>
              {zichtbareTeams.map(t => <option key={t.id} value={t.id}>{t.naam}</option>)}
            </select>
          </div>
        </div>
        <button style={s.btn()} onClick={voegToe}>➕ Speler toevoegen</button>
      </div>}
      <div style={s.card}>
        {zichtbareSpelers.length === 0 ? <div style={{ color: "#999", fontSize: 13 }}>Nog geen spelers.</div> :
          <table style={s.table}>
            <thead><tr>{["#", "Naam", "Team", "Doelpunten", "Min. gespeeld", ...(isManager ? ["Actie"] : [])].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>{zichtbareSpelers.map(sp => {
              const stats = spelersStats(sp.id);
              const team = teams.find(t => t.id === sp.teamId);
              return <tr key={sp.id}>
                <td style={s.td}>{sp.nummer || "—"}</td>
                <td style={s.td}><strong>{sp.naam}</strong></td>
                <td style={s.td}>{team?.naam || "—"}</td>
                <td style={s.td}>{stats.doelpunten}</td>
                <td style={s.td}>{stats.minuten}'</td>
                {isManager && <td style={s.td}><button style={s.btn("danger")} onClick={() => verwijder(sp.id)}>🗑</button></td>}
              </tr>;
            })}</tbody>
          </table>}
      </div>
    </div>
  );
}

// ── Gebruikers ────────────────────────────────────────────────────
function Gebruikers({ gebruikers, setGebruikers, teams }) {
  const [nieuw, setNieuw] = useState({ naam: "", wachtwoord: "", rol: "Speler", teamId: "" });

  function voegToe() {
    if (!nieuw.naam.trim() || !nieuw.wachtwoord.trim()) return;
    setGebruikers(g => [...g, { id: uid(), ...nieuw }]);
    setNieuw({ naam: "", wachtwoord: "", rol: "Speler", teamId: "" });
  }
  function verwijder(id) { if (window.confirm("Gebruiker verwijderen?")) setGebruikers(g => g.filter(x => x.id !== id)); }

  return (
    <div>
      <h2 style={s.h2}>🔐 Gebruikersbeheer</h2>
      <div style={s.card}>
        <h3 style={s.h3}>Nieuwe gebruiker</h3>
        <div style={s.row}>
          <div style={s.col}><input style={s.input} placeholder="Naam" value={nieuw.naam} onChange={e => setNieuw(f => ({ ...f, naam: e.target.value }))} /></div>
          <div style={s.col}><input style={s.input} placeholder="Wachtwoord" value={nieuw.wachtwoord} onChange={e => setNieuw(f => ({ ...f, wachtwoord: e.target.value }))} /></div>
          <div style={s.col}>
            <select style={s.select} value={nieuw.rol} onChange={e => setNieuw(f => ({ ...f, rol: e.target.value }))}>
              {ROLLEN.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={s.col}>
            <select style={s.select} value={nieuw.teamId} onChange={e => setNieuw(f => ({ ...f, teamId: e.target.value }))}>
              <option value="">-- Geen team --</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.naam}</option>)}
            </select>
          </div>
        </div>
        <button style={s.btn()} onClick={voegToe}>➕ Toevoegen</button>
      </div>
      <div style={s.card}>
        <table style={s.table}>
          <thead><tr>{["Naam", "Rol", "Team", "Actie"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>{gebruikers.map(g => (
            <tr key={g.id}>
              <td style={s.td}>{g.naam}</td>
              <td style={s.td}><span style={s.badge(g.rol === "Teammanager" ? C.oranje : "#666")}>{g.rol}</span></td>
              <td style={s.td}>{teams.find(t => t.id === g.teamId)?.naam || "—"}</td>
              <td style={s.td}><button style={s.btn("danger")} onClick={() => verwijder(g.id)}>🗑</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ── Wedstrijden ───────────────────────────────────────────────────
function Wedstrijden({ wedstrijden, setWedstrijden, teams, spelers, isManager, huidigGebruiker }) {
  const [nieuw, setNieuw] = useState({ thuisTeamId: "", uitTeamId: "", datum: "", locatie: "", thuis: true });
  const [actieveWedstrijd, setActieveWedstrijd] = useState(null);
  const mijnTeamId = huidigGebruiker?.teamId;
  const zichtbareW = isManager ? wedstrijden : wedstrijden.filter(w => w.thuisTeamId === mijnTeamId || w.uitTeamId === mijnTeamId);

  function planWedstrijd() {
    if (!nieuw.thuisTeamId || !nieuw.uitTeamId || !nieuw.datum) return;
    if (nieuw.thuisTeamId === nieuw.uitTeamId) return alert("Kies twee verschillende teams.");
    setWedstrijden(w => [...w, { id: uid(), ...nieuw, status: "Gepland", events: [], speeltijden: [] }]);
    setNieuw({ thuisTeamId: "", uitTeamId: "", datum: "", locatie: "", thuis: true });
  }

  function verwijder(id) { if (window.confirm("Wedstrijd verwijderen?")) setWedstrijden(w => w.filter(x => x.id !== id)); }

  function exporteer(w) {
    const thuisNaam = teams.find(t => t.id === w.thuisTeamId)?.naam || "?";
    const uitNaam = teams.find(t => t.id === w.uitTeamId)?.naam || "?";
    const rows = (w.events || []).map(e => ({
      Minuut: e.minuut, Helft: e.helft, Type: e.type === "doelpunt" ? "Doelpunt" : "Wissel",
      Doeltype: e.doeltype || "", Scorer: spelers.find(s => s.id === e.spelerId)?.naam || "",
      "Gescoord tegen": spelers.find(s => s.id === e.tegenSpelerId)?.naam || "",
      Team: teams.find(t => t.id === e.scorendTeamId)?.naam || "",
      "Wissel uit": spelers.find(s => s.id === e.uitSpelerId)?.naam || "",
      "Wissel in": spelers.find(s => s.id === e.inSpelerId)?.naam || "",
    }));
    exportCSV(rows, `${thuisNaam}_vs_${uitNaam}_${w.datum}.csv`);
  }

  if (actieveWedstrijd) {
    const w = wedstrijden.find(x => x.id === actieveWedstrijd);
    if (!w) { setActieveWedstrijd(null); return null; }
    return <WedstrijdDetail wedstrijd={w} wedstrijden={wedstrijden} setWedstrijden={setWedstrijden} teams={teams} spelers={spelers} onTerug={() => setActieveWedstrijd(null)} isManager={isManager} mijnTeamId={mijnTeamId} />;
  }

  return (
    <div>
      <h2 style={s.h2}>⚽ Wedstrijden</h2>
      {isManager && <div style={s.card}>
        <h3 style={s.h3}>Wedstrijd inplannen</h3>
        <div style={s.row}>
          <div style={s.col}>
            <select style={s.select} value={nieuw.thuisTeamId} onChange={e => setNieuw(f => ({ ...f, thuisTeamId: e.target.value }))}>
              <option value="">-- Thuisteam --</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.naam}</option>)}
            </select>
          </div>
          <div style={s.col}>
            <select style={s.select} value={nieuw.uitTeamId} onChange={e => setNieuw(f => ({ ...f, uitTeamId: e.target.value }))}>
              <option value="">-- Uitteam --</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.naam}</option>)}
            </select>
          </div>
          <div style={s.col}><input style={s.input} type="date" value={nieuw.datum} onChange={e => setNieuw(f => ({ ...f, datum: e.target.value }))} /></div>
          <div style={s.col}><input style={s.input} placeholder="Locatie (optioneel)" value={nieuw.locatie} onChange={e => setNieuw(f => ({ ...f, locatie: e.target.value }))} /></div>
        </div>
        <button style={s.btn()} onClick={planWedstrijd}>📅 Wedstrijd inplannen</button>
      </div>}
      <div style={s.card}>
        {zichtbareW.length === 0 ? <div style={{ color: "#999", fontSize: 13 }}>Geen wedstrijden gevonden.</div> :
          <table style={s.table}>
            <thead><tr>{["Datum", "Thuis", "Score", "Uit", "Locatie", "Status", "Acties"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>{[...zichtbareW].sort((a, b) => b.datum.localeCompare(a.datum)).map(w => {
              const thuisDp = w.events?.filter(e => e.type === "doelpunt" && e.scorendTeamId === w.thuisTeamId).length || 0;
              const uitDp = w.events?.filter(e => e.type === "doelpunt" && e.scorendTeamId === w.uitTeamId).length || 0;
              return <tr key={w.id}>
                <td style={s.td}>{w.datum}</td>
                <td style={s.td}>{teams.find(t => t.id === w.thuisTeamId)?.naam || "?"}</td>
                <td style={{ ...s.td, fontWeight: 700, color: C.oranje }}>{w.status === "Gespeeld" ? `${thuisDp} – ${uitDp}` : "—"}</td>
                <td style={s.td}>{teams.find(t => t.id === w.uitTeamId)?.naam || "?"}</td>
                <td style={s.td}>{w.locatie || "—"}</td>
                <td style={s.td}><span style={s.badge(w.status === "Gespeeld" ? C.succes : C.oranje)}>{w.status}</span></td>
                <td style={s.td}>
                  <button style={s.btn("secondary")} onClick={() => setActieveWedstrijd(w.id)}>▶ Open</button>
                  <button style={s.btn("secondary")} onClick={() => exporteer(w)}>📥 Export</button>
                  {isManager && <button style={s.btn("danger")} onClick={() => verwijder(w.id)}>🗑</button>}
                </td>
              </tr>;
            })}</tbody>
          </table>}
      </div>
    </div>
  );
}

// ── WedstrijdDetail ───────────────────────────────────────────────
function WedstrijdDetail({ wedstrijd: w, wedstrijden, setWedstrijden, teams, spelers, onTerug, isManager, mijnTeamId }) {
  const thuisTeam = teams.find(t => t.id === w.thuisTeamId);
  const uitTeam = teams.find(t => t.id === w.uitTeamId);
  const thuisSpelers = spelers.filter(s => s.teamId === w.thuisTeamId);
  const uitSpelers = spelers.filter(s => s.teamId === w.uitTeamId);
  const alleSpelers = [...thuisSpelers, ...uitSpelers];

  const [doelForm, setDoelForm] = useState({ minuut: "", helft: "1e helft", doeltype: DOELTYPEN[0], spelerId: "", tegenSpelerId: "", scorendTeamId: w.thuisTeamId });
  const [wisselForm, setWisselForm] = useState({ minuut: "", helft: "1e helft", teamId: w.thuisTeamId, uitSpelerId: "", inSpelerId: "" });
  const [actieTab, setActieTab] = useState("doelpunt");

  const updateW = (fn) => setWedstrijden(ws => ws.map(x => x.id === w.id ? fn(x) : x));

  function voegDoelToe() {
    if (!doelForm.minuut || !doelForm.spelerId) return alert("Vul minuut en scorer in.");
    const evt = { id: uid(), type: "doelpunt", ...doelForm, minuut: Number(doelForm.minuut) };
    updateW(x => ({ ...x, events: [...(x.events || []), evt], status: "Gespeeld" }));
  }

  function voegWisselToe() {
    if (!wisselForm.minuut || !wisselForm.uitSpelerId || !wisselForm.inSpelerId) return alert("Vul alle wisselgegevens in.");
    const evt = { id: uid(), type: "wissel", ...wisselForm, minuut: Number(wisselForm.minuut) };
    // Bereken speeltijden
    updateW(x => {
      const newEvents = [...(x.events || []), evt];
      const speeltijden = berekenSpeeltijden(newEvents);
      return { ...x, events: newEvents, speeltijden, status: "Gespeeld" };
    });
  }

  function berekenSpeeltijden(events) {
    const perSpeler = {};
    const wissels = events.filter(e => e.type === "wissel").sort((a, b) => a.minuut - b.minuut);
    wissels.forEach(e => {
      if (!perSpeler[e.uitSpelerId]) perSpeler[e.uitSpelerId] = { spelerId: e.uitSpelerId, minuten: 0, invoer: [] };
      if (!perSpeler[e.inSpelerId]) perSpeler[e.inSpelerId] = { spelerId: e.inSpelerId, minuten: 0, invoer: [] };
      perSpeler[e.uitSpelerId].invoer.push({ actie: "uit", minuut: e.minuut, helft: e.helft });
      perSpeler[e.inSpelerId].invoer.push({ actie: "in", minuut: e.minuut, helft: e.helft });
    });
    return Object.values(perSpeler);
  }

  function verwijderEvent(id) { updateW(x => ({ ...x, events: (x.events || []).filter(e => e.id !== id) })); }

  const thuisDp = (w.events || []).filter(e => e.type === "doelpunt" && e.scorendTeamId === w.thuisTeamId).length;
  const uitDp = (w.events || []).filter(e => e.type === "doelpunt" && e.scorendTeamId === w.uitTeamId).length;

  const kanInvoeren = isManager || (mijnTeamId && (mijnTeamId === w.thuisTeamId || mijnTeamId === w.uitTeamId));
  const invoerTeams = isManager ? teams.filter(t => t.id === w.thuisTeamId || t.id === w.uitTeamId) : teams.filter(t => t.id === mijnTeamId && (t.id === w.thuisTeamId || t.id === w.uitTeamId));

  return (
    <div>
      <button style={{ ...s.btn("secondary"), marginBottom: 12 }} onClick={onTerug}>← Terug</button>
      <div style={s.card}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{w.datum} · {w.locatie || "Onbekende locatie"}</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{thuisTeam?.naam || "Thuis"}</div>
              <div style={{ fontSize: 11, color: "#888" }}>🏠 Thuis</div>
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: C.oranje, minWidth: 80, textAlign: "center" }}>{thuisDp} – {uitDp}</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{uitTeam?.naam || "Uit"}</div>
              <div style={{ fontSize: 11, color: "#888" }}>✈ Uit</div>
            </div>
          </div>
        </div>
      </div>

      {kanInvoeren && (
        <div style={s.card}>
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {["doelpunt", "wissel"].map(t => (
              <button key={t} style={{ ...s.btn(actieTab === t ? "primary" : "secondary"), textTransform: "capitalize" }} onClick={() => setActieTab(t)}>
                {t === "doelpunt" ? "🥅 Doelpunt" : "🔄 Wissel"}
              </button>
            ))}
          </div>

          {actieTab === "doelpunt" && (
            <div>
              <h3 style={s.h3}>Doelpunt registreren</h3>
              <div style={s.row}>
                <div style={s.col}>
                  <select style={s.select} value={doelForm.helft} onChange={e => setDoelForm(f => ({ ...f, helft: e.target.value }))}>
                    {HELFTEN.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div style={s.col}><input style={s.input} type="number" placeholder="Minuut" min={1} max={120} value={doelForm.minuut} onChange={e => setDoelForm(f => ({ ...f, minuut: e.target.value }))} /></div>
                <div style={s.col}>
                  <select style={s.select} value={doelForm.doeltype} onChange={e => setDoelForm(f => ({ ...f, doeltype: e.target.value }))}>
                    {DOELTYPEN.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={s.row}>
                <div style={s.col}>
                  <select style={s.select} value={doelForm.scorendTeamId} onChange={e => setDoelForm(f => ({ ...f, scorendTeamId: e.target.value, spelerId: "", tegenSpelerId: "" }))}>
                    <option value={w.thuisTeamId}>{thuisTeam?.naam} (thuis)</option>
                    <option value={w.uitTeamId}>{uitTeam?.naam} (uit)</option>
                  </select>
                </div>
                <div style={s.col}>
                  <select style={s.select} value={doelForm.spelerId} onChange={e => setDoelForm(f => ({ ...f, spelerId: e.target.value }))}>
                    <option value="">-- Scorer --</option>
                    {spelers.filter(s => s.teamId === doelForm.scorendTeamId).map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
                  </select>
                </div>
                <div style={s.col}>
                  <select style={s.select} value={doelForm.tegenSpelerId} onChange={e => setDoelForm(f => ({ ...f, tegenSpelerId: e.target.value }))}>
                    <option value="">-- Gescoord tegen --</option>
                    {spelers.filter(s => s.teamId !== doelForm.scorendTeamId).map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
                  </select>
                </div>
              </div>
              <button style={s.btn()} onClick={voegDoelToe}>✅ Doelpunt opslaan</button>
            </div>
          )}

          {actieTab === "wissel" && (
            <div>
              <h3 style={s.h3}>Wissel registreren</h3>
              <div style={s.row}>
                <div style={s.col}>
                  <select style={s.select} value={wisselForm.helft} onChange={e => setWisselForm(f => ({ ...f, helft: e.target.value }))}>
                    {HELFTEN.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div style={s.col}><input style={s.input} type="number" placeholder="Minuut" min={1} max={120} value={wisselForm.minuut} onChange={e => setWisselForm(f => ({ ...f, minuut: e.target.value }))} /></div>
                <div style={s.col}>
                  <select style={s.select} value={wisselForm.teamId} onChange={e => setWisselForm(f => ({ ...f, teamId: e.target.value, uitSpelerId: "", inSpelerId: "" }))}>
                    {invoerTeams.map(t => <option key={t.id} value={t.id}>{t.naam}</option>)}
                  </select>
                </div>
              </div>
              <div style={s.row}>
                <div style={s.col}>
                  <select style={s.select} value={wisselForm.uitSpelerId} onChange={e => setWisselForm(f => ({ ...f, uitSpelerId: e.target.value }))}>
                    <option value="">-- Gaat eruit --</option>
                    {spelers.filter(s => s.teamId === wisselForm.teamId).map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
                  </select>
                </div>
                <div style={s.col}>
                  <select style={s.select} value={wisselForm.inSpelerId} onChange={e => setWisselForm(f => ({ ...f, inSpelerId: e.target.value }))}>
                    <option value="">-- Komt erin --</option>
                    {spelers.filter(s => s.teamId === wisselForm.teamId).map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
                  </select>
                </div>
              </div>
              <button style={s.btn()} onClick={voegWisselToe}>✅ Wissel opslaan</button>
            </div>
          )}
        </div>
      )}

      <div style={s.card}>
        <h3 style={s.h3}>📋 Wedstrijdverloop</h3>
        {(!w.events || w.events.length === 0) ? <div style={{ color: "#999", fontSize: 13 }}>Nog geen events geregistreerd.</div> :
          <table style={s.table}>
            <thead><tr>{["Min.", "Helft", "Type", "Detail", "Speler", "Tegen / Wissel", "Team", "Actie"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>{[...w.events].sort((a, b) => a.minuut - b.minuut).map(e => (
              <tr key={e.id}>
                <td style={s.td}>{e.minuut}'</td>
                <td style={s.td}>{e.helft}</td>
                <td style={s.td}>{e.type === "doelpunt" ? "🥅" : "🔄"}</td>
                <td style={s.td}>{e.doeltype || "—"}</td>
                <td style={s.td}>{e.type === "doelpunt" ? (spelers.find(s => s.id === e.spelerId)?.naam || "?") : (spelers.find(s => s.id === e.uitSpelerId)?.naam || "?")}</td>
                <td style={s.td}>{e.type === "doelpunt" ? (spelers.find(s => s.id === e.tegenSpelerId)?.naam || "—") : (spelers.find(s => s.id === e.inSpelerId)?.naam || "?")}</td>
                <td style={s.td}>{teams.find(t => t.id === (e.scorendTeamId || e.teamId))?.naam || "—"}</td>
                <td style={s.td}>{kanInvoeren && <button style={s.btn("danger")} onClick={() => verwijderEvent(e.id)}>🗑</button>}</td>
              </tr>
            ))}</tbody>
          </table>}
      </div>

      {w.speeltijden && w.speeltijden.length > 0 && (
        <div style={s.card}>
          <h3 style={s.h3}>⏱ Speeltijden</h3>
          <table style={s.table}>
            <thead><tr>{["Speler", "Team", "Wisselhistorie"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>{w.speeltijden.map(st => {
              const sp = spelers.find(s => s.id === st.spelerId);
              if (!sp) return null;
              return <tr key={st.spelerId}>
                <td style={s.td}>{sp.naam}</td>
                <td style={s.td}>{teams.find(t => t.id === sp.teamId)?.naam || "—"}</td>
                <td style={s.td}>{(st.invoer || []).map((i, idx) => <span key={idx} style={{ marginRight: 8, fontSize: 12 }}>{i.actie === "in" ? "▶" : "⏸"} {i.helft} {i.minuut}'</span>)}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Statistieken ──────────────────────────────────────────────────
function Statistieken({ wedstrijden, spelers, teams, huidigGebruiker, isManager }) {
  const [statTab, setStatTab] = useState("teams");
  const mijnTeamId = huidigGebruiker?.teamId;
  const gespeeld = wedstrijden.filter(w => w.status === "Gespeeld");
  const relevanteTeams = isManager ? teams : teams.filter(t => t.id === mijnTeamId);

  function teamStats(teamId) {
    const wedstrs = gespeeld.filter(w => w.thuisTeamId === teamId || w.uitTeamId === teamId);
    let gescoord = 0, tegenscoord = 0, gewonnen = 0, verloren = 0, gelijk = 0;
    const doeltypeCount = {};
    wedstrs.forEach(w => {
      const voor = (w.events || []).filter(e => e.type === "doelpunt" && e.scorendTeamId === teamId).length;
      const tegen = (w.events || []).filter(e => e.type === "doelpunt" && e.scorendTeamId !== teamId).length;
      gescoord += voor; tegenscoord += tegen;
      if (voor > tegen) gewonnen++;
      else if (voor < tegen) verloren++;
      else gelijk++;
      (w.events || []).filter(e => e.type === "doelpunt" && e.scorendTeamId === teamId).forEach(e => {
        doeltypeCount[e.doeltype] = (doeltypeCount[e.doeltype] || 0) + 1;
      });
    });
    return { wedstrs: wedstrs.length, gewonnen, gelijk, verloren, gescoord, tegenscoord, doeltypeCount };
  }

  function spelersStats(spelerId) {
    let doelpunten = 0, doeltypen = {};
    let wisselMinuten = [];
    gespeeld.forEach(w => {
      (w.events || []).forEach(e => {
        if (e.type === "doelpunt" && e.spelerId === spelerId) {
          doelpunten++;
          doeltypen[e.doeltype] = (doeltypen[e.doeltype] || 0) + 1;
        }
        if (e.type === "wissel") {
          if (e.inSpelerId === spelerId) wisselMinuten.push({ actie: "in", minuut: e.minuut, helft: e.helft });
          if (e.uitSpelerId === spelerId) wisselMinuten.push({ actie: "uit", minuut: e.minuut, helft: e.helft });
        }
      });
    });
    return { doelpunten, doeltypen, wisselMinuten };
  }

  function exporteerSpelers() {
    const rows = spelers.map(sp => {
      const st = spelersStats(sp.id);
      return { Naam: sp.naam, Team: teams.find(t => t.id === sp.teamId)?.naam || "", "Totaal doelpunten": st.doelpunten, ...Object.fromEntries(DOELTYPEN.map(d => [d, st.doeltypen[d] || 0])) };
    });
    exportCSV(rows, "speler_statistieken.csv");
  }

  function exporteerTeams() {
    const rows = relevanteTeams.map(t => {
      const st = teamStats(t.id);
      return { Team: t.naam, Wedstrijden: st.wedstrs, Gewonnen: st.gewonnen, Gelijk: st.gelijk, Verloren: st.verloren, "Voor": st.gescoord, "Tegen": st.tegenscoord, ...Object.fromEntries(DOELTYPEN.map(d => [d, st.doeltypeCount[d] || 0])) };
    });
    exportCSV(rows, "team_statistieken.csv");
  }

  const relevanteSpelers = isManager ? spelers : spelers.filter(s => s.teamId === mijnTeamId);

  return (
    <div>
      <h2 style={s.h2}>📈 Statistieken</h2>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {["teams", "spelers"].map(t => (
          <button key={t} style={s.btn(statTab === t ? "primary" : "secondary")} onClick={() => setStatTab(t)}>
            {t === "teams" ? "👕 Teams" : "👤 Spelers"}
          </button>
        ))}
        <button style={{ ...s.btn("success"), marginLeft: "auto" }} onClick={statTab === "teams" ? exporteerTeams : exporteerSpelers}>📥 Export naar CSV/Excel</button>
      </div>

      {statTab === "teams" && (
        <div>
          {relevanteTeams.map(t => {
            const st = teamStats(t.id);
            return (
              <div key={t.id} style={s.card}>
                <h3 style={{ ...s.h3, color: C.oranje }}>{t.naam}</h3>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  {[["Gespeeld", st.wedstrs], ["Gewonnen", st.gewonnen, C.succes], ["Gelijk", st.gelijk, "#888"], ["Verloren", st.verloren, C.gevaar], ["Voor", st.gescoord, C.oranje], ["Tegen", st.tegenscoord]].map(([l, v, c]) => (
                    <div key={l} style={{ textAlign: "center", background: C.grijs, borderRadius: 8, padding: "8px 14px" }}>
                      <div style={{ fontWeight: 700, fontSize: 20, color: c || C.tekst }}>{v}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 13 }}>
                  <strong>Doeltypen:</strong> {DOELTYPEN.map(d => <span key={d} style={{ ...s.badge(C.oranjeLight), marginRight: 4 }}>{d}: {st.doeltypeCount[d] || 0}</span>)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {statTab === "spelers" && (
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                {["Speler", "Team", "Doelpunten", ...DOELTYPEN, "Wissels"].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[...relevanteSpelers].sort((a, b) => spelersStats(b.id).doelpunten - spelersStats(a.id).doelpunten).map(sp => {
                const st = spelersStats(sp.id);
                return (
                  <tr key={sp.id}>
                    <td style={s.td}><strong>{sp.naam}</strong></td>
                    <td style={s.td}>{teams.find(t => t.id === sp.teamId)?.naam || "—"}</td>
                    <td style={{ ...s.td, fontWeight: 700, color: C.oranje }}>{st.doelpunten}</td>
                    {DOELTYPEN.map(d => <td key={d} style={s.td}>{st.doeltypen[d] || 0}</td>)}
                    <td style={s.td}>{st.wisselMinuten.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
