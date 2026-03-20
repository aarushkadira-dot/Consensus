"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const T = {
  bg:          "#08090C",
  surface:     "#0F1114",
  elevated:    "#161820",
  border:      "rgba(255,255,255,0.07)",
  borderMid:   "rgba(255,255,255,0.13)",
  text1:       "#EDEBE6",
  text2:       "#8A8780",
  text3:       "#48463F",
  green:       "#17A877",
  greenDim:    "rgba(23,168,119,0.12)",
  greenBorder: "rgba(23,168,119,0.28)",
  blue:        "#3B82F6",
  blueDim:     "rgba(59,130,246,0.1)",
  amber:       "#F59E0B",
  amberDim:    "rgba(245,158,11,0.1)",
  coral:       "#EF4444",
  coralDim:    "rgba(239,68,68,0.08)",
  indigo:      "#6366F1",
  indigoDim:   "rgba(99,102,241,0.1)",
};

function FadeUp({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ text, color = T.green }: { text: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ height: 1, width: 28, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color, textTransform: "uppercase" }}>{text}</span>
    </div>
  );
}

const PARTICLES = Array.from({ length: 38 }, (_, i) => ({
  x: (i * 13.7 + 7) % 100,
  y: (i * 17.3 + 11) % 100,
  size: (i % 3) + 1,
  dur: 4 + (i % 5),
  delay: (i * 0.4) % 8,
}));

// ── Pipeline diagram helpers ───────────────────────────────────────────────

function PipeArrow() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2px 0" }}>
      <div style={{ width: 1, height: 14, background: "#2E2F33" }} />
      <div style={{ width: 0, height: 0, borderLeft: "3px solid transparent", borderRight: "3px solid transparent", borderTop: "5px solid #2E2F33" }} />
    </div>
  );
}

function PipeArrowLabeled({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1px 0" }}>
      <div style={{ width: 1, height: 8, background: "#2E2F33" }} />
      <div style={{ fontSize: 8, color: T.text3, fontFamily: "JetBrains Mono, monospace", margin: "2px 0", textAlign: "center" }}>{label}</div>
      <div style={{ width: 1, height: 8, background: "#2E2F33" }} />
      <div style={{ width: 0, height: 0, borderLeft: "3px solid transparent", borderRight: "3px solid transparent", borderTop: "5px solid #2E2F33" }} />
    </div>
  );
}

function PipeStepLabel({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "8px 0 6px" }}>
      <div style={{ flex: 1, borderTop: "1px dashed #2A2A2E" }} />
      <div style={{ fontSize: 8, color: "#3A3A3E", fontFamily: "JetBrains Mono, monospace", border: "1px solid #2A2A2E", borderRadius: 3, padding: "1px 5px" }}>{label}</div>
      <div style={{ flex: 1, borderTop: "1px dashed #2A2A2E" }} />
    </div>
  );
}

function PipeAgentBox({ label, sub, bg, border, color }: { label: string; sub: string; bg: string; border: string; color: string }) {
  return (
    <div style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: 6, padding: "8px 6px", textAlign: "center" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color }}>{label}</div>
      <div style={{ fontSize: 8, color, opacity: 0.6, fontFamily: "JetBrains Mono, monospace", marginTop: 1, lineHeight: 1.3 }}>{sub}</div>
    </div>
  );
}

function PipelineDiagram() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

      {/* User Input */}
      <div style={{ width: "100%", background: "#1C1D20", border: "1px solid #2E2F33", borderRadius: 6, padding: "9px 12px", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text1 }}>User input</div>
        <div style={{ fontSize: 9, color: T.text3, fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>"Background" + "Goal"</div>
      </div>

      <PipeArrow />

      {/* Goal Interpreter */}
      <div style={{ width: "100%", background: "#1E1D40", border: "1px solid #3B38A0", borderRadius: 6, padding: "9px 12px", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#C5C2F8" }}>Goal Interpreter</div>
        <div style={{ fontSize: 9, color: "#7C79C4", fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>Classifies intent · structures context</div>
      </div>

      <PipeArrowLabeled label="Broadcasts to all agents" />

      {/* Collaboration zone */}
      <div style={{ width: "100%", border: "1px dashed #2A2A2E", borderRadius: 8, padding: "12px 12px 14px", position: "relative" }}>
        <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", background: T.bg, padding: "0 6px", fontSize: 8, color: T.text3, fontFamily: "JetBrains Mono, monospace", whiteSpace: "nowrap" }}>
          propose / challenge / build
        </div>

        <PipeStepLabel label="step 2 — parallel" />
        <div style={{ display: "flex", gap: 6 }}>
          <PipeAgentBox label="Skill Analyst"  sub="Maps skills · scores gaps" bg="#0D1E1C" border="#2DD4A0" color="#2DD4A0" />
          <PipeAgentBox label="Market Scout"   sub="Target roles · salaries"   bg="#141820" border="#60A5FA" color="#60A5FA" />
        </div>

        <PipeStepLabel label="step 3 — parallel" />
        <div style={{ display: "flex", gap: 6 }}>
          <PipeAgentBox label="Learning Planner"  sub="Sequences courses"      bg="#1A1714" border="#FBBF24" color="#FBBF24" />
          <PipeAgentBox label="Career Strategist" sub="Resume · cover letter"  bg="#161618" border="#C084FC" color="#C084FC" />
        </div>

        <div style={{ display: "flex", justifyContent: "center", margin: "6px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 1, height: 10, background: "#2A2A2E" }} />
            <div style={{ width: 0, height: 0, borderLeft: "3px solid transparent", borderRight: "3px solid transparent", borderTop: "5px solid #2A2A2E" }} />
          </div>
        </div>

        {/* Consensus checkpoint */}
        <div style={{ position: "relative" }}>
          <div style={{ background: "#1E1D40", border: "1px solid #3B38A0", borderRadius: 16, padding: "8px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#C5C2F8" }}>Consensus checkpoint</div>
            <div style={{ fontSize: 8, color: "#7C79C4", fontFamily: "JetBrains Mono, monospace", marginTop: 1 }}>Agents vote · fallback flag</div>
          </div>
          <div style={{ position: "absolute", right: -80, top: "50%", transform: "translateY(-50%)", fontSize: 8, color: T.text3, fontFamily: "JetBrains Mono, monospace", display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>
            <div style={{ width: 20, borderTop: "1px dashed #2A2A2E" }} />
            Dispute
          </div>
        </div>
      </div>

      <PipeArrowLabeled label="Consensus reached" />

      {/* Plan Assembler */}
      <div style={{ width: "100%", background: "#1C1D20", border: "1px solid #2E2F33", borderRadius: 6, padding: "9px 12px", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text1 }}>Plan Assembler</div>
        <div style={{ fontSize: 9, color: T.text3, fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>Merges outputs → final_plan JSON</div>
      </div>

      <PipeArrow />

      {/* Consensus Dashboard */}
      <div style={{ width: "100%", background: "rgba(23,168,119,0.08)", border: "1px solid rgba(23,168,119,0.28)", borderRadius: 6, padding: "9px 12px", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.green }}>Consensus Dashboard</div>
        <div style={{ fontSize: 9, color: "rgba(23,168,119,0.5)", fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>Skills · Roles · Action Plan · Jobs</div>
      </div>

      {/* Badge */}
      <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5, background: "#1C1D20", border: "1px solid #2E2F33", borderRadius: 5, padding: "3px 8px", fontSize: 8, fontFamily: "JetBrains Mono, monospace", color: T.text3 }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.green, flexShrink: 0 }} />
        IBM watsonx Granite
      </div>
    </div>
  );
}

// ── End pipeline ───────────────────────────────────────────────────────────

export default function Landing() {
  const agentsRef = useRef<HTMLDivElement>(null);
  const scrollToAgents = () => agentsRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>

      {/* STICKY NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(8,9,12,0.82)", backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 56,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: T.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "-0.04em" }}>C</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: T.text1 }}>Consensus</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <button onClick={scrollToAgents} style={{ background: "none", border: "none", fontSize: 14, color: T.text2, cursor: "pointer", padding: 0 }}
            onMouseOver={e => (e.currentTarget.style.color = T.text1)}
            onMouseOut={e  => (e.currentTarget.style.color = T.text2)}>
            How it works
          </button>
          <Link href="/start" style={{
            padding: "7px 18px", borderRadius: 6, background: T.green,
            color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none",
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Spline full-screen bg */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <SplineScene scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="w-full h-full" />
        </div>
        {/* Overlays */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to right, rgba(8,9,12,0.96) 0%, rgba(8,9,12,0.7) 50%, rgba(8,9,12,0.2) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(8,9,12,0.25) 0%, transparent 25%, transparent 70%, rgba(8,9,12,0.95) 100%)" }} />
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.026) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.026) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }} />
        {/* Orbs */}
        <div className="orb-1" style={{ position: "absolute", top: "15%", left: "8%",  width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(23,168,119,0.16) 0%, transparent 70%)", zIndex: 2, pointerEvents: "none" }} />
        <div className="orb-2" style={{ position: "absolute", top: "55%", left: "22%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(23,168,119,0.10) 0%, transparent 70%)", zIndex: 2, pointerEvents: "none" }} />
        <div className="orb-3" style={{ position: "absolute", top: "35%", left: "38%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(23,168,119,0.07) 0%, transparent 70%)", zIndex: 2, pointerEvents: "none" }} />
        {/* Particles */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
          {PARTICLES.map((p, i) => (
            <div key={i} style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size, borderRadius: "50%", background: T.green,
              animation: `twinkle ${p.dur}s ${p.delay}s ease-in-out infinite`,
            }} />
          ))}
        </div>
        {/* Spotlight */}
        <div style={{ position: "absolute", inset: 0, zIndex: 3 }}>
          <Spotlight size={480} />
        </div>

        {/* CENTER CONTENT */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 720, padding: "0 32px", marginTop: 56 }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: T.greenDim, border: `1px solid ${T.greenBorder}`, marginBottom: 32 }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, animation: "twinkle 1.6s ease-in-out infinite", display: "inline-block" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.green, letterSpacing: "0.04em" }}>Powered by IBM watsonx</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.7, ease: EASE }}
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(46px, 7vw, 72px)",
              fontWeight: 400, lineHeight: 1.08,
              color: T.text1, marginBottom: 24,
            }}
          >
            Five agents.<br />One career strategy.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ fontSize: 16, lineHeight: 1.8, color: T.text2, maxWidth: 560, margin: "0 auto 40px" }}
          >
            Most career tools give you a quiz and a list. Consensus deploys four AI agents that analyze your skills, scout the market, plan your learning, and rewrite your resume — then they debate each other until they agree on the best path forward.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.5, ease: EASE }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
          >
            <Link href="/start" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 36px", borderRadius: 8,
              background: `linear-gradient(135deg, ${T.green}, #0C5E48)`,
              color: "#fff", fontSize: 16, fontWeight: 600, textDecoration: "none",
              boxShadow: "0 0 60px rgba(23,168,119,0.25)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseOver={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "scale(1.03)"; el.style.boxShadow = "0 0 80px rgba(23,168,119,0.35)"; }}
              onMouseOut={e  => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "scale(1)"; el.style.boxShadow = "0 0 60px rgba(23,168,119,0.25)"; }}
            >
              Build your plan →
            </Link>
            <button onClick={scrollToAgents} style={{ background: "none", border: "none", color: T.text2, fontSize: 14, cursor: "pointer", padding: 0 }}
              onMouseOver={e => (e.currentTarget.style.color = T.text1)}
              onMouseOut={e  => (e.currentTarget.style.color = T.text2)}>
              Watch it work ↓
            </button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: AGENTS */}
      <section ref={agentsRef} style={{ background: T.bg, padding: "96px 0", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
          <FadeUp>
            <SectionLabel text="The System" />
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, color: T.text1, marginBottom: 14, lineHeight: 1.15 }}>
              Four specialists. One strategy.
            </h2>
            <p style={{ fontSize: 16, color: T.text2, maxWidth: 520, lineHeight: 1.75, marginBottom: 52 }}>
              Each agent owns a distinct part of the problem. They propose, challenge, build on each other, and only surface a recommendation when all four align.
            </p>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 40, alignItems: "start" }}>
            {/* Agent cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {[
                {
                  label: "Skill Analyst", color: T.green, dim: T.greenDim, border: T.greenBorder,
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 10L9 12.5L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  desc: "Reads your background and extracts every transferable skill — then maps them against what hiring managers actually look for in your target roles.",
                },
                {
                  label: "Market Scout", color: T.blue, dim: T.blueDim, border: "rgba(59,130,246,0.28)",
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                  desc: "Analyzes which career directions are growing, what they pay, and where your existing skills create the highest overlap — so you know exactly where to aim.",
                },
                {
                  label: "Learning Planner", color: T.amber, dim: T.amberDim, border: "rgba(245,158,11,0.28)",
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 16V6L10 3L16 6V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 3V16M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                  desc: "Builds your shortest path to job-ready. Sequences courses to close skill gaps in the fewest hours.",
                },
                {
                  label: "Career Strategist", color: T.coral, dim: T.coralDim, border: "rgba(239,68,68,0.28)",
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 17L10 4L16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 12H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                  desc: "Rewrites your resume bullets, drafts your cover letter, and coaches you on interview answers — all tailored to the exact role you're targeting.",
                },
              ].map((a, i) => (
                <FadeUp key={i} delay={i * 0.08}>
                  <div style={{
                    background: `linear-gradient(135deg, ${a.dim} 0%, rgba(255,255,255,0.01) 100%)`,
                    border: `1px solid ${a.border}`, borderTop: `3px solid ${a.color}`,
                    borderRadius: 10, padding: "28px 28px 26px",
                    transition: "transform 0.2s, box-shadow 0.2s", cursor: "default",
                  }}
                    onMouseOver={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(-3px)"; el.style.boxShadow = `0 12px 40px ${a.dim}`; }}
                    onMouseOut={e  => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
                  >
                    <div style={{ color: a.color, marginBottom: 14 }}>{a.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: a.color, marginBottom: 10 }}>{a.label}</div>
                    <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.72 }}>{a.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>

            {/* Pipeline diagram */}
            <FadeUp delay={0.2}>
              <div style={{ position: "sticky", top: 120 }}>
                <div style={{ fontSize: 9, color: T.text3, fontFamily: "JetBrains Mono, monospace", marginBottom: 12, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Agent pipeline
                </div>
                <PipelineDiagram />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* SECTION 3: CONSENSUS */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 48px" }}>
          <FadeUp>
            <div style={{
              background: "linear-gradient(135deg, rgba(23,168,119,0.06) 0%, rgba(23,168,119,0.02) 100%)",
              border: `1px solid ${T.greenBorder}`, borderLeft: `4px solid ${T.green}`,
              borderRadius: 12, padding: "44px 48px",
              display: "flex", gap: 60, flexWrap: "wrap", alignItems: "flex-start",
            }}>
              <div style={{ flex: "1 1 320px" }}>
                <SectionLabel text="How it works" />
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 400, color: T.text1, marginBottom: 18, lineHeight: 1.2 }}>
                  The consensus model.
                </h2>
                <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.82 }}>
                  The agents don&apos;t just run in parallel — they challenge each other. Market Scout might propose a target role that Career Strategist flags as too big a jump. Learning Planner recalculates. Only when all four align does Consensus surface a recommendation. You see the full reasoning chain, not just the answer.
                </p>
              </div>
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { n: "1", label: "Propose",   sub: "Each agent presents their analysis",   glow: false },
                  { n: "2", label: "Challenge",  sub: "Agents question each other's logic",   glow: false },
                  { n: "3", label: "Build",      sub: "Agents incorporate new evidence",      glow: false },
                  { n: "4", label: "Consensus",  sub: "All four agents align on one path",    glow: true  },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: s.glow ? T.green : T.elevated,
                        border: `1px solid ${s.glow ? T.green : T.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                        color: s.glow ? "#fff" : T.text3,
                        boxShadow: s.glow ? "0 0 20px rgba(23,168,119,0.45)" : "none",
                        flexShrink: 0,
                      }}>
                        {s.glow ? "✓" : s.n}
                      </div>
                      {i < 3 && <div style={{ width: 1, height: 24, background: T.border, margin: "3px 0" }} />}
                    </div>
                    <div style={{ paddingTop: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: s.glow ? T.green : T.text1, marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: T.text3, maxWidth: 210, lineHeight: 1.5 }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SECTION 4: DELIVERABLES */}
      <section style={{ background: T.bg, padding: "96px 0", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 48px" }}>
          <FadeUp>
            <SectionLabel text="What you get" color={T.blue} />
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: T.text1, marginBottom: 52, lineHeight: 1.15 }}>
              A complete strategy,<br />not just advice.
            </h2>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 14 }}>
            {[
              { icon: "◈", color: T.green,  label: "Skill gap report",       desc: "Every strength mapped. Every gap quantified with a course to close it." },
              { icon: "◎", color: T.blue,   label: "Target role ranking",     desc: "Your top 3 directions ordered by fit, salary ceiling, and time-to-ready." },
              { icon: "◇", color: T.amber,  label: "Consensus learning pathway", desc: "A sequenced learning plan with real courses, badges, and hour estimates." },
            ].map((d, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 10, padding: "24px 26px",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                  onMouseOver={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = T.borderMid; el.style.transform = "translateY(-2px)"; }}
                  onMouseOut={e  => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = T.border; el.style.transform = "translateY(0)"; }}
                >
                  <div style={{ fontSize: 22, color: d.color, marginBottom: 14 }}>{d.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text1, marginBottom: 8 }}>{d.label}</div>
                  <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.65 }}>{d.desc}</div>
                </div>
              </FadeUp>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, maxWidth: 640, margin: "0 auto" }}>
            {[
              { icon: "▲", color: T.coral,  label: "Resume rewrite",      desc: "Your bullet points reframed with action-impact language for ATS systems." },
              { icon: "◉", color: T.indigo, label: "Transparency panel",  desc: "See exactly how the agents reasoned their way to every recommendation." },
            ].map((d, i) => (
              <FadeUp key={i} delay={0.22 + i * 0.07}>
                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 10, padding: "24px 26px",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                  onMouseOver={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = T.borderMid; el.style.transform = "translateY(-2px)"; }}
                  onMouseOut={e  => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = T.border; el.style.transform = "translateY(0)"; }}
                >
                  <div style={{ fontSize: 22, color: d.color, marginBottom: 14 }}>{d.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text1, marginBottom: 8 }}>{d.label}</div>
                  <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.65 }}>{d.desc}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CTA */}
      <section style={{ background: T.bg, padding: "100px 0" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
          <FadeUp>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: "0 0 40px rgba(23,168,119,0.3)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12L10 17L19 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4.5vw, 48px)", fontWeight: 400, color: T.text1, marginBottom: 16, lineHeight: 1.15 }}>
              Ready to find out<br />what&apos;s next?
            </h2>
            <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.8, maxWidth: 440, margin: "0 auto 40px" }}>
              Takes about 2 minutes. The agents do the rest. No account required — your data is only used for this session.
            </p>
            <Link href="/start" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "15px 40px", borderRadius: 8,
              background: `linear-gradient(135deg, ${T.green}, #0C5E48)`,
              color: "#fff", fontSize: 16, fontWeight: 600, textDecoration: "none",
              boxShadow: "0 0 60px rgba(23,168,119,0.22)",
              transition: "transform 0.15s",
            }}
              onMouseOver={e => ((e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.03)")}
              onMouseOut={e  => ((e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)")}>
              Get started free →
            </Link>
            <div style={{ marginTop: 22, fontSize: 12, color: T.text3 }}>
              Powered by IBM watsonx · Built for the NCCU IBM Hackathon
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
