"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const AGENTS = {
  skill_analyst: { label: "Skill Analyst", color: "#17A877", initial: "S" },
  market_scout: { label: "Market Scout", color: "#3B82F6", initial: "M" },
  learning_planner: { label: "Learning Planner", color: "#F59E0B", initial: "L" },
  career_strategist: { label: "Career Strategist", color: "#EF4444", initial: "C" },
};

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
      <circle
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke={T.border}
        strokeWidth="2"
      />
      <motion.circle
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke={T.green}
        strokeWidth="2"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - confidence) }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <text
        x="16"
        y="18"
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill={T.text1}
        fontFamily="JetBrains Mono, monospace"
        style={{ pointerEvents: "none" }}
      >
        {Math.round(confidence * 100)}%
      </text>
    </motion.svg>
  );
}

export default function AgentsPage() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [done, setDone] = useState(false);
  const [userGoal, setUserGoal] = useState("");
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const goal = sessionStorage.getItem("sb_goal") || "Your career transition goal";
    setUserGoal(goal);
  }, []);

  useEffect(() => {
    if (visibleCount >= MESSAGES.length) {
      const timer = setTimeout(() => {
        setDone(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setVisibleCount(visibleCount + 1);
      if (visibleCount + 1 < MESSAGES.length) {
        setCurrentRound(MESSAGES[visibleCount + 1].round);
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [visibleCount]);

  const getAgentStatus = (agentKey: keyof typeof AGENTS): "posted" | "thinking" | "pending" => {
    const agentMessages = MESSAGES.filter((m) => m.agent === agentKey);
    const lastAgentMessageId = agentMessages[agentMessages.length - 1]?.id || 0;

    if (!agentMessages.some((m) => m.id <= visibleCount)) {
      return "pending";
    }
    if (lastAgentMessageId <= visibleCount) {
      return "posted";
    }
    return "thinking";
  };

  const statusDotColor = (status: "posted" | "thinking" | "pending") => {
    if (status === "posted") return T.green;
    if (status === "thinking") return T.amber;
    return T.text3;
  };

  const getTypeBadge = (type: string, challenges?: keyof typeof AGENTS | null) => {
    const baseStyle = {
      fontSize: "11px",
      fontWeight: "600",
      padding: "4px 8px",
      borderRadius: "3px",
      display: "inline-block",
    };

    if (type === "proposes") {
      return (
        <span style={{ ...baseStyle, background: T.surface, border: `1px solid ${T.border}`, color: T.text2 }}>
          Proposes
        </span>
      );
    }
    if (type === "challenges") {
      return (
        <span style={{ ...baseStyle, background: T.coralDim, border: `1px solid ${T.coral}`, color: T.coral }}>
          Challenges → {challenges ? AGENTS[challenges as keyof typeof AGENTS]?.label : ""}
        </span>
      );
    }
    if (type === "builds") {
      return (
        <span style={{ ...baseStyle, background: T.blueDim, border: `1px solid ${T.blue}`, color: T.blue }}>
          Builds on
        </span>
      );
    }
    if (type === "consensus") {
      return (
        <span style={{ ...baseStyle, background: T.greenDim, border: `1px solid ${T.greenBorder}`, color: T.green }}>
          ✓ Consensus
        </span>
      );
    }
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
        <div>
          <div style={{ fontSize: "11px", textTransform: "uppercase", color: T.text3, marginBottom: "8px" }}>
            Your session
          </div>
          <div style={{ fontSize: "13px", color: T.text2, lineHeight: "1.4", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {userGoal}
          </div>
        </div>

        <div style={{ height: "1px", background: T.border }} />

        <div>
          <div style={{ fontSize: "11px", textTransform: "uppercase", color: T.text3, marginBottom: "12px" }}>
            Agent status
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {Object.entries(AGENTS).map(([key, agent]) => {
              const status = getAgentStatus(key as keyof typeof AGENTS);
              const isThinking = status === "thinking";
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <motion.div
                    animate={isThinking ? { opacity: [1, 0.4, 1] } : {}}
                    transition={{ duration: 1.5, repeat: isThinking ? Infinity : 0 }}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: statusDotColor(status),
                    }}
                  />
                  <span style={{ fontSize: "13px", color: T.text2 }}>{agent.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: "1px", background: T.border }} />

        <div>
          <div style={{ fontSize: "11px", textTransform: "uppercase", color: T.text3, marginBottom: "12px" }}>
            Rounds
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {["1 · Propose", "2 · Challenge", "3 · Consensus"].map((round, idx) => {
              const roundNum = idx + 1;
              const isActive = currentRound === roundNum;
              const isCompleted = currentRound > roundNum;
              return (
                <div
                  key={roundNum}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "4px",
                    background: isActive ? T.greenDim : isCompleted ? T.surface : T.surface,
                    border: `1px solid ${isActive ? T.greenBorder : T.border}`,
                    fontSize: "12px",
                    color: isActive ? T.green : isCompleted ? T.text3 : T.text2,
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {round}
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
            position: "sticky",
            top: 0,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            padding: "16px 28px",
            height: "56px",
            zIndex: 10,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <motion.div
              animate={done ? { background: T.green } : { background: T.amber, opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: done ? 0 : Infinity }}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
              }}
            />
            <span style={{ color: T.text1, fontSize: "14px", fontWeight: "500" }}>
              {done ? "Consensus reached" : "Agents are collaborating"}
            </span>
          </div>
          {done && (
            <Link href="/plan">
              <button
                style={{
                  padding: "8px 16px",
                  background: T.green,
                  color: T.bg,
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                View your plan →
              </button>
            </Link>
          )}
        </div>

        {/* FEED AREA */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <AnimatePresence mode="wait">
            {MESSAGES.slice(0, visibleCount).map((message, idx) => {
              const agent = AGENTS[message.agent];
              const showRoundDivider = idx === 0 || MESSAGES[idx - 1]?.round !== message.round;

              return (
                <div key={message.id}>
                  {showRoundDivider && idx > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "20px",
                        marginTop: "20px",
                      }}
                    >
                      <div style={{ flex: 1, height: "1px", background: T.border }} />
                      <span style={{ fontSize: "11px", color: T.text3, fontWeight: "600", textTransform: "uppercase" }}>
                        Round {message.round}
                        {message.round === 1 && " — Propose"}
                        {message.round === 2 && " — Challenge"}
                        {message.round === 3 && " — Consensus"}
                      </span>
                      <div style={{ flex: 1, height: "1px", background: T.border }} />
                    </div>
                  )}

                  <motion.div
                    initial={{ x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    style={{
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      borderLeft: `3px solid ${agent.color}`,
                      borderRadius: "8px",
                      padding: "18px 20px",
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: agent.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: T.bg,
                        }}
                      >
                        {agent.initial}
                      </div>
                      <span style={{ color: agent.color, fontWeight: "600", fontSize: "13px" }}>
                        {agent.label}
                      </span>
                      {getTypeBadge(message.type, message.challenges)}
                      <div style={{ flex: 1 }} />
                      <ConfidenceCircle confidence={message.confidence} />
                    </div>

                    {/* Message body */}
                    <div
                      style={{
                        fontSize: "14px",
                        color: T.text2,
                        lineHeight: "1.75",
                      }}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>

          {done && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                marginTop: "20px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "16px", color: T.green, fontWeight: "600", marginBottom: "12px" }}>
                Your career plan is ready
              </p>
              <Link href="/plan">
                <button
                  style={{
                    padding: "10px 20px",
                    background: T.green,
                    color: T.bg,
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
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
