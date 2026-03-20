"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── Agent network loading animation ───────────────────────────────────────

const AGENTS_CFG = [
  { key: "skill_analyst",    label: "Skill Analyst",     border: "#134E4A", glow: "rgba(45,212,160,0.13)",  x: 150, y: 52  },
  { key: "market_scout",     label: "Market Scout",      border: "#64748B", glow: "rgba(71,85,105,0.2)",    x: 268, y: 155 },
  { key: "learning_planner", label: "Learning Planner",  border: "#78716C", glow: "rgba(120,113,108,0.2)",  x: 32,  y: 155 },
  { key: "career_strategist",label: "Career Strategist", border: "#6B7280", glow: "rgba(107,114,128,0.2)",  x: 150, y: 258 },
];

// Pairs of agent indices that share a connection line
const EDGES = [[0,1],[0,2],[1,3],[2,3],[0,3],[1,2]];

const STATUS_MESSAGES = [
  "Skill Analyst scanning your background...",
  "Market Scout mapping the job market...",
  "Learning Planner identifying skill gaps...",
  "Career Strategist building your roadmap...",
  "Agents reaching consensus...",
];

function AgentIconInSVG({ k, cx, cy, color }: { k: string; cx: number; cy: number; color: string }) {
  if (k === "skill_analyst") return (
    <g>
      <circle cx={cx-1.5} cy={cy-2} r={4.5} stroke={color} strokeWidth={1.2} fill="none"/>
      <line x1={cx+1.8} y1={cy+1.5} x2={cx+5.5} y2={cy+5.5} stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    </g>
  );
  if (k === "market_scout") return (
    <g>
      <rect x={cx-5.5} y={cy+0.5} width={2.5} height={4.5} rx={0.3} fill={color}/>
      <rect x={cx-1.5} y={cy-2.5} width={2.5} height={7.5} rx={0.3} fill={color}/>
      <rect x={cx+2.5} y={cy-5.5} width={2.5} height={10.5} rx={0.3} fill={color}/>
    </g>
  );
  if (k === "learning_planner") return (
    <g>
      <path d={`M${cx} ${cy-5}C${cx} ${cy-5} ${cx-5.5} ${cy-6} ${cx-5.5} ${cy+3}C${cx-5.5} ${cy+3} ${cx} ${cy+2} ${cx} ${cy+5}`} stroke={color} strokeWidth={1.2} fill="none"/>
      <path d={`M${cx} ${cy-5}C${cx} ${cy-5} ${cx+5.5} ${cy-6} ${cx+5.5} ${cy+3}C${cx+5.5} ${cy+3} ${cx} ${cy+2} ${cx} ${cy+5}`} stroke={color} strokeWidth={1.2} fill="none"/>
      <line x1={cx} y1={cy-5} x2={cx} y2={cy+5} stroke={color} strokeWidth={0.8} strokeOpacity={0.5}/>
    </g>
  );
  // career_strategist
  return (
    <g>
      <rect x={cx-5} y={cy-6} width={10} height={12} rx={1} stroke={color} strokeWidth={1.2} fill="none"/>
      <line x1={cx-3} y1={cy-2} x2={cx+3} y2={cy-2} stroke={color} strokeWidth={1} strokeLinecap="round"/>
      <line x1={cx-3} y1={cy+1} x2={cx+3} y2={cy+1} stroke={color} strokeWidth={1} strokeLinecap="round"/>
      <line x1={cx-3} y1={cy+4} x2={cx+1} y2={cy+4} stroke={color} strokeWidth={1} strokeLinecap="round"/>
    </g>
  );
}

// One animated packet traveling from (x1,y1) → (x2,y2) then fading out
function Signal({ x1, y1, x2, y2, color, delay }: {
  x1: number; y1: number; x2: number; y2: number; color: string; delay: number;
}) {
  return (
    <motion.circle
      r={2.2}
      fill={color}
      fillOpacity={0}
      animate={{
        cx:          [x1, x2],
        cy:          [y1, y2],
        fillOpacity: [0, 0.75, 0.75, 0],
      }}
      transition={{
        duration: 2.2,
        repeat: Infinity,
        repeatDelay: 1.4,
        delay,
        ease: "linear",
        times: [0, 0.08, 0.92, 1],
      }}
    />
  );
}

function AgentsLoadingAnimation() {
  const [statusIdx, setStatusIdx] = useState(0);
  const [activeEdge, setActiveEdge] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => setStatusIdx(i => (i + 1) % STATUS_MESSAGES.length), 2200);
    const t2 = setInterval(() => setActiveEdge(i => (i + 1) % EDGES.length), 800);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const W = 300, H = 310;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", background: "#08090C",
    }}>
      {/* SVG network */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} overflow="visible">

        {/* Static dashed edges */}
        {EDGES.map(([a, b], i) => {
          const pa = AGENTS_CFG[a], pb = AGENTS_CFG[b];
          const isActive = activeEdge === i;
          return (
            <line key={i}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke={isActive ? "#3A3A3E" : "#2A2A2E"}
              strokeWidth={0.9}
              strokeDasharray="3 5"
            />
          );
        })}

        {/* Traveling signal packets — one per edge, staggered */}
        {EDGES.map(([a, b], i) => {
          const pa = AGENTS_CFG[a], pb = AGENTS_CFG[b];
          const color = AGENTS_CFG[a].border;
          return (
            <g key={i}>
              <Signal x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} color={color} delay={i * 0.55} />
              <Signal x1={pb.x} y1={pb.y} x2={pa.x} y2={pa.y} color={AGENTS_CFG[b].border} delay={i * 0.55 + 1.1} />
            </g>
          );
        })}

        {/* Agent circles */}
        {AGENTS_CFG.map((ag) => (
          <g key={ag.key}>
            {/* Glow pulse */}
            <motion.circle
              cx={ag.x} cy={ag.y} r={26}
              fill={ag.glow}
              animate={{ opacity: [0.4, 0.85, 0.4] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: Math.random() * 1.5 }}
            />
            {/* Main circle */}
            <motion.circle
              cx={ag.x} cy={ag.y} r={18}
              fill="#141416"
              stroke={ag.border}
              strokeWidth={1}
              animate={{ strokeOpacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            />
            {/* Icon */}
            <AgentIconInSVG k={ag.key} cx={ag.x} cy={ag.y} color={ag.border} />
            {/* Label */}
            <text
              x={ag.x} y={ag.y + 30}
              textAnchor="middle"
              fill="#6B6A65"
              fontSize={8}
              fontFamily="JetBrains Mono, monospace"
            >
              {ag.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Cycling status text */}
      <div style={{ marginTop: "36px", height: "20px", textAlign: "center" }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={statusIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: "12px",
              color: "#48463F",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.02em",
            }}
          >
            {STATUS_MESSAGES[statusIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

const T = {
  bg: "#08090C",
  surface: "#0F1114",
  elevated: "#161820",
  border: "rgba(255,255,255,0.07)",
  borderMid: "rgba(255,255,255,0.13)",
  text1: "#EDEBE6",
  text2: "#8A8780",
  text3: "#48463F",
  green: "#17A877",
  greenDim: "rgba(23,168,119,0.12)",
  greenBorder: "rgba(23,168,119,0.28)",
  blue: "#3B82F6",
  blueDim: "rgba(59,130,246,0.1)",
  amber: "#F59E0B",
  amberDim: "rgba(245,158,11,0.1)",
  coral: "#EF4444",
  coralDim: "rgba(239,68,68,0.08)",
  indigo: "#6366F1",
  indigoDim: "rgba(99,102,241,0.1)",
};

export default function StartPage() {
  const router = useRouter();
  const [background, setBackground] = useState("");
  const [goal, setGoal] = useState("");
  const [mode, setMode] = useState("transition");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backgroundRef = useRef<HTMLTextAreaElement>(null);
  const goalRef = useRef<HTMLTextAreaElement>(null);

  const backgroundPlaceholder =
    "I was a marketing manager at a SaaS company for 4 years. I'm skilled in Salesforce, project management, and client communication. I have a business degree from NCCU.";
  const goalPlaceholder =
    "I want to transition into product management. I'm open to starting in a related role if that's a smarter path.";

  const handleUseExampleBackground = () => {
    setBackground(backgroundPlaceholder);
    if (backgroundRef.current) {
      backgroundRef.current.value = backgroundPlaceholder;
    }
  };

  const handleUseExampleGoal = () => {
    setGoal(goalPlaceholder);
    if (goalRef.current) {
      goalRef.current.value = goalPlaceholder;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleLaunch = async () => {
    if (!background || !goal) return;
    setLoading(true);
    setError(null);
    sessionStorage.clear();
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ background, goal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      sessionStorage.setItem("agent_messages", JSON.stringify(data.agent_messages));
      sessionStorage.setItem("final_plan", JSON.stringify(data.final_plan));
    } catch (err) {
      // Network failure — demo still navigates with fallback data
      console.error("generate-plan failed:", err);
    }
    sessionStorage.setItem("sb_background", background);
    sessionStorage.setItem("sb_goal", goal);
    sessionStorage.setItem("sb_mode", mode);
    sessionStorage.setItem("user_background", background);
    sessionStorage.setItem("user_goal", goal);
    router.push("/agents");
  };

  // Show the agent network animation while the API call is in flight
  if (loading) return <AgentsLoadingAnimation />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "48px",
        }}
      >
        <Link
          href="/"
          style={{
            color: T.text2,
            textDecoration: "none",
            fontSize: "18px",
          }}
        >
          ←
        </Link>
        <span style={{ fontSize: "13px", color: T.text3 }}>Step 1 of 2</span>
      </div>

      {/* Main content */}
      <div style={{ width: "100%", maxWidth: "640px" }}>
        {/* Headline */}
        <h1
          style={{
            fontSize: "28px",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: "700",
            color: T.text1,
            marginBottom: "12px",
          }}
        >
          Start with your story
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: "15px",
            color: T.text2,
            marginBottom: "40px",
            lineHeight: "1.6",
          }}
        >
          No forms. No dropdowns. Just tell us where you are and where you want
          to go — in your own words.
        </p>

        {/* Input 1 */}
        <div style={{ marginBottom: "36px" }}>
          <label
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: T.green,
              textTransform: "uppercase",
              display: "block",
              marginBottom: "10px",
            }}
          >
            Where you are now
          </label>
          <textarea
            ref={backgroundRef}
            className="w-full"
            rows={6}
            value={background}
            onChange={(e) => { setBackground(e.target.value); setError(null); }}
            placeholder={backgroundPlaceholder}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: "6px",
              padding: "14px",
              fontSize: "16px",
              color: T.text1,
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "12px",
              alignItems: "center",
            }}
          >
            <button
              onClick={handleUseExampleBackground}
              style={{
                background: "none",
                border: "none",
                color: T.green,
                fontSize: "14px",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Use example →
            </button>
            <label
              style={{
                background: "none",
                border: `1px solid ${T.border}`,
                color: T.text2,
                fontSize: "14px",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Upload resume
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </label>
            {resumeFile && (
              <span style={{ fontSize: "12px", color: T.text3 }}>
                {resumeFile.name}
              </span>
            )}
          </div>
        </div>

        {/* Input 2 */}
        <div style={{ marginBottom: "40px" }}>
          <label
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: T.green,
              textTransform: "uppercase",
              display: "block",
              marginBottom: "10px",
            }}
          >
            Where you want to go
          </label>
          <textarea
            ref={goalRef}
            className="w-full"
            rows={3}
            value={goal}
            onChange={(e) => { setGoal(e.target.value); setError(null); }}
            placeholder={goalPlaceholder}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: "6px",
              padding: "14px",
              fontSize: "16px",
              color: T.text1,
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <div style={{ marginTop: "12px" }}>
            <button
              onClick={handleUseExampleGoal}
              style={{
                background: "none",
                border: "none",
                color: T.green,
                fontSize: "14px",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Use example →
            </button>
          </div>
        </div>

        {/* Mode chips */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "40px",
            flexWrap: "wrap",
          }}
        >
          {[
            { id: "transition", label: "Career transition", icon: "→" },
            { id: "levelup", label: "Level up in my role", icon: "↑" },
            { id: "graduate", label: "New graduate", icon: "◆" },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setMode(chip.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "6px",
                border: `1px solid ${
                  mode === chip.id ? T.greenBorder : T.border
                }`,
                background: mode === chip.id ? T.greenDim : T.surface,
                color: mode === chip.id ? T.green : T.text2,
                fontSize: "14px",
                fontWeight: mode === chip.id ? "600" : "400",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {chip.label}
              <span>{chip.icon}</span>
            </button>
          ))}
        </div>

        {/* Validation / API error */}
        {error && (
          <p style={{ color: "#EF4444", fontSize: "14px", marginBottom: "12px" }}>
            {error}
          </p>
        )}

        {/* Launch button */}
        <motion.button
          onClick={handleLaunch}
          disabled={loading}
          whileHover={loading ? {} : { scale: 1.02 }}
          whileTap={loading ? {} : { scale: 0.98 }}
          style={{
            width: "100%",
            padding: "14px 20px",
            background: T.green,
            color: T.bg,
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.75 : 1,
            marginBottom: "48px",
          }}
        >
          Launch agents →
        </motion.button>

        {/* Privacy notice */}
        <p
          style={{
            fontSize: "12px",
            color: T.text3,
            textAlign: "center",
            lineHeight: "1.5",
          }}
        >
          Your data stays in this session. Powered by IBM Granite with
          responsible AI practices.
        </p>
      </div>
    </div>
  );
}
