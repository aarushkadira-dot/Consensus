"use client";

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
  challenges: keyof typeof AGENTS | null;
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

function getTypeBadge(type: string, challenges?: keyof typeof AGENTS | null) {
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
}

export default function ReasoningPage() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "60px 32px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* Back link */}
        <Link href="/plan">
          <span style={{ color: T.text2, textDecoration: "none", fontSize: "14px", cursor: "pointer" }}>
            ← Back to plan
          </span>
        </Link>

        {/* Title */}
        <h1
          style={{
            fontSize: "36px",
            fontFamily: "Instrument Serif, serif",
            fontWeight: "400",
            color: T.text1,
            marginTop: "20px",
            marginBottom: "12px",
          }}
        >
          How your agents decided
        </h1>

        {/* Subtext */}
        <p style={{ fontSize: "15px", color: T.text2, marginBottom: "24px", lineHeight: "1.6" }}>
          Full transparency into every proposal, challenge, and resolution that shaped your career plan.
        </p>

        <div style={{ height: "1px", background: T.border, marginBottom: "32px" }} />

        {/* Messages */}
        <div>
          {MESSAGES.map((message, idx) => {
            const agent = AGENTS[message.agent];
            const showRoundLabel = idx === 0 || MESSAGES[idx - 1]?.round !== message.round;

            return (
              <div key={message.id}>
                {showRoundLabel && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: T.text3,
                      fontWeight: "600",
                      textTransform: "uppercase",
                      marginTop: idx === 0 ? 0 : "24px",
                      marginBottom: "12px",
                    }}
                  >
                    Round {message.round}
                    {message.round === 1 && " — Propose"}
                    {message.round === 2 && " — Challenge"}
                    {message.round === 3 && " — Consensus"}
                  </div>
                )}

                <div
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: "8px",
                    padding: "20px 24px",
                    marginBottom: "12px",
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
                  </div>

                  {/* Message text */}
                  <p style={{ fontSize: "14px", color: T.text2, lineHeight: "1.78", margin: 0, marginBottom: "12px" }}>
                    {message.text}
                  </p>

                  {/* Impact notes */}
                  {message.type === "challenges" && (
                    <div
                      style={{
                        background: T.greenDim,
                        border: `1px solid ${T.greenBorder}`,
                        borderRadius: "4px",
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: T.green,
                        marginTop: "12px",
                      }}
                    >
                      <span style={{ fontWeight: "600" }}>Impact:</span> This challenge shifted the plan from PM-first to
                      BA-first, reducing upskill time by 39%.
                    </div>
                  )}

                  {message.type === "consensus" && (
                    <div
                      style={{
                        background: T.greenDim,
                        border: `1px solid ${T.greenBorder}`,
                        borderRadius: "4px",
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: T.green,
                        marginTop: "12px",
                      }}
                    >
                      All four agents aligned on this recommendation.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: `1px solid ${T.border}`,
            fontSize: "14px",
            color: T.text2,
            lineHeight: "1.8",
            textAlign: "center",
          }}
        >
          This is what responsible AI looks like. No black boxes. Every recommendation is traceable to a specific agent's
          reasoning.
        </div>
      </div>
    </div>
  );
}
