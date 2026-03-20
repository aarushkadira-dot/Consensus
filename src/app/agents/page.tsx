"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const T = {
  bg: "#08090C",
  surface: "#0F1114",
  elevated: "#141416",
  border: "rgba(255,255,255,0.07)",
  borderMid: "rgba(255,255,255,0.13)",
  text1: "#EDEBE6",
  text2: "#8A8780",
  text3: "#48463F",
  agentName: "#6B6A65",
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
  lineDim: "#2A2A2E",
  lineActive: "#3A3A3E",
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const AGENTS = {
  skill_analyst: {
    label: "Skill Analyst",
    border: "#134E4A",
    glow: "rgba(45,212,160,0.12)",
    initial: "S",
  },
  market_scout: {
    label: "Market Scout",
    border: "#64748B",
    glow: "rgba(71,85,105,0.22)",
    initial: "M",
  },
  learning_planner: {
    label: "Learning Planner",
    border: "#78716C",
    glow: "rgba(120,113,108,0.22)",
    initial: "L",
  },
  career_strategist: {
    label: "Career Strategist",
    border: "#6B7280",
    glow: "rgba(107,114,128,0.22)",
    initial: "C",
  },
};

// SVG icon paths rendered as SVG elements, centered at (cx, cy)
function AgentIconInSVG({
  agentKey,
  cx,
  cy,
  color,
}: {
  agentKey: string;
  cx: number;
  cy: number;
  color: string;
}) {
  if (agentKey === "skill_analyst") {
    return (
      <g>
        <circle cx={cx - 1.5} cy={cy - 2} r={4.5} stroke={color} strokeWidth={1.2} fill="none" />
        <line
          x1={cx + 1.8} y1={cy + 1.5}
          x2={cx + 5.5} y2={cy + 5.5}
          stroke={color} strokeWidth={1.5} strokeLinecap="round"
        />
      </g>
    );
  }
  if (agentKey === "market_scout") {
    return (
      <g>
        <rect x={cx - 5.5} y={cy + 0.5} width={2.5} height={4.5} rx={0.3} fill={color} />
        <rect x={cx - 1.5} y={cy - 2.5} width={2.5} height={7.5} rx={0.3} fill={color} />
        <rect x={cx + 2.5} y={cy - 5.5} width={2.5} height={10.5} rx={0.3} fill={color} />
      </g>
    );
  }
  if (agentKey === "learning_planner") {
    return (
      <g>
        <path
          d={`M ${cx} ${cy - 5} C ${cx} ${cy - 5} ${cx - 5.5} ${cy - 6} ${cx - 5.5} ${cy + 3} C ${cx - 5.5} ${cy + 3} ${cx} ${cy + 2} ${cx} ${cy + 5}`}
          stroke={color} strokeWidth={1.2} fill="none"
        />
        <path
          d={`M ${cx} ${cy - 5} C ${cx} ${cy - 5} ${cx + 5.5} ${cy - 6} ${cx + 5.5} ${cy + 3} C ${cx + 5.5} ${cy + 3} ${cx} ${cy + 2} ${cx} ${cy + 5}`}
          stroke={color} strokeWidth={1.2} fill="none"
        />
        <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke={color} strokeWidth={0.8} strokeOpacity={0.6} />
      </g>
    );
  }
  if (agentKey === "career_strategist") {
    return (
      <g>
        <rect x={cx - 5} y={cy - 6} width={10} height={12} rx={1} stroke={color} strokeWidth={1.2} fill="none" />
        <line x1={cx - 3} y1={cy - 2} x2={cx + 3} y2={cy - 2} stroke={color} strokeWidth={1} strokeLinecap="round" />
        <line x1={cx - 3} y1={cy + 1} x2={cx + 3} y2={cy + 1} stroke={color} strokeWidth={1} strokeLinecap="round" />
        <line x1={cx - 3} y1={cy + 4} x2={cx + 1} y2={cy + 4} stroke={color} strokeWidth={1} strokeLinecap="round" />
      </g>
    );
  }
  return null;
}

// Small circular avatar for message cards
function AgentAvatar({ agentKey }: { agentKey: string }) {
  const agent = AGENTS[agentKey as keyof typeof AGENTS] || AGENTS.skill_analyst;
  const S = 28;
  const cx = S / 2;
  const cy = S / 2;
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} fill="none" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={12} fill={T.elevated} stroke={agent.border} strokeWidth={0.8} />
      <AgentIconInSVG agentKey={agentKey} cx={cx} cy={cy} color={agent.border} />
    </svg>
  );
}

// Network visualization: 4 circles in 2×2 grid with dashed connecting lines
function AgentNetwork({
  statuses,
}: {
  statuses: Record<string, "posted" | "thinking" | "pending">;
}) {
  type AgentKey = keyof typeof AGENTS;

  const W = 168;
  const H = 152;
  const R = 17;

  const pos: Record<AgentKey, { x: number; y: number }> = {
    skill_analyst:    { x: 36,  y: 38  },
    market_scout:     { x: 132, y: 38  },
    learning_planner: { x: 36,  y: 108 },
    career_strategist:{ x: 132, y: 108 },
  };

  const edges: [AgentKey, AgentKey][] = [
    ["skill_analyst",    "market_scout"],
    ["skill_analyst",    "learning_planner"],
    ["market_scout",     "career_strategist"],
    ["learning_planner", "career_strategist"],
    ["skill_analyst",    "career_strategist"],
    ["market_scout",     "learning_planner"],
  ];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} overflow="visible">
      {/* Dashed connecting lines */}
      {edges.map(([a, b]) => {
        const pa = pos[a];
        const pb = pos[b];
        const isActive =
          statuses[a] !== "pending" || statuses[b] !== "pending";
        return (
          <line
            key={`${a}-${b}`}
            x1={pa.x} y1={pa.y}
            x2={pb.x} y2={pb.y}
            stroke={isActive ? T.lineActive : T.lineDim}
            strokeWidth={0.8}
            strokeDasharray="3 5"
          />
        );
      })}

      {/* Agent nodes */}
      {(Object.keys(AGENTS) as AgentKey[]).map((key) => {
        const agent = AGENTS[key];
        const p = pos[key];
        const status = statuses[key];
        const isThinking = status === "thinking";
        const isPosted = status === "posted";

        return (
          <g key={key}>
            {/* Soft glow ring behind circle when thinking */}
            {isThinking && (
              <motion.circle
                cx={p.x} cy={p.y} r={R + 8}
                fill={agent.glow}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            )}

            {/* Main circle with animated border */}
            <motion.circle
              cx={p.x} cy={p.y} r={R}
              fill={T.elevated}
              stroke={agent.border}
              strokeWidth={isThinking ? 1.2 : 0.8}
              animate={
                isThinking
                  ? { strokeOpacity: [0.4, 1, 0.4] }
                  : { strokeOpacity: isPosted ? 0.75 : 0.35 }
              }
              transition={{ duration: 2.5, repeat: isThinking ? Infinity : 0 }}
            />

            {/* Icon */}
            <AgentIconInSVG agentKey={key} cx={p.x} cy={p.y} color={agent.border} />
          </g>
        );
      })}

      {/* Labels below each circle */}
      {(Object.keys(AGENTS) as AgentKey[]).map((key) => {
        const agent = AGENTS[key];
        const p = pos[key];
        return (
          <text
            key={`lbl-${key}`}
            x={p.x} y={p.y + R + 10}
            textAnchor="middle"
            fill={T.agentName}
            fontSize={7.5}
            fontFamily="JetBrains Mono, monospace"
          >
            {agent.label}
          </text>
        );
      })}
    </svg>
  );
}

interface Message {
  id: number;
  agent: keyof typeof AGENTS;
  round: number;
  type: "proposes" | "challenges" | "builds" | "consensus";
  confidence: number;
  challenges: keyof typeof AGENTS | null | undefined;
  text: string;
}

const MESSAGES: Message[] = [
  {
    id: 1,
    agent: "skill_analyst",
    round: 1,
    type: "proposes",
    confidence: 0.91,
    challenges: null,
    text: "Identified 18 transferable skills from your background. Strong areas: project coordination (90%), client communication (88%), budget management (82%), Salesforce CRM (78%). Critical gaps for your target direction: data analytics, SQL, product metrics. Your client-facing experience is a significant asset that most career-changers in this space undervalue.",
  },
  {
    id: 2,
    agent: "market_scout",
    round: 1,
    type: "proposes",
    confidence: 0.84,
    challenges: null,
    text: "Analyzed current market landscape for your profile. Three viable directions: Business Analyst (74% skill overlap, $72K–$95K), Customer Success Manager (82% overlap, $65K–$85K), Product Manager (67% overlap, $95K–$130K). PM has the highest ceiling but requires the most bridging. I recommend PM as the primary target.",
  },
  {
    id: 3,
    agent: "learning_planner",
    round: 1,
    type: "proposes",
    confidence: 0.79,
    challenges: null,
    text: "For the PM path: 4 IBM SkillsBuild courses required — Data Analysis Fundamentals (12hrs), Product Management Essentials (8hrs), Agile Methodology (6hrs), SQL for Business (10hrs). Total investment: 36 hours across 4 credentials.",
  },
  {
    id: 4,
    agent: "career_strategist",
    round: 1,
    type: "proposes",
    confidence: 0.76,
    challenges: null,
    text: "Initial resume assessment complete. Current framing is operations-heavy. For PM targeting, we need to reframe around product thinking and data-informed decisions. I can generate 4 rewritten bullets and a tailored cover letter once we align on the target role.",
  },
  {
    id: 5,
    agent: "career_strategist",
    round: 2,
    type: "challenges",
    confidence: 0.88,
    challenges: "market_scout",
    text: "I challenge the PM-first recommendation. With zero shipped product experience, this resume won't pass ATS screening at any competitive company. I propose Business Analyst as Phase 1 — the 74% overlap means a credible resume NOW, and BA experience directly feeds a PM transition in 6–12 months. This is a faster path to PM than applying directly.",
  },
  {
    id: 6,
    agent: "learning_planner",
    round: 2,
    type: "builds",
    confidence: 0.93,
    challenges: null,
    text: "Recalculated for BA-first approach. Only 2 SkillsBuild courses needed for Phase 1: Data Analysis Fundamentals (12hrs) + SQL for Business (10hrs). That's 22 hours instead of 36 — a 39% reduction. The remaining PM courses become Phase 2 after the candidate has BA experience on their resume.",
  },
  {
    id: 7,
    agent: "skill_analyst",
    round: 3,
    type: "consensus",
    confidence: 0.97,
    challenges: null,
    text: "All agents aligned. Recommended strategy: Phase 1 targets Business Analyst (74% overlap, 22 hours upskilling via SkillsBuild). Phase 2 transitions to Product Manager after 6–12 months of BA experience. This two-phase approach optimizes for both speed-to-employment and long-term salary ceiling.",
  },
];

function ConfidenceCircle({ confidence }: { confidence: number }) {
  const circumference = 2 * Math.PI * 12;
  return (
    <motion.svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle cx="16" cy="16" r="12" fill="none" stroke={T.border} strokeWidth="2" />
      <motion.circle
        cx="16" cy="16" r="12"
        fill="none"
        stroke={T.text3}
        strokeWidth="2"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - confidence) }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <text
        x="16" y="18"
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill={T.text3}
        fontFamily="JetBrains Mono, monospace"
        style={{ pointerEvents: "none" }}
      >
        {Math.round(confidence * 100)}%
      </text>
    </motion.svg>
  );
}

function mapApiMessages(apiMessages: any[]): Message[] {
  const typeMap: Record<string, Message["type"]> = {
    proposal: "proposes",
    challenge: "challenges",
    build: "builds",
    consensus: "consensus",
  };
  return apiMessages.map((m, idx) => ({
    id: idx + 1,
    agent: m.agent as keyof typeof AGENTS,
    round: m.round,
    type: (typeMap[m.type] || "proposes") as Message["type"],
    confidence: m.confidence,
    challenges: (m.challenges as keyof typeof AGENTS) || null,
    text: m.message,
  }));
}

export default function AgentsPage() {
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [visibleCount, setVisibleCount] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [done, setDone] = useState(false);
  const [userGoal, setUserGoal] = useState("");
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const goal = sessionStorage.getItem("sb_goal") || "Your career transition goal";
    setUserGoal(goal);
    const raw = sessionStorage.getItem("agent_messages");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(mapApiMessages(parsed));
          setVisibleCount(0);
        }
      } catch {
        // keep fallback MESSAGES
      }
    }
  }, []);

  useEffect(() => {
    if (visibleCount >= messages.length) {
      const timer = setTimeout(() => setDone(true), 1000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setVisibleCount(visibleCount + 1);
      if (visibleCount + 1 < messages.length) {
        setCurrentRound(messages[visibleCount + 1].round);
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, [visibleCount, messages]);

  const getAgentStatus = (agentKey: keyof typeof AGENTS): "posted" | "thinking" | "pending" => {
    const agentMessages = messages.filter((m) => m.agent === agentKey);
    const lastAgentMessageId = agentMessages[agentMessages.length - 1]?.id || 0;
    if (!agentMessages.some((m) => m.id <= visibleCount)) return "pending";
    if (lastAgentMessageId <= visibleCount) return "posted";
    return "thinking";
  };

  const agentStatuses = Object.fromEntries(
    Object.keys(AGENTS).map((k) => [k, getAgentStatus(k as keyof typeof AGENTS)])
  ) as Record<string, "posted" | "thinking" | "pending">;

  const getTypeBadge = (type: string, challenges?: keyof typeof AGENTS | null) => {
    const base = {
      fontSize: "11px",
      fontWeight: "600",
      padding: "3px 8px",
      borderRadius: "3px",
      display: "inline-block",
    };
    if (type === "proposes")
      return <span style={{ ...base, background: T.surface, border: `1px solid ${T.border}`, color: T.text3 }}>Proposes</span>;
    if (type === "challenges")
      return <span style={{ ...base, background: T.coralDim, border: `1px solid rgba(239,68,68,0.3)`, color: "#A1675C" }}>Challenges → {challenges ? AGENTS[challenges]?.label : ""}</span>;
    if (type === "builds")
      return <span style={{ ...base, background: T.blueDim, border: `1px solid rgba(59,130,246,0.2)`, color: "#5B7FA6" }}>Builds on</span>;
    if (type === "consensus")
      return <span style={{ ...base, background: T.greenDim, border: `1px solid ${T.greenBorder}`, color: T.green }}>✓ Consensus</span>;
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, overflow: "hidden" }}>
      {/* LEFT SIDEBAR */}
      <div
        style={{
          width: "240px",
          borderRight: `1px solid ${T.border}`,
          background: T.surface,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
        }}
      >
        {/* Goal */}
        <div>
          <div style={{ fontSize: "10px", textTransform: "uppercase", color: T.text3, letterSpacing: "0.08em", marginBottom: "8px" }}>
            Session
          </div>
          <div
            style={{
              fontSize: "12px",
              color: T.text3,
              lineHeight: "1.5",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {userGoal}
          </div>
        </div>

        <div style={{ height: "1px", background: T.border }} />

        {/* Agent network visualization */}
        <div>
          <div style={{ fontSize: "10px", textTransform: "uppercase", color: T.text3, letterSpacing: "0.08em", marginBottom: "14px" }}>
            Agents
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <AgentNetwork statuses={agentStatuses} />
          </div>
        </div>

        <div style={{ height: "1px", background: T.border }} />

        {/* Rounds */}
        <div>
          <div style={{ fontSize: "10px", textTransform: "uppercase", color: T.text3, letterSpacing: "0.08em", marginBottom: "12px" }}>
            Rounds
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {["1 · Propose", "2 · Challenge", "3 · Consensus"].map((label, idx) => {
              const roundNum = idx + 1;
              const isActive = currentRound === roundNum;
              const isCompleted = currentRound > roundNum;
              return (
                <div
                  key={roundNum}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "4px",
                    background: isActive ? T.greenDim : T.surface,
                    border: `1px solid ${isActive ? T.greenBorder : T.border}`,
                    fontSize: "11px",
                    fontFamily: "JetBrains Mono, monospace",
                    color: isActive ? T.green : isCompleted ? T.text3 : T.agentName,
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* TOP STATUS BAR */}
        <div
          style={{
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            padding: "16px 28px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <motion.div
              animate={
                done
                  ? { background: T.green }
                  : { background: T.text3, opacity: [1, 0.3, 1] }
              }
              transition={{ duration: 1.8, repeat: done ? 0 : Infinity }}
              style={{ width: "6px", height: "6px", borderRadius: "50%" }}
            />
            <span style={{ color: done ? T.text2 : T.text3, fontSize: "13px", fontFamily: "JetBrains Mono, monospace" }}>
              {done ? "consensus reached" : "agents collaborating..."}
            </span>
          </div>
          {done && (
            <Link href="/plan">
              <button
                style={{
                  padding: "7px 14px",
                  background: T.green,
                  color: T.bg,
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                View your plan →
              </button>
            </Link>
          )}
        </div>

        {/* FEED */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <AnimatePresence mode="wait">
            {messages.slice(0, visibleCount).map((message, idx) => {
              const agent = AGENTS[message.agent];
              const showRoundDivider = idx === 0 || messages[idx - 1]?.round !== message.round;

              return (
                <div key={message.id}>
                  {showRoundDivider && idx > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        margin: "18px 0",
                      }}
                    >
                      <div style={{ flex: 1, height: "1px", background: T.lineDim }} />
                      <span
                        style={{
                          fontSize: "10px",
                          color: T.text3,
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        Round {message.round}
                        {message.round === 1 && " — Propose"}
                        {message.round === 2 && " — Challenge"}
                        {message.round === 3 && " — Consensus"}
                      </span>
                      <div style={{ flex: 1, height: "1px", background: T.lineDim }} />
                    </div>
                  )}

                  <motion.div
                    initial={{ x: -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    style={{
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      borderLeft: `2px solid ${agent.border}`,
                      borderRadius: "6px",
                      padding: "16px 20px",
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <AgentAvatar agentKey={message.agent} />
                      <span style={{ color: T.agentName, fontWeight: "500", fontSize: "12px", fontFamily: "JetBrains Mono, monospace" }}>
                        {agent.label}
                      </span>
                      {getTypeBadge(message.type, message.challenges)}
                      <div style={{ flex: 1 }} />
                      <ConfidenceCircle confidence={message.confidence} />
                    </div>

                    {/* Body */}
                    <div style={{ fontSize: "13px", color: T.text2, lineHeight: "1.75" }}>
                      {message.text}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>

          {done && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ marginTop: "16px", textAlign: "center" }}
            >
              <p style={{ fontSize: "13px", color: T.green, fontWeight: "600", marginBottom: "12px", fontFamily: "JetBrains Mono, monospace" }}>
                // plan ready
              </p>
              <Link href="/plan">
                <button
                  style={{
                    padding: "10px 20px",
                    background: T.green,
                    color: T.bg,
                    border: "none",
                    borderRadius: "5px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  View plan →
                </button>
              </Link>
            </motion.div>
          )}

          <div ref={feedEndRef} />
        </div>
      </div>
    </div>
  );
}
