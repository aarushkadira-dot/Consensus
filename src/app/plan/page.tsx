"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
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

function CountUpStat({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 1.2;
    const increment = target / (duration * 60);
    let current = start;

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [inView, target]);

  return <div ref={ref}>{count}</div>;
}

export default function PlanPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [finalPlan, setFinalPlan] = useState<any>(null);
  const [userGoal, setUserGoal] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("final_plan");
    if (raw) {
      try {
        setFinalPlan(JSON.parse(raw));
      } catch (e) {
        // keep null — hardcoded fallbacks below handle it
      }
    }
    const goal = sessionStorage.getItem("user_goal") || "";
    setUserGoal(goal);
  }, []);

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      {/* TOP BAR */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "52px",
          borderBottom: `1px solid ${T.border}`,
          background: T.bg,
          padding: "0 32px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: T.green,
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: "700",
              color: T.bg,
            }}
          >
            S
          </div>
          <span style={{ fontSize: "15px", fontWeight: "600", color: T.text1 }}>
            SkillBridge
          </span>
        </div>

        <div style={{ fontSize: "13px", color: T.text2, maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {userGoal ? (userGoal.length > 60 ? userGoal.slice(0, 60) + "…" : userGoal) : "Marketing Manager → Product Management"}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/">
            <button
              style={{
                padding: "8px 14px",
                background: "transparent",
                border: `1px solid ${T.border}`,
                color: T.text2,
                borderRadius: "4px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              New plan
            </button>
          </Link>
          <Link href="/plan/reasoning">
            <button
              style={{
                padding: "8px 14px",
                background: "transparent",
                border: `1px solid ${T.greenBorder}`,
                color: T.green,
                borderRadius: "4px",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              See reasoning →
            </button>
          </Link>
        </div>
      </div>

      {/* CONSENSUS BANNER */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 32px", marginTop: "24px" }}>
        <div
          style={{
            background: T.greenDim,
            border: `1px solid ${T.greenBorder}`,
            borderLeft: `4px solid ${T.green}`,
            borderRadius: "8px",
            padding: "18px 24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: T.green,
              marginTop: "6px",
            }}
          />
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: T.text1, marginBottom: "6px" }}>
              Agents reached consensus.
            </div>
            <div style={{ fontSize: "13px", color: T.text2, lineHeight: "1.6" }}>
              {finalPlan?.consensus_summary || "Start with Business Analyst roles (74% skill overlap, 22 hours of upskilling). After 6–12 months of BA experience, transition to Product Manager with additional credentials."}
            </div>
          </div>
        </div>
      </div>

      {/* STAT ROW */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 32px",
          marginTop: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
        }}
      >
        {[
          {
            value: finalPlan?.skills?.existing?.length ?? 18,
            label: "Skills identified",
            sub: `${finalPlan?.skills?.existing?.length ?? 7} strong · ${finalPlan?.skills?.gaps?.length ?? 5} gaps`,
          },
          {
            value: finalPlan?.roles?.directions?.[0]?.skill_overlap_pct
              ? `${finalPlan.roles.directions[0].skill_overlap_pct}%`
              : "74%",
            label: "Top role match",
            sub: finalPlan?.roles?.directions?.[0]?.role_title || "Business Analyst",
          },
          {
            value: finalPlan?.learning_path?.phase_1?.total_hours
              ? `${finalPlan.learning_path.phase_1.total_hours} hrs`
              : "22 hrs",
            label: "Upskill time",
            sub: `${finalPlan?.learning_path?.phase_1?.courses?.length ?? 2} SkillsBuild courses`,
          },
          {
            value: "+$17K",
            label: "Salary impact",
            sub: "after Phase 1 transition",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: "8px",
              padding: "16px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: T.green,
                fontFamily: "JetBrains Mono, monospace",
                marginBottom: "8px",
              }}
            >
              {typeof stat.value === "number" ? <CountUpStat target={stat.value} /> : stat.value}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: T.text1, marginBottom: "4px" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "12px", color: T.text3 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div
        style={{
          position: "sticky",
          top: "52px",
          background: T.bg,
          borderBottom: `1px solid ${T.border}`,
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          gap: "24px",
          zIndex: 10,
        }}
      >
        {["Overview", "Skills", "Target Roles", "Action Plan"].map((tab, idx) => {
          const tabId = tab.toLowerCase().replace(" ", "-");
          const isActive = activeTab === tabId;

          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              style={{
                padding: "12px 0",
                background: "none",
                border: "none",
                borderBottom: isActive ? `2px solid ${T.green}` : "none",
                color: isActive ? T.text1 : T.text2,
                fontSize: "14px",
                fontWeight: isActive ? "600" : "400",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 32px", paddingTop: "32px", paddingBottom: "32px" }}>
        {activeTab === "overview" && (
          <div style={{ paddingTop: "32px" }}>
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: T.text1, marginBottom: "14px" }}>
                How the agents decided
              </h2>
              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: "8px",
                  padding: "20px 24px",
                  fontSize: "14px",
                  lineHeight: "1.8",
                  color: T.text2,
                }}
              >
                <span style={{ color: T.blue, fontWeight: "600" }}>Market Scout</span> recommended PM as the primary target.{" "}
                <span style={{ color: T.coral, fontWeight: "600" }}>Career Strategist</span> challenged the recommendation,
                flagging that zero product experience means the resume won't pass ATS screening.
                <span style={{ color: T.amber, fontWeight: "600" }}>Learning Planner</span> recalculated and found the BA-first
                path requires 39% fewer hours. All four agents converged on the two-phase strategy.
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: T.text1, marginBottom: "14px" }}>
                Your two-phase roadmap
              </h2>
              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: "8px",
                  padding: "40px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "20px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: T.green,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  />
                  <div style={{ fontSize: "13px", fontWeight: "600", color: T.text1 }}>Business Analyst</div>
                  <div style={{ fontSize: "12px", color: T.text3, marginTop: "4px" }}>6–12 months</div>
                </div>

                <div
                  style={{
                    flex: 1,
                    height: "2px",
                    background: `linear-gradient(to right, ${T.green}, ${T.indigo})`,
                  }}
                />

                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: T.indigo,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  />
                  <div style={{ fontSize: "13px", fontWeight: "600", color: T.text1 }}>Product Manager</div>
                  <div style={{ fontSize: "12px", color: T.text3, marginTop: "4px" }}>Target: Year 2</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div style={{ paddingTop: "32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              {/* LEFT: Strengths */}
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: T.text1, marginBottom: "16px" }}>
                  Your strengths
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {(finalPlan?.skills?.existing?.map((s: any) => ({ name: s.name, pct: s.level })) || [
                    { name: "Project Coordination", pct: 90 },
                    { name: "Client Communication", pct: 88 },
                    { name: "Team Leadership", pct: 85 },
                    { name: "Budget Management", pct: 82 },
                    { name: "Salesforce CRM", pct: 78 },
                    { name: "Stakeholder Mgmt", pct: 80 },
                    { name: "Strategic Planning", pct: 70 },
                  ]).map((skill: { name: string; pct: number }) => (
                    <div key={skill.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", color: T.text1 }}>{skill.name}</span>
                        <span style={{ fontSize: "12px", color: T.text3 }}>{skill.pct}%</span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          background: T.surface,
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.pct}%` }}
                          transition={{ duration: 0.8 }}
                          style={{
                            height: "100%",
                            background: `linear-gradient(to right, ${T.green}, ${T.greenBorder})`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Gaps */}
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: T.text1, marginBottom: "16px" }}>
                  Gaps to close
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(finalPlan?.skills?.gaps?.map((g: any) => ({
                    skill: g.name,
                    course: g.course || "See IBM SkillsBuild",
                    hrs: g.hours ? `${g.hours}hrs` : "—",
                  })) || [
                    { skill: "SQL", course: "SQL for Business", hrs: "10hrs" },
                    { skill: "Data Analytics", course: "Data Analysis Fundamentals", hrs: "12hrs" },
                    { skill: "Python Basics", course: "Python for Data Science", hrs: "15hrs" },
                    { skill: "Product Metrics", course: "Product Management Essentials", hrs: "8hrs" },
                  ]).map((gap: { skill: string; course: string; hrs: string }) => (
                    <div
                      key={gap.skill}
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: "6px",
                        padding: "12px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: T.text1 }}>{gap.skill}</div>
                        <div style={{ fontSize: "12px", color: T.text3, marginTop: "2px" }}>
                          IBM SkillsBuild: {gap.course}
                        </div>
                      </div>
                      <span
                        style={{
                          background: T.amberDim,
                          border: `1px solid ${T.amber}`,
                          color: T.amber,
                          fontSize: "11px",
                          fontWeight: "600",
                          padding: "4px 8px",
                          borderRadius: "3px",
                        }}
                      >
                        {gap.hrs}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "target-roles" && (
          <div style={{ paddingTop: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
              {(finalPlan?.roles?.directions?.map((d: any, idx: number) => ({
                title: d.role_title,
                phase: idx < 2 ? "Phase 1" : "Phase 2",
                badge: idx === 0 ? "Recommended" : idx === 2 ? `After ${finalPlan?.roles?.directions?.[0]?.role_title || "Phase 1"} experience` : "",
                salary: d.typical_salary_range,
                overlap: `${d.skill_overlap_pct}% overlap`,
                gap: d.gap_skills?.length ? `${d.gap_skills.length} skill gaps` : "",
                color: idx < 2 ? T.green : T.indigo,
                body: d.why_reachable,
              })) || [
                {
                  title: "Business Analyst",
                  phase: "Phase 1",
                  badge: "Recommended",
                  salary: "$72,000–$95,000",
                  overlap: "74% overlap",
                  gap: "22 hrs gap",
                  color: T.green,
                  body: "Highest skill overlap. ATS-passable immediately. Direct stepping stone to PM.",
                },
                {
                  title: "Customer Success Manager",
                  phase: "Phase 1",
                  badge: "",
                  salary: "$65,000–$85,000",
                  overlap: "82% overlap",
                  gap: "8 hrs gap",
                  color: T.green,
                  body: "Highest overlap but lower PM trajectory. Consider only if you prefer customer focus.",
                },
                {
                  title: "Product Manager",
                  phase: "Phase 2",
                  badge: "After BA experience",
                  salary: "$95,000–$130,000",
                  overlap: "67% overlap",
                  gap: "36 hrs gap",
                  color: T.indigo,
                  body: "Highest ceiling. Requires Phase 1 credentials and 6–12 months of BA experience for credible candidacy.",
                },
              ]).map((role: any) => (
                <div
                  key={role.title}
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: "8px",
                    padding: "20px 24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div
                      style={{
                        padding: "4px 8px",
                        background: role.color === T.green ? T.greenDim : T.indigoDim,
                        border: `1px solid ${role.color === T.green ? T.greenBorder : "rgba(99,102,241,0.28)"}`,
                        color: role.color,
                        fontSize: "11px",
                        fontWeight: "600",
                        borderRadius: "3px",
                      }}
                    >
                      {role.phase}
                    </div>
                    <h3 style={{ fontSize: "15px", fontWeight: "600", color: T.text1 }}>{role.title}</h3>
                    {role.badge && (
                      <span style={{ fontSize: "11px", color: T.text3, marginLeft: "auto" }}>{role.badge}</span>
                    )}
                  </div>
                  <div style={{ fontSize: "14px", color: role.color, fontWeight: "600", marginBottom: "10px" }}>
                    {role.salary}
                  </div>
                  <div style={{ display: "flex", gap: "16px", marginBottom: "12px", fontSize: "13px" }}>
                    <div>
                      <span style={{ color: role.color, fontWeight: "600" }}>{role.overlap}</span>
                    </div>
                    <div>
                      <span style={{ color: T.amber, fontWeight: "600" }}>{role.gap}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "13px", color: T.text2, lineHeight: "1.6" }}>{role.body}</p>
                </div>
              ))}
            </div>

            {/* Salary trajectory */}
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "600", color: T.text1, marginBottom: "16px" }}>
                Salary trajectory
              </h3>
              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: "8px",
                  padding: "40px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "20px",
                }}
              >
                <div style={{ textAlign: "center", flex: "0 0 auto" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: T.text1 }}>Now</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: T.text3, marginTop: "4px" }}>
                    {finalPlan?.roles?.salary_impact?.current_estimated || "~$68K"}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    height: "3px",
                    background: `linear-gradient(to right, ${T.green}, ${T.green}, ${T.indigo})`,
                    borderRadius: "2px",
                  }}
                />

                <div style={{ textAlign: "center", flex: "0 0 auto" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: T.text1 }}>Phase 1</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: T.green, marginTop: "4px" }}>
                    {finalPlan?.roles?.salary_impact?.after_transition || "~$85K"}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    height: "3px",
                    background: `linear-gradient(to right, ${T.green}, ${T.indigo})`,
                    borderRadius: "2px",
                  }}
                />

                <div style={{ textAlign: "center", flex: "0 0 auto" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: T.text1 }}>Phase 2</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: T.indigo, marginTop: "4px" }}>
                    {finalPlan?.roles?.salary_impact?.growth_potential_5yr || "~$115K"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "action-plan" && (
          <div style={{ paddingTop: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "40px" }}>
              {[
                {
                  title: "Foundation",
                  color: T.green,
                  items: [
                    "Complete 2 IBM SkillsBuild courses: Data Analysis Fundamentals (12hrs) + SQL for Business (10hrs)",
                    "Build a 3-project portfolio: 1 Excel dashboard, 1 SQL analysis, 1 business case study",
                    "Rewrite resume to highlight: analytical thinking, data-informed decisions, cross-functional collaboration",
                    "Target Business Analyst roles at companies 100–5K employees; apply to 3–5 roles/week",
                  ],
                },
                {
                  title: "Apply",
                  color: T.blue,
                  items: [
                    "Land first Business Analyst role (target: 3–6 months)",
                    "In role: ship 2–3 measurable projects, own a product metric, lead 1 cross-functional initiative",
                    "Build relationships with Product team; shadow PM on decisions",
                    "After 6–9 months BA experience: complete remaining PM SkillsBuild courses",
                  ],
                },
                {
                  title: "Level up",
                  color: T.indigo,
                  items: [
                    "Reframe BA accomplishments as PM wins (e.g., 'delivered user research informing $2M feature roadmap')",
                    "Pursue 1 PM interview loop at a well-known company; expect 2–3 rejections before first offer",
                    "Once in PM role: own a small product area; ship 1 major feature; mentor 1 junior PM",
                    "Target: Product Manager role by Year 2 at $100K+ total comp",
                  ],
                },
              ].map((phase) => (
                <div
                  key={phase.title}
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderLeft: `4px solid ${phase.color}`,
                    borderRadius: "8px",
                    padding: "20px 24px",
                  }}
                >
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: phase.color, marginBottom: "12px" }}>
                    {phase.title}
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {phase.items.map((item, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: "13px",
                          color: T.text2,
                          lineHeight: "1.6",
                          marginBottom: idx < phase.items.length - 1 ? "10px" : 0,
                          paddingLeft: "20px",
                          position: "relative",
                        }}
                      >
                        <span style={{ position: "absolute", left: 0 }}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Resume rewrites from application_kit */}
            {finalPlan?.application_kit?.resume_rewrites && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "600", color: T.text1, marginBottom: "14px" }}>
                  Resume rewrites
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {finalPlan.application_kit.resume_rewrites.map((rw: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: "8px",
                        padding: "16px 20px",
                      }}
                    >
                      <div style={{ fontSize: "12px", color: T.text3, marginBottom: "6px", textTransform: "uppercase", fontWeight: "600" }}>
                        Before
                      </div>
                      <div style={{ fontSize: "13px", color: T.text2, marginBottom: "12px", fontStyle: "italic" }}>
                        {rw.original}
                      </div>
                      <div style={{ fontSize: "12px", color: T.green, marginBottom: "6px", textTransform: "uppercase", fontWeight: "600" }}>
                        After
                      </div>
                      <div style={{ fontSize: "13px", color: T.text1, lineHeight: "1.6" }}>
                        {rw.rewritten}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cover letter from application_kit */}
            {finalPlan?.application_kit?.cover_letter && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "600", color: T.text1, marginBottom: "14px" }}>
                  Cover letter draft
                </h3>
                <div
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderLeft: `4px solid ${T.blue}`,
                    borderRadius: "8px",
                    padding: "20px 24px",
                    fontSize: "13px",
                    color: T.text2,
                    lineHeight: "1.9",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {finalPlan.application_kit.cover_letter}
                </div>
              </div>
            )}

            <button
              onClick={() => window.print()}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: T.green,
                color: T.bg,
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Download plan as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
