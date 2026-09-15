import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis, Tooltip,
} from "recharts";
import {
  Home, Users, UploadCloud, BarChart3, Search, ChevronDown,
  Phone, ShieldCheck, ShieldAlert, ArrowUpRight, Info, Trash2, Download,
  FileText, Settings, Zap, ArrowLeft, X, SlidersHorizontal, Mic, Grid3x3,
  Pause, PhoneOff, PhoneCall, Music, Clock, List, ChevronRight, Check,
} from "lucide-react";

/* ----------------------------- Mock data ----------------------------- */

const CONTACTS = [
  { name: "Alex Thomas", phone: "+91 98765 43210", tag: "Personal" },
  { name: "Bank Support", phone: "+91 91234 56789", tag: "Business" },
  { name: "James Peter", phone: "+91 99876 54321", tag: "Personal" },
  { name: "Marketing Team", phone: "+91 93456 12345", tag: "Business" },
  { name: "Riya Nair", phone: "+91 98450 67890", tag: "Personal" },
  { name: "Support Helpline", phone: "+91 90678 12345", tag: "Business" },
  { name: "Vendor Call", phone: "+91 96789 34567", tag: "Business" },
  { name: "Anil Kumar", phone: "+91 91230 44556", tag: "Personal" },
  { name: "Sarah Connor", phone: "+91 99880 11223", tag: "Personal" },
  { name: "David Lee", phone: "+91 90011 22334", tag: "Personal" },
  { name: "Priya Sharma", phone: "+91 98877 66554", tag: "Personal" },
  { name: "Karthik R", phone: "+91 98432 11009", tag: "Personal" },
].map((c, i) => ({
  ...c,
  initials: c.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
  color: ["neu-icon-blue text-blue-600", "neu-icon-red text-red-500", "neu-icon-slate text-violet-600",
    "neu-icon-green text-emerald-600", "neu-icon-amber text-amber-600"][i % 5],
}));

const REPORTS = [
  { file: "call_sample_01.wav", date: "Sep 13, 2026 10:24 AM", result: "AI Clone Detected", score: 92 },
  { file: "customer_voice.mp3", date: "Sep 12, 2026 04:18 PM", result: "Genuine", score: 13 },
  { file: "bank_call.ogg", date: "Sep 11, 2026 11:03 AM", result: "AI Clone Detected", score: 89 },
  { file: "unknown_number.wav", date: "Sep 10, 2026 02:45 PM", result: "Genuine", score: 21 },
  { file: "support_call.m4a", date: "Sep 09, 2026 09:27 AM", result: "Genuine", score: 18 },
  { file: "recording_06.mp3", date: "Sep 08, 2026 06:12 PM", result: "AI Clone Detected", score: 84 },
  { file: "voice_note.wav", date: "Sep 07, 2026 01:54 PM", result: "Genuine", score: 9 },
  { file: "suspicious_call.ogg", date: "Sep 06, 2026 10:11 AM", result: "AI Clone Detected", score: 91 },
  { file: "client_discussion.mp3", date: "Sep 05, 2026 03:36 PM", result: "Genuine", score: 15 },
  { file: "test_audio.wav", date: "Sep 04, 2026 12:20 PM", result: "Unknown", score: 54 },
];

const RECENT_ACTIVITY = [
  { time: "10:24 AM", source: "+91 98765 43210", result: "AI Clone Detected", confidence: 92 },
  { time: "10:18 AM", source: "Customer Support", result: "Genuine", confidence: 87 },
  { time: "10:15 AM", source: "+91 91234 56789", result: "AI Clone Detected", confidence: 89 },
  { time: "10:02 AM", source: "Bank Helpline", result: "Genuine", confidence: 95 },
  { time: "09:58 AM", source: "+91 90678 12345", result: "Unknown", confidence: 54 },
];

const TREND_7D = [
  { day: "Sep 7", genuine: 8, clone: 6 },
  { day: "Sep 8", genuine: 11, clone: 4 },
  { day: "Sep 9", genuine: 12, clone: 5 },
  { day: "Sep 10", genuine: 12, clone: 6 },
  { day: "Sep 11", genuine: 13, clone: 6 },
  { day: "Sep 12", genuine: 13, clone: 7 },
  { day: "Sep 13", genuine: 12, clone: 7 },
];

const TREND_30D = [
  { day: "W1", genuine: 38, clone: 14 }, { day: "W2", genuine: 44, clone: 19 },
  { day: "W3", genuine: 41, clone: 22 }, { day: "W4", genuine: 48, clone: 27 },
];

const THREAT_DIST = [
  { name: "Genuine", value: 62, color: "#2563eb" },
  { name: "AI Clone", value: 28, color: "#ef4444" },
  { name: "Unknown", value: 10, color: "#f59e0b" },
];

const REASON_TEMPLATES = [
  { key: "voice", icon: Mic, label: "Voice Similarity" },
  { key: "speaker", icon: Users, label: "Speaker Behaviour" },
  { key: "audio", icon: Music, label: "Audio Quality" },
  { key: "linguistic", icon: FileText, label: "Linguistic Patterns" },
];

/* ----------------------------- Helpers ----------------------------- */

function riskColor(pct) {
  if (pct < 34) return { text: "text-emerald-600", bg: "bg-emerald-50", ring: "#10b981", label: "Low Risk" };
  if (pct < 67) return { text: "text-amber-600", bg: "bg-amber-50", ring: "#f59e0b", label: "Medium Risk" };
  return { text: "text-red-600", bg: "bg-red-50", ring: "#ef4444", label: "High Risk" };
}

function buildReasons(pct) {
  const bad = pct >= 50;
  return [
    { ...REASON_TEMPLATES[0], detail: bad ? "High match with known fraudulent voice patterns" : "Low match with known fraud patterns", badge: bad ? "High" : "Low", ok: !bad },
    { ...REASON_TEMPLATES[1], detail: bad ? "Detected synthetic voice characteristics" : "Natural speech flow detected", badge: bad ? "Unusual" : "Normal", ok: !bad },
    { ...REASON_TEMPLATES[2], detail: bad ? "Unnatural speech flow and phrasing" : "No signs of synthetic audio", badge: bad ? "Flagged" : "Clear", ok: !bad },
    { ...REASON_TEMPLATES[3], detail: bad ? "Number not found in trusted contacts" : "Consistent with genuine conversation", badge: bad ? "Anomaly" : "Normal", ok: !bad },
  ];
}

function fmtBytes(bytes) {
  if (!bytes) return "0 MB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}
function fmtDuration(sec) {
  if (!sec || Number.isNaN(sec)) return "--:--";
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function fmtClock(sec) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
function download(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ----------------------------- Small UI atoms ----------------------------- */

function Logo() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="relative w-8 h-8 shrink-0 mt-1">
        <div className="absolute left-0 top-0.5 w-[18px] h-[18px] rounded-full bg-blue-600" />
        <div className="absolute right-0 top-0 w-[15px] h-[15px] rounded-[3px] bg-red-500" />
        <div className="absolute right-0 bottom-0 w-[15px] h-[15px] rounded-[3px] bg-amber-400" />
      </div>
      <div className="leading-none">
        <div className="text-[26px] font-extrabold tracking-tight text-slate-900">orbit</div>
        <div className="text-[10.5px] font-medium text-slate-400 mt-1 whitespace-nowrap">
          AI Voice Fraud Detection
        </div>
      </div>
    </div>
  );
}

function Badge({ children, tone = "gray" }) {
  const tones = {
    red: "neu-icon-red text-red-600",
    green: "neu-icon-green text-emerald-600",
    yellow: "neu-icon-amber text-amber-600",
    gray: "neu-icon-slate text-slate-500",
    blue: "neu-icon-blue text-blue-600",
  };
  return <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function ResultBadge({ result }) {
  if (result === "AI Clone Detected") return <Badge tone="red">{result}</Badge>;
  if (result === "Genuine") return <Badge tone="green">{result}</Badge>;
  return <Badge tone="yellow">{result}</Badge>;
}

function Card({ className = "", children }) {
  return <div className={`neu-card ${className}`}>{children}</div>;
}

/* ----------------------------- Layout: Sidebar + Topbar ----------------------------- */

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "upload", label: "Upload Audio", icon: UploadCloud },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

function Sidebar({ page, go }) {
  const active = ["dashboard", "incomingCall", "callProgress"].includes(page) ? "dashboard"
    : ["upload", "uploadResult"].includes(page) ? "upload"
    : ["reports", "reportDetail"].includes(page) ? "reports" : page;

  return (
    <aside
  className="w-[290px] hidden lg:flex flex-col fixed left-0 top-0 h-screen z-30 px-7 pt-8 pb-6"
  style={{ background: "var(--sidebar-bg)" }}
>
      <Logo />
      <nav className="mt-10 flex flex-col gap-3 relative z-10">
        {NAV.map((n) => {
          const Icon = n.icon;
          const isActive = active === n.id;
          return (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={`flex items-center gap-4 pl-3 pr-5 py-2.5 rounded-full text-[15px] transition-all text-left
                ${isActive
                  ? "neu-nav-active font-semibold text-blue-600"
                  : "font-medium text-slate-500 hover:text-slate-700"}`}
            >
              <span
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0
                  ${isActive ? "neu-icon-blue" : "neu-circle"}`}
              >
                <Icon size={19} strokeWidth={2} className={isActive ? "text-blue-600" : "text-slate-600"} />
              </span>
              {n.label}
            </button>
          );
        })}
      </nav>

      <div className="orbit-brandmark absolute -bottom-10 -left-10 pointer-events-none" aria-hidden="true">
  <span /><span /><span /><span />
</div>
    </aside>
  );
}

function Topbar({ search, setSearch, placeholder, name = "Sanin", role = "Analyst" }) {
  const [profOpen, setProfOpen] = useState(false);
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex-1 relative max-w-xl">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="neu-inset w-full pl-[52px] pr-5 py-3.5 rounded-full text-sm text-slate-700 placeholder:text-slate-400 outline-none border-none"
        />
      </div>
      <div className="relative">
        <button onClick={() => setProfOpen((v) => !v)}
          className="flex items-center gap-3 pl-1 pr-3 py-1">
          <div className="neu-icon-blue w-11 h-11 rounded-full flex items-center justify-center font-bold text-blue-600">
            {name[0]}
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-[15px] font-bold text-slate-900">{name}</div>
            <div className="text-xs text-slate-400">{role}</div>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
        {profOpen && (
          <div className="neu-card absolute right-0 mt-3 w-44 p-2 z-20 text-sm">
            <div className="px-3 py-2 rounded-xl hover:bg-white/50 text-slate-600 cursor-pointer">Profile</div>
            <div className="px-3 py-2 rounded-xl hover:bg-white/50 text-slate-600 cursor-pointer">Settings</div>
            <div className="px-3 py-2 rounded-xl hover:bg-white/50 text-red-500 cursor-pointer">Log out</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Gauge (semi-circle) ----------------------------- */

function Gauge({ pct, size = 220 }) {
  const rc = riskColor(pct);
  const data = [{ value: pct, fill: rc.ring }];
  const chartHeight = Math.round(size * 0.55);   // height for just the arc
  const labelHeight = 64;                         // reserved space for text, no overlap

  return (
    <div
      className="relative flex justify-center"
      style={{ width: size, height: chartHeight + labelHeight }}
    >
      <RadialBarChart
        width={size} height={chartHeight} cx="50%" cy="100%"
        innerRadius="72%" outerRadius="100%" barSize={16}
        data={data} startAngle={180} endAngle={0}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
        <RadialBar background={{ fill: "#dde3ee" }} dataKey="value" cornerRadius={10} isAnimationActive />
      </RadialBarChart>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center pointer-events-none">
        <div className="text-4xl font-bold text-slate-900 leading-none">{Math.round(pct)}%</div>
        <div className={`text-sm font-semibold mt-1.5 whitespace-nowrap ${rc.text}`}>{rc.label}</div>
      </div>
    </div>
  );
}

/* ----------------------------- Dashboard ----------------------------- */

function StatCard({ icon: Icon, well, iconColor, label, value, delta, deltaTone = "green", onClick }) {
  return (
    <Card className={`p-5 ${onClick ? "neu-press cursor-pointer" : ""}`}>
      <button onClick={onClick} disabled={!onClick} className="flex items-center gap-4 w-full text-left">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${well}`}>
          <Icon size={22} className={iconColor} strokeWidth={2.2} />
        </div>
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <div className="text-[28px] font-bold text-slate-900 leading-none">{value}</div>
            <div className={`flex items-center gap-0.5 text-xs font-bold ${deltaTone === "red" ? "text-red-500" : "text-emerald-500"}`}>
              <ArrowUpRight size={13} strokeWidth={2.5} /> {delta}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">vs last week</div>
        </div>
      </button>
    </Card>
  );
}

function Dashboard({ go, startCall }) {
  const [range, setRange] = useState("7d");
  const trend = range === "7d" ? TREND_7D : TREND_30D;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-semibold tracking-[0.25em] text-blue-500 mb-2">AI FOR A SAFER TOMORROW</div>
          <h1 className="text-3xl font-bold text-slate-900">Good morning, Sanin.</h1>
          <p className="text-slate-500 mt-1">Monitor. Detect. Prevent voice fraud in real time.</p>
        </div>
        <div className="flex gap-3">
          <Card className="p-5 w-48 flex items-center gap-3">
            <div className="relative w-9 h-9 shrink-0">
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-600" />
              <div className="absolute right-0 bottom-0 w-6 h-6 rounded-full bg-red-500 opacity-90" />
            </div>
            <div className="text-[13px] font-semibold text-slate-700 tracking-wide leading-tight">HUMAN<br />VOICES<br />MATTER</div>
          </Card>
          <Card className="p-5 w-64 flex items-center gap-3">
            <p className="text-sm text-slate-700 leading-snug flex-1">“Stopping voice scams builds a safer tomorrow.”</p>
            <div className="flex items-end gap-1 h-8">
              <div className="w-1.5 bg-red-300 rounded-full h-4" />
              <div className="w-1.5 bg-blue-300 rounded-full h-6" />
              <div className="w-1.5 bg-slate-800 rounded-full h-8" />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard icon={Phone} well="neu-icon-blue" iconColor="text-blue-600" label="Live Calls Monitored" value="24" delta="12%"
          onClick={() => startCall("Alex Thomas", "+91 98765 43210", "AT")} />
        <StatCard icon={ShieldAlert} well="neu-icon-red" iconColor="text-red-500" label="Detected Clones" value="7" delta="40%" deltaTone="red" onClick={() => go("reports")} />
        <StatCard icon={ShieldCheck} well="neu-icon-amber" iconColor="text-amber-500" label="Verified Genuine" value="16" delta="6%" onClick={() => go("reports")} />
        <StatCard icon={BarChart3} well="neu-icon-slate" iconColor="text-slate-600" label="Total Analysed" value="48" delta="20%" onClick={() => go("reports")} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <span className="neu-icon-slate w-9 h-9 rounded-full flex items-center justify-center"><BarChart3 size={16} className="text-slate-600" /></span> Detection Trend
            </div>
            <select value={range} onChange={(e) => setRange(e.target.value)}
              className="neu-inset text-sm rounded-xl px-4 py-2 text-slate-600 outline-none border-none">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> AI Clone</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Genuine</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} barGap={0} barCategoryGap="28%">
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.45)" }} />
              <Bar dataKey="clone" stackId="a" fill="#f87171" radius={[0, 0, 6, 6]} />
              <Bar dataKey="genuine" stackId="a" fill="#60a5fa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
            {trend.map((d) => <span key={d.day}>{d.day}</span>)}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
            <span className="neu-icon-slate w-9 h-9 rounded-full flex items-center justify-center"><ShieldCheck size={16} className="text-slate-600" /></span> Threat Distribution
          </div>
          <div className="relative flex justify-center">
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={THREAT_DIST} dataKey="value" innerRadius={58} outerRadius={82} paddingAngle={2} startAngle={90} endAngle={-270}>
                  {THREAT_DIST.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-slate-900">48</div>
              <div className="text-xs text-slate-400">Analysed</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {THREAT_DIST.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600"><span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />{d.name}</span>
                <span className="font-semibold text-slate-800">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-semibold text-slate-800"><span className="neu-icon-slate w-9 h-9 rounded-full flex items-center justify-center"><Clock size={16} className="text-slate-600" /></span> Recent Activity</div>
            <button onClick={() => go("reports")} className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">View All <ChevronRight size={14} /></button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left">
                <th className="font-medium py-2">Time</th><th className="font-medium py-2">Source</th>
                <th className="font-medium py-2">Result</th><th className="font-medium py-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ACTIVITY.map((r, i) => (
                <tr key={i} className="border-t border-white/70">
                  <td className="py-3 text-slate-500">{r.time}</td>
                  <td className="py-3 text-slate-700 flex items-center gap-2"><Phone size={13} className="text-slate-400" />{r.source}</td>
                  <td className="py-3"><ResultBadge result={r.result} /></td>
                  <td className="py-3 text-slate-700">{r.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 font-semibold text-slate-800 mb-4"><span className="neu-icon-slate w-9 h-9 rounded-full flex items-center justify-center"><Zap size={16} className="text-slate-600" /></span> Quick Actions</div>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon={UploadCloud} title="Upload Audio" sub="Analyse a recorded call" onClick={() => go("upload")} />
            <QuickAction icon={Users} title="Manage Contacts" sub="Add or update contacts" onClick={() => go("contacts")} />
            <QuickAction icon={FileText} title="View Reports" sub="Generate detailed reports" onClick={() => go("reports")} />
            <QuickAction icon={Settings} title="Settings" sub="Configure detection rules" onClick={() => alert("Detection rule settings coming soon.")} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, sub, onClick }) {
  return (
    <button onClick={onClick} className="neu-card-sm neu-press text-left p-4 flex flex-col gap-2.5">
      <span className="neu-icon-blue w-10 h-10 rounded-full flex items-center justify-center">
        <Icon size={17} className="text-blue-600" strokeWidth={2.2} />
      </span>
      <div className="text-sm font-semibold text-slate-800">{title}</div>
      <div className="text-xs text-slate-400 leading-snug">{sub}</div>
    </button>
  );
}

/* ----------------------------- Contacts ----------------------------- */

function Contacts({ search, setSearch, startCall }) {
  const filtered = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] text-slate-400">CONTACTS</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Contacts</h1>
          <p className="text-slate-500 text-sm mt-1">Call a contact to watch Orbit analyse the voice live.</p>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400 text-left border-b border-white/70">
            <th className="font-medium py-3 w-12">#</th>
            <th className="font-medium py-3">Name</th>
            <th className="font-medium py-3">Phone Number</th>
            <th className="font-medium py-3 w-28 text-right">Call</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => (
            <tr key={c.phone} className="border-b border-white/60 hover:bg-white/40 transition-colors group">
              <td className="py-3 text-slate-400">{i + 1}</td>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${c.color}`}>{c.initials}</div>
                  <span className="text-slate-800 font-medium">{c.name}</span>
                </div>
              </td>
              <td className="py-3 text-slate-500">{c.phone}</td>
              <td className="py-3 text-right">
                <button
                  onClick={() => startCall(c.name, c.phone, c.initials)}
                  aria-label={`Call ${c.name}`}
                  className="neu-card-sm neu-press inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-emerald-600 font-semibold"
                >
                  <PhoneCall size={15} /> Call
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={4} className="py-8 text-center text-slate-400">No contacts match “{search}”.</td></tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

/* ----------------------------- Upload Audio ----------------------------- */

function UploadAudio({ onAnalyzed }) {
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const inputRef = useRef(null);

  function handleFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.src = url;
    setAnalyzing(true);
    const finish = (duration) => {
      const score = Math.round(20 + Math.random() * 70);
      setTimeout(() => {
        setAnalyzing(false);
        onAnalyzed({
          name: file.name,
          type: (file.type.split("/")[1] || file.name.split(".").pop() || "audio").toUpperCase(),
          size: fmtBytes(file.size),
          duration: fmtDuration(duration),
          uploadedAt: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" }),
          url, score,
        });
      }, 1600);
    };
    audio.addEventListener("loadedmetadata", () => finish(audio.duration));
    audio.addEventListener("error", () => finish(NaN));
    setTimeout(() => { if (Number.isNaN(audio.duration)) finish(NaN); }, 1200);
  }

  return (
    <div>
      <div className="text-xs font-semibold tracking-[0.2em] text-slate-400">UPLOAD AUDIO</div>
      <h1 className="text-2xl font-bold text-slate-900 mt-1">Upload Audio</h1>
      <p className="text-slate-500 mt-1 mb-6">Analyse voice recordings to detect AI clones and potential scams.</p>

      <Card
        className={`p-14 flex flex-col items-center justify-center text-center transition-all ${dragOver ? "neu-inset" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
      >
        {analyzing ? (
          <>
            <div className="neu-icon-blue w-24 h-24 rounded-full flex items-center justify-center mb-6">
              <div className="w-9 h-9 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
            <div className="text-lg font-semibold text-slate-800">Analysing your audio…</div>
            <p className="text-slate-400 text-sm mt-1">This usually takes a few seconds.</p>
          </>
        ) : (
          <>
            <div className="neu-circle w-24 h-24 rounded-full flex items-center justify-center mb-6">
              <UploadCloud size={30} className="text-slate-700" />
            </div>
            <div className="text-lg font-semibold text-slate-800">Drag and drop an audio file here</div>
            <div className="text-slate-400 text-sm my-3">or</div>
            <button onClick={() => inputRef.current?.click()}
              className="neu-btn-blue neu-press px-8 py-3 rounded-full text-sm font-semibold">
              Choose File
            </button>
            <input ref={inputRef} type="file" accept="audio/*" className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])} />
            <div className="text-xs text-slate-400 mt-5">Supported formats: MP3, WAV, M4A, OGG</div>
            <div className="text-xs text-slate-400">Max file size: 50 MB</div>
          </>
        )}
      </Card>

      <div className="neu-card mt-6 flex items-center gap-3 px-6 py-5 text-sm text-slate-500">
        <Info size={16} className="text-slate-400 shrink-0" />
        Your audio is processed securely and not stored permanently.
      </div>
    </div>
  );
}

/* ----------------------------- Upload Result / Report detail ----------------------------- */

function ResultView({ data, onBack, onDelete }) {
  const [openIdx, setOpenIdx] = useState(null);
  const reasons = useMemo(() => buildReasons(data.score), [data.score]);
  const rc = riskColor(data.score);

  function expandAll() { setOpenIdx(openIdx === "all" ? null : "all"); }

  function handleDownload() {
    const lines = [
      `Orbit Voice Fraud Report`,
      `File: ${data.name}`,
      `Uploaded: ${data.uploadedAt}`,
      `Fraud probability: ${data.score}% (${rc.label})`,
      ``,
      `Reasons:`,
      ...reasons.map((r) => `- ${r.label}: ${r.detail} [${r.badge}]`),
    ];
    download(`${data.name.replace(/\.[^.]+$/, "")}-report.txt`, lines.join("\n"));
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft size={15} /> Back
      </button>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upload Result</h1>
          <p className="text-slate-500 mt-1">Analysis complete. Here's what we found in your audio.</p>
        </div>
        {onDelete && (
          <button onClick={onDelete} className="neu-card-sm neu-press flex items-center gap-2 text-sm text-slate-500 rounded-full px-5 py-2.5">
            <Trash2 size={15} /> Delete
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="neu-icon-blue w-12 h-12 rounded-2xl flex items-center justify-center"><Music size={19} className="text-blue-600" /></div>
            <div>
              <div className="font-semibold text-slate-800">{data.name}</div>
              <div className="text-xs text-slate-400">{data.type} · {data.size} · {data.uploadedAt}</div>
            </div>
          </div>

          {data.url ? (
            <audio controls src={data.url} className="w-full mb-6" />
          ) : (
            <div className="neu-inset flex items-center gap-3 rounded-2xl px-5 py-4 mb-6">
              <button className="neu-btn-blue w-10 h-10 rounded-full flex items-center justify-center shrink-0"><Pause size={14} /></button>
              <div className="flex-1 h-6 flex items-end gap-[2px]">
                {Array.from({ length: 46 }).map((_, i) => (
                  <div key={i} className="w-1 rounded-full bg-blue-300" style={{ height: `${8 + ((i * 37) % 20)}px`, opacity: i > 30 ? 0.3 : 1 }} />
                ))}
              </div>
              <span className="text-xs text-slate-400">{data.duration}</span>
            </div>
          )}

          <div className="text-sm font-semibold text-slate-800 mb-3">Audio Details</div>
          <div className="divide-y divide-white/70 text-sm">
            {[["File Name", data.name], ["File Type", data.type], ["File Size", data.size], ["Duration", data.duration], ["Upload Date", data.uploadedAt]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-3">
                <span className="text-slate-400">{k}</span>
                <span className="text-slate-700 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-slate-800">Fraud Probability</div>
            <Badge tone="blue">Analysed</Badge>
          </div>
          <div className="flex justify-center py-2"><Gauge pct={data.score} /></div>

          <div className="text-sm font-semibold text-slate-800 mt-4 mb-2">Reasons</div>
          <div className="flex flex-col divide-y divide-white/70">
            {reasons.map((r, i) => {
              const Icon = r.icon;
              const open = openIdx === "all" || openIdx === i;
              return (
                <div key={r.key} className="py-3">
                  <button onClick={() => setOpenIdx(open && openIdx !== "all" ? null : i)} className="w-full flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${r.ok ? "neu-icon-green" : "neu-icon-red"}`}>
                      <Icon size={15} className={r.ok ? "text-emerald-500" : "text-red-500"} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-slate-800">{r.label}</div>
                      <div className="text-xs text-slate-400">{r.detail}</div>
                    </div>
                    <ChevronDown size={15} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="neu-inset mt-5 rounded-2xl p-5 flex gap-3">
            <FileText size={17} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-slate-800 mb-1">Summary</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {data.score >= 50
                  ? "This audio has a high likelihood of being an AI-generated or cloned voice. We recommend further verification before taking any action."
                  : "This audio closely matches natural, human speech patterns with no strong indicators of cloning."}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleDownload} className="neu-card-sm neu-press flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-slate-600">
              <Download size={15} /> Download Report
            </button>
            <button onClick={expandAll} className="neu-btn-blue neu-press flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold">
              <FileText size={15} /> View Full Report
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ----------------------------- Reports list ----------------------------- */

function Reports({ search, setSearch, onOpen }) {
  const filtered = REPORTS.filter((r) => r.file.toLowerCase().includes(search.toLowerCase()));
  return (
    <Card className="p-6">
      <div className="mb-4">
        <div className="text-xs font-semibold tracking-[0.2em] text-slate-400">REPORTS</div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Reports</h1>
        <p className="text-slate-500 text-sm mt-1">View your analysed audio reports.</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400 text-left border-b border-white/70">
            <th className="font-medium py-3 w-12">#</th>
            <th className="font-medium py-3">File Name</th>
            <th className="font-medium py-3">Date &amp; Time</th>
            <th className="font-medium py-3">Result</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={r.file} onClick={() => onOpen(r)} className="border-b border-white/60 hover:bg-white/40 transition-colors cursor-pointer">
              <td className="py-3 text-slate-400">{i + 1}</td>
              <td className="py-3 text-slate-700 font-medium">{r.file}</td>
              <td className="py-3 text-slate-500">{r.date}</td>
              <td className="py-3"><ResultBadge result={r.result} /></td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={4} className="py-8 text-center text-slate-400">No reports match “{search}”.</td></tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

/* ----------------------------- Incoming call ----------------------------- */

function IncomingCall({ caller, onAccept, onDecline }) {
  const [phase, setPhase] = useState("analyzing");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const score = Math.round(15 + Math.random() * 25); // usually low risk on incoming demo
    const t = setTimeout(() => { setPct(score); setPhase("done"); }, 2200);
    return () => clearTimeout(t);
  }, []);

  const rc = riskColor(pct);
  const rows = [
    { label: "Risk Level", icon: ShieldCheck, value: phase === "done" ? rc.label : null },
    { label: "Voice Match", icon: Mic, value: phase === "done" ? (pct < 34 ? "Matches known contact" : "Uncertain match") : null },
    { label: "AI Probability", icon: BarChart3, value: phase === "done" ? `${pct}%` : null },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
      <Card className="p-10 flex flex-col">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 text-emerald-500 font-medium text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Incoming Call
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-slate-400">
            LIVE AI DETECTION
            <div className="flex items-end gap-[2px] h-4">
              {[6, 12, 8, 14, 6].map((h, i) => <div key={i} className="w-[3px] bg-red-400 rounded-full animate-pulse" style={{ height: h, animationDelay: `${i * 0.1}s` }} />)}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center flex-1 justify-center">
          <div className="neu-icon-blue w-36 h-36 rounded-full flex items-center justify-center text-5xl font-bold text-blue-600 mb-6">{caller.initials}</div>
          <div className="text-2xl font-bold text-slate-900">{caller.name}</div>
          <div className="text-slate-500 mt-1">{caller.phone}</div>
          <div className="neu-inset mt-5 px-5 py-2 rounded-full text-slate-500 text-sm">Calling…</div>
        </div>

        <div className="flex items-center justify-center gap-16 mt-10">
          <div className="flex flex-col items-center gap-2">
            <button onClick={onDecline} className="neu-btn-red neu-press w-[68px] h-[68px] rounded-full flex items-center justify-center">
              <PhoneOff size={24} />
            </button>
            <span className="text-sm font-medium text-slate-700">Decline</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button onClick={onAccept} className="neu-btn-green neu-press w-[68px] h-[68px] rounded-full flex items-center justify-center">
              <PhoneCall size={24} />
            </button>
            <span className="text-sm font-medium text-slate-700">Accept</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="font-semibold text-slate-800 mb-4">Real-time Analysis</div>
        {phase === "analyzing" ? (
          <div className="neu-icon-red rounded-2xl p-4 flex items-center gap-3 mb-5">
            <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin shrink-0" />
            <div>
              <div className="text-sm font-semibold text-red-600">Analysing voice…</div>
              <div className="text-xs text-red-400">Detecting potential AI clone patterns</div>
            </div>
          </div>
        ) : (
          <div className={`rounded-xl p-4 flex items-center gap-3 mb-5 ${rc.bg}`}>
            <ShieldCheck size={18} className={rc.text} />
            <div className={`text-sm font-semibold ${rc.text}`}>{rc.label} · {pct}% fraud probability</div>
          </div>
        )}

        <div className="flex flex-col divide-y divide-white/70 mb-5">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-sm text-slate-600"><Icon size={15} className="text-slate-400" />{r.label}</span>
                {r.value ? <span className="text-sm font-medium text-slate-800">{r.value}</span> : (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">Analysing…
                    <span className="w-3.5 h-3.5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-sm font-semibold text-slate-800 mb-3">Caller Info</div>
        <div className="flex flex-col gap-3 text-sm text-slate-600 mb-5">
          <div className="flex items-center gap-2"><Users size={14} className="text-slate-400" />{caller.name}</div>
          <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" />{caller.phone}</div>
          <div className="flex items-center gap-2"><FileText size={14} className="text-slate-400" />Personal</div>
        </div>

        <div className="text-sm font-semibold text-slate-800 mb-3">Recent Activity</div>
        <div className="flex flex-col gap-2 text-sm text-slate-500">
          <div className="flex items-center gap-2"><Clock size={14} className="text-slate-400" />Last call: Sep 10, 2026 · 11:24 AM</div>
          <div className="flex items-center gap-2"><List size={14} className="text-slate-400" />Total calls: 3</div>
        </div>
      </Card>
    </div>
  );
}

/* ----------------------------- Call in progress ----------------------------- */

function CallProgress({ caller, onEnd }) {
  const [elapsed, setElapsed] = useState(0);
  const [pct, setPct] = useState(28);
  const [bars, setBars] = useState(() => Array.from({ length: 46 }, () => 6 + Math.random() * 28));
  const [muted, setMuted] = useState(false);
  const [held, setHeld] = useState(false);
  const [controlOpen, setControlOpen] = useState(false);
  const [jitter, setJitter] = useState(30);
  const [packetLoss, setPacketLoss] = useState(2);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    const w = setInterval(() => setBars((b) => [...b.slice(1), 6 + Math.random() * 28]), 200);
    const p = setInterval(() => setPct((v) => Math.max(4, Math.min(96, v + (Math.random() * 10 - 5)))), 2800);
    return () => { clearInterval(t); clearInterval(w); clearInterval(p); };
  }, []);

  const rc = riskColor(pct);
  const reasons = buildReasons(pct);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
      <Card className="p-8 relative overflow-visible">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-emerald-500 font-medium text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Call in progress
            <span className="text-slate-400 font-normal ml-1">{fmtClock(elapsed)}</span>
          </div>
          <div className="neu-icon-blue flex items-center gap-2 text-blue-600 text-xs font-semibold px-4 py-2 rounded-full">
            <div className="flex items-end gap-[2px] h-3">
              {[4, 8, 5, 9, 4].map((h, i) => <div key={i} className="w-[2.5px] bg-blue-500 rounded-full" style={{ height: h }} />)}
            </div>
            AI Listening…
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="neu-icon-blue w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 mb-5">{caller.initials}</div>
          <div className="text-xl font-bold text-slate-900">{caller.name}</div>
          <div className="text-slate-500 mt-0.5">{caller.phone}</div>
          <div className="neu-icon-blue mt-4 px-5 py-1.5 rounded-full text-blue-600 text-xs font-semibold">Personal</div>
        </div>

        <div className="flex items-end justify-center gap-[3px] h-16 mt-8 mb-8">
          {bars.map((h, i) => (
            <div key={i} className="w-1.5 rounded-full transition-all duration-150"
              style={{ height: `${h}px`, background: i > bars.length * 0.62 ? "#cbd5e1" : "#60a5fa" }} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-10 relative">
          <CallBtn icon={Mic} label="Mute" active={muted} onClick={() => setMuted((v) => !v)} />
          <CallBtn icon={Grid3x3} label="Keypad" onClick={() => {}} />
          <div className="flex flex-col items-center gap-2">
            <button onClick={onEnd} className="neu-btn-red neu-press w-[68px] h-[68px] rounded-full flex items-center justify-center">
              <PhoneOff size={22} />
            </button>
            <span className="text-sm font-medium text-slate-700">End Call</span>
          </div>
          <CallBtn icon={Pause} label="Hold" active={held} onClick={() => setHeld((v) => !v)} />
          <div className="relative">
            <CallBtn icon={SlidersHorizontal} label="Control" active={controlOpen} onClick={() => setControlOpen((v) => !v)} />
            {controlOpen && (
              <div className="neu-card absolute bottom-20 right-0 w-72 p-5 z-30 text-left">
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center gap-2 font-semibold text-slate-800 text-sm"><SlidersHorizontal size={15} /> Network &amp; Audio Control</span>
                  <button onClick={() => setControlOpen(false)}><X size={15} className="text-slate-400" /></button>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5"><span>Jitter</span><span>{jitter} ms</span></div>
                  <input type="range" min={0} max={100} value={jitter} onChange={(e) => setJitter(+e.target.value)} className="w-full accent-blue-600" />
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5"><span>Packet Loss</span><span>{packetLoss} %</span></div>
                  <input type="range" min={0} max={20} value={packetLoss} onChange={(e) => setPacketLoss(+e.target.value)} className="w-full accent-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1.5">Codec</div>
                  <select className="neu-inset w-full rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none border-none">
                    <option>Opus (Default)</option><option>G.711</option><option>AAC-LD</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-slate-800">Real-time Analysis</div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Live</span>
        </div>
        <div className="flex justify-center py-2"><Gauge pct={pct} /></div>
        <div className={`rounded-xl p-4 flex items-center gap-3 mb-5 ${rc.bg}`}>
          <ShieldCheck size={18} className={rc.text} />
          <div>
            <div className={`text-sm font-semibold ${rc.text}`}>{rc.label}</div>
            <div className="text-xs text-slate-400">{pct < 34 ? "No significant clone patterns detected." : pct < 67 ? "Some irregular voice patterns detected." : "Strong indicators of a cloned voice."}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-slate-800">Reasons</div>
          <span className="neu-inset text-xs text-slate-500 flex items-center gap-1.5 px-3 py-1.5 rounded-full"><Search size={12} /> 4 checks analysed</span>
        </div>
        <div className="flex flex-col divide-y divide-white/70">
          {reasons.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.key} className="flex items-center gap-3 py-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${r.ok ? "neu-icon-green" : "neu-icon-red"}`}>
                  <Icon size={15} className={r.ok ? "text-emerald-500" : "text-red-500"} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">{r.label}</div>
                  <div className="text-xs text-slate-400">{r.detail}</div>
                </div>
                <Badge tone={r.ok ? "green" : "red"}>{r.badge}</Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function CallBtn({ icon: Icon, label, active, onClick }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button onClick={onClick} className={`w-16 h-16 rounded-full flex items-center justify-center ${active ? "neu-btn-blue" : "neu-card-sm neu-press text-slate-600"}`}>
        <Icon size={19} />
      </button>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  );
}

/* ----------------------------- Screen switcher ----------------------------- */
/* ----------------------------- App shell ----------------------------- */

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);
  const [caller, setCaller] = useState({ name: "Alex Thomas", phone: "+91 98765 43210", initials: "AT" });

  function go(p) { setSearch(""); setPage(p); }
  function startCall(name, phone, initials) { setCaller({ name, phone, initials }); setPage("incomingCall"); }

  // Jump straight to any screen, seeding sample data for the ones that
  // normally require finishing a flow first.
  function openScreen(id) {
    if (id === "uploadResult" && !uploadResult) {
      setUploadResult({
        name: "customer_call_sample.mp3", type: "MP3", size: "1.24 MB", duration: "02:32",
        uploadedAt: "Sep 13, 2026 10:24 AM", score: 72, url: null,
      });
    }
    if (id === "reportDetail" && !reportDetail) {
      const r = REPORTS[0];
      setReportDetail({
        name: r.file, type: r.file.split(".").pop().toUpperCase(), size: "1.24 MB",
        duration: "02:32", uploadedAt: r.date, score: r.score, url: null,
      });
    }
    setSearch("");
    setPage(id);
  }

  const placeholders = {
    dashboard: "Search contacts, cases, or audio files...",
    contacts: "Search contacts...",
    reports: "Search reports...",
    upload: "Search contacts, cases, or audio files...",
  };

  let body;
  if (page === "dashboard") body = <Dashboard go={go} startCall={startCall} />;
  else if (page === "contacts") body = <Contacts search={search} setSearch={setSearch} startCall={startCall} />;
  else if (page === "upload") body = <UploadAudio onAnalyzed={(d) => { setUploadResult(d); go("uploadResult"); }} />;
  else if (page === "uploadResult" && uploadResult)
    body = <ResultView data={uploadResult} onBack={() => go("upload")} onDelete={() => { setUploadResult(null); go("upload"); }} />;
  else if (page === "reports")
    body = <Reports search={search} setSearch={setSearch} onOpen={(r) => {
      setReportDetail({ name: r.file, type: r.file.split(".").pop().toUpperCase(), size: (1 + Math.random()).toFixed(2) + " MB", duration: "02:32", uploadedAt: r.date, score: r.score, url: null });
      go("reportDetail");
    }} />;
  else if (page === "reportDetail" && reportDetail)
    body = <ResultView data={reportDetail} onBack={() => go("reports")} />;
  else if (page === "incomingCall")
    body = <IncomingCall caller={caller} onAccept={() => setPage("callProgress")} onDecline={() => go("dashboard")} />;
  else if (page === "callProgress")
    body = <CallProgress caller={caller} onEnd={() => go("dashboard")} />;
  else body = <Dashboard go={go} startCall={startCall} />;

  const showTopbarSearch = ["dashboard", "contacts", "reports", "upload"].includes(page);

  return (
    <div className="min-h-screen flex text-slate-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar page={page} go={go} />
      <main className="flex-1 min-w-0 px-5 sm:px-8 py-7 lg:pl-[calc(290px+2rem)] max-w-[1740px] mx-auto w-full">
        <div className="lg:hidden mb-6"><Logo /></div>
        {showTopbarSearch ? (
          <Topbar search={search} setSearch={setSearch} placeholder={placeholders[page]} />
        ) : (
          <div className="flex justify-end mb-8">
            <Topbar search={""} setSearch={() => {}} placeholder="" />
          </div>
        )}

        {body}

        <div className="neu-card lg:hidden mt-8 flex justify-around p-3 sticky bottom-4">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <button key={n.id} onClick={() => go(n.id)} className={`p-3 rounded-full ${page === n.id ? "neu-icon-blue text-blue-600" : "text-slate-400"}`}>
                <Icon size={19} />
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
