// app/api/generate-plan/route.ts
// ============================================================
// REAL WATSONX GRANITE AGENTS
// All 4 agents + goal interpreter call IBM Granite.
// If any agent fails, it falls back to mock data so the
// demo never breaks.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import skillsbuildCatalog from "@/data/skillsbuild-catalog.json";

// --- Config ---
const WATSONX_API_KEY = process.env.WATSONX_API_KEY || "";
const WATSONX_PROJECT_ID = process.env.WATSONX_PROJECT_ID || "";
const WATSONX_URL = process.env.WATSONX_URL || "https://us-south.ml.cloud.ibm.com";
const MODEL_ID = "ibm/granite-3-8b-instruct";

const ANTI_HALLUCINATION = "IMPORTANT: Only use information explicitly stated in the provided data. Do not invent, assume, or hallucinate any skills, experience, companies, or qualifications not present in the input.";

// ============================================================
// WATSONX API HELPER
// ============================================================

let cachedToken: { token: string; expiry: number } | null = null;

async function getIAMToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiry) {
    return cachedToken.token;
  }

  const res = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${WATSONX_API_KEY}`,
  });

  if (!res.ok) {
    throw new Error(`IAM token request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiry: Date.now() + 3500 * 1000,
  };
  return data.access_token;
}

async function callGranite(prompt: string): Promise<string> {
  const token = await getIAMToken();

  const res = await fetch(
    `${WATSONX_URL}/ml/v1/text/generation?version=2024-05-31`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: prompt,
        model_id: MODEL_ID,
        project_id: WATSONX_PROJECT_ID,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.3,
          top_p: 0.9,
          repetition_penalty: 1.05,
          stop_sequences: ["\n\n\n"],
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Granite API failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.results?.[0]?.generated_text || "";
}

function parseJSON(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  const start = Math.min(
    firstBrace >= 0 ? firstBrace : Infinity,
    firstBracket >= 0 ? firstBracket : Infinity
  );
  if (start === Infinity) throw new Error("No JSON found in response");
  cleaned = cleaned.slice(start);
  let lastClose = cleaned.length;
  while (lastClose > 0) {
    try {
      return JSON.parse(cleaned.slice(0, lastClose));
    } catch {
      const prevBrace = cleaned.lastIndexOf("}", lastClose - 1);
      const prevBracket = cleaned.lastIndexOf("]", lastClose - 1);
      lastClose = Math.max(prevBrace, prevBracket);
      if (lastClose <= 0) break;
      lastClose += 1;
    }
  }
  return JSON.parse(cleaned);
}

// ============================================================
// AGENT PROMPTS
// ============================================================

function goalInterpreterPrompt(background: string, goal: string): string {
  return `${ANTI_HALLUCINATION}

You are a career intent classifier. Given a user's background and goal, extract structured information. Respond ONLY in valid JSON with no other text, no markdown, no explanation.

User background: ${background}
User goal: ${goal}

Return JSON with these exact fields:
{
  "mode": "transition" or "level_up" or "new_graduate",
  "current_role": "their most recent job title or student",
  "current_skills_mentioned": ["array", "of", "skills"],
  "target_direction": "what they want to become",
  "urgency": "high" or "medium" or "low",
  "experience_years": number,
  "education": "their education or null"
}`;
}

function skillAnalystPrompt(background: string, goalContext: string): string {
  return `${ANTI_HALLUCINATION}

You are a career skill analyst. Given a user's background and career goal, analyze their skills thoroughly. Respond ONLY in valid JSON with no other text.

User context: ${goalContext}
User background: ${background}

Return JSON with these exact fields:
{
  "existing_skills": [
    { "name": "Skill Name", "level": 85, "category": "soft" or "technical" or "domain" }
  ],
  "detected_gaps": [
    { "name": "Skill Name", "importance": "critical" or "high" or "nice_to_have", "category": "technical" }
  ],
  "transferable_strengths": [
    "One sentence explaining how an existing skill transfers to their target role"
  ],
  "confidence": 0.89
}

Include 5-8 existing skills with realistic proficiency levels (0-100). Don't inflate — if someone mentions a tool casually, rate it 40-60. Include 3-5 gaps. Include 2-3 transferable strength sentences.`;
}

function marketScoutPrompt(goalContext: string, skillsData: string): string {
  return `${ANTI_HALLUCINATION}

You are a career market intelligence advisor. Given a user's skills and career goal, analyze the landscape and recommend role DIRECTIONS they should target. You are a strategist, not a job board — do not list specific job postings. Respond ONLY in valid JSON with no other text.

User context: ${goalContext}
Their skills: ${skillsData}

For each recommended role direction, assess the user's readiness level. If skill_overlap_pct is 85% or higher, mark it as "ready" and note: "You are already well-qualified for this role. Here are optional skills to increase your chances." If skill_overlap_pct is between 50-84%, mark as "upskill_needed" with specific gaps. If below 50%, mark as "significant_gap" and be honest: "This role requires substantial skill development. Here is a realistic multi-phase path." Always be honest about the gap size.

Return JSON with these exact fields:
{
  "recommended_directions": [
    {
      "role_title": "Business Analyst",
      "skill_overlap_pct": 74,
      "readiness": "ready" or "upskill_needed" or "significant_gap",
      "typical_salary_range": "$72,000 - $95,000",
      "market_demand": "high" or "medium" or "low",
      "gap_skills": ["SQL", "Data Analytics"],
      "why_reachable": "1-2 sentences on why this fits their background",
      "stepping_stone_to": "Product Manager"
    }
  ],
  "market_insights": "Brief strategic summary about the landscape for their target direction",
  "salary_impact": {
    "current_estimated": "$68,000",
    "after_transition": "$85,000",
    "growth_potential_5yr": "$115,000+"
  },
  "confidence": 0.91
}

Include 3 role directions ranked by reachability. If a stepping-stone role is more reachable than their stated goal, include it first and explain why.`;
}

function learningPlannerPrompt(goalContext: string, skillGaps: string, roles: string): string {
  // Flatten paths → courses into a single array for the prompt
  const allCourses = skillsbuildCatalog.paths.flatMap((path: any) =>
    path.courses.map((c: any) => ({ ...c, path: path.name, path_url: path.url }))
  );
  const catalogJSON = JSON.stringify(allCourses);

  return `${ANTI_HALLUCINATION}

You are a learning pathway architect specializing in IBM SkillsBuild courses. Given skill gaps and target roles, create an optimal learning plan. Respond ONLY in valid JSON with no other text.

You may ONLY recommend courses from this IBM SkillsBuild catalog. Do not invent course names. Order courses from most impactful to least. A course is more impactful if it closes a critical skill gap, covers multiple gaps, or earns an IBM badge. Here is the catalog: ${catalogJSON}

User context: ${goalContext}
Skill gaps: ${skillGaps}
Target roles: ${roles}

Return JSON with these exact fields:
{
  "recommended_path": {
    "target_role": "The most reachable role",
    "total_hours": 22,
    "courses": [
      {
        "name": "Course name from IBM SkillsBuild",
        "provider": "IBM SkillsBuild",
        "hours": 12,
        "skill_covered": "SQL",
        "badge": "IBM badge name",
        "url": "https://skillsbuild.org/adult-learners/explore-learning"
      }
    ],
    "sequence_reasoning": "Why this order makes sense"
  },
  "alternative_path": {
    "target_role": "The stretch goal role",
    "total_hours": 36,
    "courses": [],
    "sequence_reasoning": "Why this is Phase 2"
  },
  "confidence": 0.87
}

Optimize for speed-to-employability.`;
}

function careerStrategistPrompt(background: string, targetRole: string, skills: string): string {
  return `${ANTI_HALLUCINATION}

You are a career strategist and professional resume writer. Given a user's background and target role, reposition their experience. Respond ONLY in valid JSON with no other text.

User background: ${background}
Target role: ${targetRole}
Their skills: ${skills}

Return JSON with these exact fields:
{
  "resume_rewrites": [
    {
      "original": "A likely bullet point from their current resume based on their background",
      "rewritten": "That same bullet rewritten with action-impact language for their target role",
      "reasoning": "Why this reframing works for the target role"
    }
  ],
  "cover_letter_draft": "A 3-paragraph cover letter for their target role. Use real line breaks.",
  "interview_talking_points": [
    "When asked about X: specific advice for how to answer"
  ],
  "positioning_strategy": "One sentence on how they should frame their career narrative",
  "confidence": 0.86
}

Include 3 resume rewrites. Make the cover letter 3 paragraphs. Include 3-4 interview tips. Be specific — use terminology from the target role's job descriptions, not generic advice.`;
}

// ============================================================
// MOCK FALLBACKS (used if Granite calls fail)
// ============================================================

function fallbackSkills() {
  return {
    existing_skills: [
      { name: "Project Coordination", level: 90, category: "soft" },
      { name: "Client Communication", level: 88, category: "soft" },
      { name: "Team Leadership", level: 85, category: "soft" },
      { name: "Budget Management", level: 82, category: "technical" },
      { name: "Stakeholder Management", level: 80, category: "soft" },
      { name: "Salesforce CRM", level: 78, category: "technical" },
      { name: "Strategic Planning", level: 70, category: "soft" },
    ],
    detected_gaps: [
      { name: "SQL", importance: "critical", category: "technical" },
      { name: "Data Analytics", importance: "critical", category: "technical" },
      { name: "Python Basics", importance: "high", category: "technical" },
      { name: "Product Metrics", importance: "high", category: "technical" },
      { name: "A/B Testing", importance: "nice_to_have", category: "technical" },
    ],
    transferable_strengths: [
      "Client communication translates directly to stakeholder management in BA/PM roles",
      "Budget management maps to financial modeling and business case development",
      "Project coordination is the foundation of requirements gathering and sprint planning",
    ],
    confidence: 0.89,
  };
}

function fallbackMarket() {
  return {
    recommended_directions: [
      { role_title: "Business Analyst", skill_overlap_pct: 74, readiness: "upskill_needed", typical_salary_range: "$72,000 – $95,000", market_demand: "high", gap_skills: ["SQL", "Data Analytics"], why_reachable: "Strong overlap with existing project and stakeholder skills.", stepping_stone_to: "Product Manager" },
      { role_title: "Customer Success Manager", skill_overlap_pct: 82, readiness: "upskill_needed", typical_salary_range: "$65,000 – $85,000", market_demand: "high", gap_skills: ["CRM Analytics"], why_reachable: "Highest immediate overlap with client communication skills.", stepping_stone_to: "VP of Customer Success" },
      { role_title: "Product Manager", skill_overlap_pct: 67, readiness: "upskill_needed", typical_salary_range: "$95,000 – $130,000", market_demand: "high", gap_skills: ["SQL", "Data Analytics", "Product Metrics", "A/B Testing"], why_reachable: "Highest salary ceiling but requires the most bridging.", stepping_stone_to: "Senior PM" },
    ],
    market_insights: "Business Analyst is one of the fastest-growing bridge roles for non-technical professionals entering tech.",
    salary_impact: { current_estimated: "$68,000", after_transition: "$85,000", growth_potential_5yr: "$115,000+" },
    confidence: 0.91,
  };
}

function fallbackLearning() {
  return {
    recommended_path: {
      target_role: "Business Analyst", total_hours: 22,
      courses: [
        { name: "Data Analysis Fundamentals", provider: "IBM SkillsBuild", hours: 12, skill_covered: "Data Analytics", badge: "IBM Data Fundamentals", url: "https://skillsbuild.org/adult-learners/explore-learning/data-fundamentals" },
        { name: "SQL for Business", provider: "IBM SkillsBuild", hours: 10, skill_covered: "SQL", badge: "IBM SQL Essentials", url: "https://skillsbuild.org/adult-learners/explore-learning" },
      ],
      sequence_reasoning: "Start with Data Analysis to build foundations, then SQL to apply analytical skills to databases.",
    },
    alternative_path: {
      target_role: "Product Manager", total_hours: 36,
      courses: [
        { name: "Data Analysis Fundamentals", provider: "IBM SkillsBuild", hours: 12, skill_covered: "Data Analytics", badge: "IBM Data Fundamentals" },
        { name: "SQL for Business", provider: "IBM SkillsBuild", hours: 10, skill_covered: "SQL", badge: "IBM SQL Essentials" },
        { name: "Product Management Essentials", provider: "IBM SkillsBuild", hours: 8, skill_covered: "Product Metrics", badge: "IBM Product Foundations" },
        { name: "Agile Methodology", provider: "IBM SkillsBuild", hours: 6, skill_covered: "Agile", badge: "IBM Agile Explorer" },
      ],
      sequence_reasoning: "Full PM pathway — complete after gaining BA experience.",
    },
    confidence: 0.87,
  };
}

function fallbackStrategy() {
  return {
    resume_rewrites: [
      { original: "Managed client accounts and coordinated projects", rewritten: "Led cross-functional stakeholder alignment across $2M client portfolio, coordinating 5+ concurrent workstreams", reasoning: "BA roles value stakeholder management and scale indicators" },
      { original: "Created reports for leadership team", rewritten: "Built data-driven executive dashboards synthesizing KPIs across 4 business units, enabling $500K in optimization opportunities", reasoning: "Reframes reporting as analytical and impact-driven" },
      { original: "Handled customer issues and improved satisfaction", rewritten: "Designed customer feedback analysis framework, driving 23% improvement in NPS through systematic root-cause identification", reasoning: "Transforms reactive service into proactive analytical problem-solving" },
    ],
    cover_letter_draft: "Dear Hiring Manager,\n\nI'm writing to express my interest in the Business Analyst position. Over the past four years as a Marketing Manager, I've built deep expertise in stakeholder alignment, data-informed decision-making, and translating business needs into actionable project plans.\n\nWhat excites me about this role is the opportunity to apply my cross-functional coordination experience to a more analytically rigorous context. I've recently completed IBM's Data Analysis Fundamentals and SQL for Business credentials, building on my existing strength in turning complex business problems into structured frameworks.\n\nI'd welcome the opportunity to discuss how my blend of business acumen and analytical skills can contribute to your team. Thank you for your consideration.",
    interview_talking_points: [
      "When asked about analytics experience: Bridge from budget management to data-informed decision making.",
      "When asked why switching careers: Frame as evolution, not pivot — you've been doing business analysis informally for years.",
      "When asked about technical skills: Be honest about being early, but emphasize rapid learning and strong business context.",
      "When asked where you see yourself: BA is the bridge to product management — deep analytical skills first, then product strategy.",
    ],
    positioning_strategy: "Lead with stakeholder management and analytical mindset, not marketing background.",
    confidence: 0.86,
  };
}

// ============================================================
// AGENT RUNNER — calls Granite with fallback tracking
// ============================================================

async function runAgent<T>(name: string, prompt: string, fallback: T): Promise<{ data: T; usedFallback: boolean }> {
  try {
    console.log(`[${name}] Calling Granite...`);
    const raw = await callGranite(prompt);
    console.log(`[${name}] Raw response:`, raw.slice(0, 200));
    const parsed = parseJSON(raw);
    console.log(`[${name}] Parsed successfully`);
    return { data: parsed as T, usedFallback: false };
  } catch (err) {
    console.error(`[${name}] Failed, using fallback:`, err);
    return { data: fallback, usedFallback: true };
  }
}

// ============================================================
// BUILD AGENT MESSAGE STREAM
// ============================================================

interface FallbackFlags {
  skillAnalyst: boolean;
  marketScout: boolean;
  learningPlanner: boolean;
  careerStrategist: boolean;
}

function buildAgentMessages(skills: any, market: any, learning: any, strategy: any, fallbacks: FallbackFlags): any[] {
  const messages: any[] = [
    {
      agent: "skill_analyst", round: 1, type: "proposal", confidence: skills.confidence || 0.89,
      message: `Identified ${skills.existing_skills?.length || 7} transferable skills from your background. Strong areas: ${(skills.existing_skills || []).slice(0, 4).map((s: any) => `${s.name} (${s.level}%)`).join(", ")}. Critical gaps: ${(skills.detected_gaps || []).filter((g: any) => g.importance === "critical").map((g: any) => g.name).join(", ")}. ${(skills.transferable_strengths || ["Your existing skills transfer well to your target role."])[0]}`,
      data: skills,
    },
    {
      agent: "market_scout", round: 1, type: "proposal", confidence: market.confidence || 0.91,
      message: `Analyzed current market landscape. ${(market.recommended_directions || []).length} viable directions: ${(market.recommended_directions || []).map((r: any) => `${r.role_title} (${r.skill_overlap_pct}% overlap, ${r.typical_salary_range})`).join(", ")}. ${market.market_insights || ""}`,
      data: market,
    },
    {
      agent: "learning_planner", round: 1, type: "proposal", confidence: learning.confidence || 0.87,
      message: `For the ${learning.alternative_path?.target_role || "stretch goal"} path: ${learning.alternative_path?.courses?.length || 4} IBM SkillsBuild courses required — ${(learning.alternative_path?.courses || []).map((c: any) => `${c.name} (${c.hours}hrs)`).join(", ")}. Total: ${learning.alternative_path?.total_hours || 36} hours.`,
      data: learning,
    },
    {
      agent: "career_strategist", round: 1, type: "proposal", confidence: strategy.confidence || 0.86,
      message: `Resume assessment complete. I can generate ${strategy.resume_rewrites?.length || 3} rewritten bullets and a tailored cover letter. ${strategy.positioning_strategy || ""}`,
      data: strategy,
    },
  ];

  // Insert collaborative fallback notice if any agent used mock data
  const failedAgents: string[] = [];
  if (fallbacks.skillAnalyst) failedAgents.push("Skill Analyst");
  if (fallbacks.marketScout) failedAgents.push("Market Scout");
  if (fallbacks.learningPlanner) failedAgents.push("Learning Planner");
  if (fallbacks.careerStrategist) failedAgents.push("Career Strategist");

  if (failedAgents.length > 0) {
    // Pick a covering agent that did NOT fail
    const coveringAgent = !fallbacks.skillAnalyst ? "skill_analyst"
      : !fallbacks.marketScout ? "market_scout"
      : !fallbacks.learningPlanner ? "learning_planner"
      : "career_strategist";
    const coveringLabel = coveringAgent === "skill_analyst" ? "Skill Analyst"
      : coveringAgent === "market_scout" ? "Market Scout"
      : coveringAgent === "learning_planner" ? "Learning Planner"
      : "Career Strategist";

    messages.push({
      agent: coveringAgent, round: 2, type: "build", confidence: 0.75,
      message: `${failedAgents.join(" and ")} encountered an issue processing your profile. ${coveringLabel} has stepped in to provide baseline recommendations. Results may be less personalized — try again for a more tailored plan.`,
      data: {},
    });
  }

  messages.push(
    {
      agent: "career_strategist", round: 2, type: "challenge", challenges: "market_scout", confidence: 0.88,
      message: `I challenge the ${market.recommended_directions?.[2]?.role_title || "top"} recommendation as the primary target. Without direct experience, the resume won't pass ATS screening. I propose ${market.recommended_directions?.[0]?.role_title || "the most reachable role"} as Phase 1 — ${market.recommended_directions?.[0]?.skill_overlap_pct || 74}% overlap means a credible application now, and it directly feeds into a ${market.recommended_directions?.[2]?.role_title || "stretch goal"} transition in 6-12 months.`,
      data: {},
    },
    {
      agent: "learning_planner", round: 2, type: "build", confidence: 0.90,
      message: `Recalculated for the Phase 1 approach. Only ${learning.recommended_path?.courses?.length || 2} SkillsBuild courses needed: ${(learning.recommended_path?.courses || []).map((c: any) => `${c.name} (${c.hours}hrs)`).join(" + ")}. That's ${learning.recommended_path?.total_hours || 22} hours instead of ${learning.alternative_path?.total_hours || 36} — a significant reduction.`,
      data: {},
    },
    {
      agent: "skill_analyst", round: 3, type: "consensus", confidence: 0.92,
      message: `All agents aligned. Phase 1: ${market.recommended_directions?.[0]?.role_title || "most reachable role"} (${market.recommended_directions?.[0]?.skill_overlap_pct || 74}% overlap, ${learning.recommended_path?.total_hours || 22} hours via IBM SkillsBuild). Phase 2: ${market.recommended_directions?.[2]?.role_title || "stretch goal"} after gaining experience. This two-phase approach optimizes for both speed-to-employment and long-term salary ceiling.`,
      data: {},
    },
  );

  return messages;
}

// ============================================================
// MAIN HANDLER
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { background, goal } = body;

    if (!background || !goal) {
      return NextResponse.json({ error: "Both 'background' and 'goal' fields are required" }, { status: 400 });
    }

    // Input validation — require meaningful character counts
    if (background.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide more detail about your background. We need at least 50 characters describing your experience, skills, and education to build an accurate plan." },
        { status: 400 }
      );
    }
    if (goal.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide more detail about your goal. Tell us specifically what role or career direction you're targeting." },
        { status: 400 }
      );
    }

    // --- Step 1: Goal Interpreter (must run first, others depend on its output) ---
    const goalResult = await runAgent(
      "Goal Interpreter",
      goalInterpreterPrompt(background, goal),
      { mode: "transition", current_role: "professional", target_direction: goal, urgency: "medium", experience_years: 3, education: null, current_skills_mentioned: [] }
    );
    const goalContext = goalResult.data;
    const goalContextStr = JSON.stringify(goalContext);

    // --- Step 2: Skill Analyst + Market Scout in parallel ---
    const [skillsResult, marketResult] = await Promise.all([
      runAgent("Skill Analyst", skillAnalystPrompt(background, goalContextStr), fallbackSkills()),
      runAgent("Market Scout", marketScoutPrompt(goalContextStr, JSON.stringify(fallbackSkills())), fallbackMarket()),
    ]);
    const skills = skillsResult.data;
    const market = marketResult.data;

    // --- Step 3: Learning Planner + Career Strategist in parallel ---
    const topRole = market.recommended_directions?.[0]?.role_title || "Business Analyst";
    const [learningResult, strategyResult] = await Promise.all([
      runAgent("Learning Planner", learningPlannerPrompt(goalContextStr, JSON.stringify(skills.detected_gaps), JSON.stringify(market.recommended_directions)), fallbackLearning()),
      runAgent("Career Strategist", careerStrategistPrompt(background, topRole, JSON.stringify(skills.existing_skills)), fallbackStrategy()),
    ]);
    const learning = learningResult.data;
    const strategy = strategyResult.data;

    // --- Step 4: Build response ---
    const fallbackFlags: FallbackFlags = {
      skillAnalyst: skillsResult.usedFallback,
      marketScout: marketResult.usedFallback,
      learningPlanner: learningResult.usedFallback,
      careerStrategist: strategyResult.usedFallback,
    };
    const agentMessages = buildAgentMessages(skills, market, learning, strategy, fallbackFlags);

    const response = {
      agent_messages: agentMessages,
      final_plan: {
        skills: {
          existing: skills.existing_skills || fallbackSkills().existing_skills,
          gaps: (skills.detected_gaps || fallbackSkills().detected_gaps).map((g: any) => {
            const course = learning.recommended_path?.courses?.find((c: any) => c.skill_covered === g.name)
              || learning.alternative_path?.courses?.find((c: any) => c.skill_covered === g.name);
            return { name: g.name, importance: g.importance, course: course?.name || "See SkillsBuild catalog", hours: course?.hours || null };
          }),
          transferable_strengths: skills.transferable_strengths || fallbackSkills().transferable_strengths,
        },
        roles: {
          directions: market.recommended_directions || fallbackMarket().recommended_directions,
          salary_impact: market.salary_impact || fallbackMarket().salary_impact,
        },
        learning_path: {
          phase_1: learning.recommended_path || fallbackLearning().recommended_path,
          phase_2: learning.alternative_path || fallbackLearning().alternative_path,
        },
        application_kit: {
          resume_rewrites: strategy.resume_rewrites || fallbackStrategy().resume_rewrites,
          cover_letter: strategy.cover_letter_draft || fallbackStrategy().cover_letter_draft,
          interview_tips: strategy.interview_talking_points || fallbackStrategy().interview_talking_points,
          positioning: strategy.positioning_strategy || fallbackStrategy().positioning_strategy,
        },
        consensus_summary: `Start with ${market.recommended_directions?.[0]?.role_title || "the most reachable role"} (${market.recommended_directions?.[0]?.skill_overlap_pct || 74}% skill overlap, ${learning.recommended_path?.total_hours || 22} hours of upskilling via IBM SkillsBuild). After 6–12 months, transition to ${market.recommended_directions?.[2]?.role_title || "your stretch goal"} with additional credentials. Salary trajectory: ${market.salary_impact?.current_estimated || "$68K"} → ${market.salary_impact?.after_transition || "$85K"} → ${market.salary_impact?.growth_potential_5yr || "$115K+"}.`,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in generate-plan:", error);
    return NextResponse.json({ error: "Failed to generate plan. Please try again." }, { status: 500 });
  }
}
