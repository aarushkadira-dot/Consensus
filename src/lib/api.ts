// ============================================================
// SKILLBRIDGE API — PLACEHOLDER FUNCTIONS
// ============================================================
// This file contains all API call placeholders for the backend
// team to wire up. Each function returns mock data for now.
//
// HOW TO INTEGRATE:
// 1. Replace the mock return values with real fetch/axios calls
// 2. Update the base URL in the config below
// 3. Add auth headers if needed
// 4. Each function signature and return type is already defined
// ============================================================

// --- Configuration ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// --- Types ---

export interface AgentMessage {
  agent: "skill_analyst" | "market_scout" | "learning_planner" | "career_strategist" | "network_agent";
  round: number;
  type: "proposal" | "challenge" | "build" | "consensus";
  confidence: number;
  message: string;
  challenges?: string;
}

export interface SkillEntry {
  name: string;
  level: number;
}

export interface SkillGap {
  name: string;
  course: string;
  hours: number;
}

export interface SkillData {
  existing: SkillEntry[];
  gaps: SkillGap[];
}

export interface TargetRole {
  title: string;
  overlap: number;
  phase: number;
  gap_hours: number;
  salary: string;
}

export interface PlanPhase {
  phase: number;
  title: string;
  items: string[];
}

export interface Mentor {
  name: string;
  role: string;
  company: string;
  match: string;
  reason: string;
}

export interface UserInput {
  background: string;
  goal: string;
}

export interface CareerPlanResponse {
  agentConversation: AgentMessage[];
  skills: SkillData;
  roles: TargetRole[];
  plan: PlanPhase[];
  mentors: Mentor[];
}

// ============================================================
// API FUNCTIONS — Replace mock returns with real API calls
// ============================================================

/**
 * Submit user background + goal and kick off the agent pipeline.
 * Returns a session ID for streaming agent updates.
 *
 * TODO: REPLACE WITH REAL API CALL
 * Expected endpoint: POST /api/sessions
 * Body: { background: string, goal: string }
 * Response: { sessionId: string }
 */
export async function createSession(input: UserInput): Promise<{ sessionId: string }> {
  // TODO: Replace with real API call
  // const res = await fetch(`${API_BASE_URL}/sessions`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(input),
  // });
  // return res.json();

  await simulateDelay(500);
  return { sessionId: "mock-session-001" };
}

/**
 * Stream agent conversation messages for a given session.
 * In production this should be a WebSocket or SSE connection.
 *
 * TODO: REPLACE WITH REAL API CALL
 * Expected endpoint: GET /api/sessions/:id/stream (SSE)
 * Each event: { agent, round, type, confidence, message, challenges? }
 */
export async function getAgentConversation(sessionId: string): Promise<AgentMessage[]> {
  // TODO: Replace with real API call
  // const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/conversation`);
  // return res.json();

  void sessionId;
  await simulateDelay(300);
  return MOCK_AGENT_CONVERSATION;
}

/**
 * Fetch the analyzed skills (strengths + gaps) for a session.
 *
 * TODO: REPLACE WITH REAL API CALL
 * Expected endpoint: GET /api/sessions/:id/skills
 */
export async function getSkillAnalysis(sessionId: string): Promise<SkillData> {
  // TODO: Replace with real API call
  // const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/skills`);
  // return res.json();

  void sessionId;
  await simulateDelay(200);
  return MOCK_SKILL_DATA;
}

/**
 * Fetch target roles recommended by the agents.
 *
 * TODO: REPLACE WITH REAL API CALL
 * Expected endpoint: GET /api/sessions/:id/roles
 */
export async function getTargetRoles(sessionId: string): Promise<TargetRole[]> {
  // TODO: Replace with real API call
  // const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/roles`);
  // return res.json();

  void sessionId;
  await simulateDelay(200);
  return MOCK_ROLES;
}

/**
 * Fetch the phased action plan.
 *
 * TODO: REPLACE WITH REAL API CALL
 * Expected endpoint: GET /api/sessions/:id/plan
 */
export async function getActionPlan(sessionId: string): Promise<PlanPhase[]> {
  // TODO: Replace with real API call
  // const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/plan`);
  // return res.json();

  void sessionId;
  await simulateDelay(200);
  return MOCK_PLAN;
}

/**
 * Fetch mentor matches found by the Network Agent.
 *
 * TODO: REPLACE WITH REAL API CALL
 * Expected endpoint: GET /api/sessions/:id/mentors
 */
export async function getMentors(sessionId: string): Promise<Mentor[]> {
  // TODO: Replace with real API call
  // const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/mentors`);
  // return res.json();

  void sessionId;
  await simulateDelay(200);
  return MOCK_MENTORS;
}

/**
 * Generate a PDF of the full career plan.
 *
 * TODO: REPLACE WITH REAL API CALL
 * Expected endpoint: GET /api/sessions/:id/plan/pdf
 * Response: Blob (application/pdf)
 */
export async function downloadPlanPDF(sessionId: string): Promise<Blob> {
  // TODO: Replace with real API call
  // const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/plan/pdf`);
  // return res.blob();

  void sessionId;
  await simulateDelay(500);
  return new Blob(["PDF placeholder"], { type: "application/pdf" });
}

/**
 * Send a pre-drafted outreach message to a mentor.
 *
 * TODO: REPLACE WITH REAL API CALL
 * Expected endpoint: POST /api/sessions/:id/mentors/:mentorIndex/outreach
 */
export async function sendMentorOutreach(
  sessionId: string,
  mentorIndex: number
): Promise<{ success: boolean; message: string }> {
  // TODO: Replace with real API call
  // const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/mentors/${mentorIndex}/outreach`, {
  //   method: "POST",
  // });
  // return res.json();

  void sessionId;
  void mentorIndex;
  await simulateDelay(300);
  return { success: true, message: "Outreach message sent (mock)" };
}

/**
 * Get the drafted outreach message for a mentor.
 *
 * TODO: REPLACE WITH REAL API CALL
 * Expected endpoint: GET /api/sessions/:id/mentors/:mentorIndex/draft
 */
export async function getMentorDraft(
  sessionId: string,
  mentorIndex: number
): Promise<{ subject: string; body: string }> {
  // TODO: Replace with real API call

  void sessionId;
  void mentorIndex;
  await simulateDelay(200);
  return {
    subject: "Connecting on career transition — similar background",
    body: "Hi [Name], I came across your profile and was inspired by your transition from client services to business analysis. I'm currently on a similar path and would love to hear about your experience. Would you be open to a brief conversation?",
  };
}

// ============================================================
// MOCK DATA — Remove once backend is connected
// ============================================================

const MOCK_AGENT_CONVERSATION: AgentMessage[] = [
  { agent: "skill_analyst", round: 1, type: "proposal", confidence: 0.89, message: "Identified 18 skills from resume. Strong in: project coordination, client communication, budget management, Salesforce CRM, team leadership. Gaps detected in: data analytics, SQL, Python, product metrics, A/B testing frameworks." },
  { agent: "market_scout", round: 1, type: "proposal", confidence: 0.91, message: "Top 3 reachable roles in target market: Product Manager (67% skill overlap), Business Analyst (74% overlap), Customer Success Manager (82% overlap). PM roles show highest salary ceiling but largest skill gap." },
  { agent: "learning_planner", round: 1, type: "proposal", confidence: 0.85, message: "For Product Manager path: 4 Consensus courses needed — Data Analysis Fundamentals (12hrs), Product Management Essentials (8hrs), Agile Methodology (6hrs), SQL for Business (10hrs). Total: ~36 hours." },
  { agent: "career_strategist", round: 2, type: "challenge", challenges: "market_scout", confidence: 0.88, message: "I challenge the PM recommendation. With zero product experience, the resume won't pass ATS screening. I propose Business Analyst as Phase 1 — 74% overlap AND the client communication skills translate directly. PM becomes Phase 2 after 6-12 months of BA experience." },
  { agent: "network_agent", round: 2, type: "build", confidence: 0.84, message: "Supporting the BA-first strategy. Found 6 Business Analysts at target companies who transitioned from similar backgrounds. 2 are open to mentoring on LinkedIn. I can draft personalized outreach for both." },
  { agent: "learning_planner", round: 2, type: "build", confidence: 0.90, message: "Revised pathway for BA-first approach: only 2 Consensus courses needed for Phase 1 — Data Analysis Fundamentals (12hrs) + SQL for Business (10hrs). That's 22 hours vs 36. Phase 2 adds PM-specific courses later." },
  { agent: "skill_analyst", round: 3, type: "consensus", confidence: 0.92, message: "Consensus reached. Two-phase plan: Phase 1 targets Business Analyst (smaller gap, faster entry). Phase 2 targets Product Manager (builds on BA experience). All agents aligned." },
];

const MOCK_SKILL_DATA: SkillData = {
  existing: [
    { name: "Project Coordination", level: 90 },
    { name: "Client Communication", level: 88 },
    { name: "Budget Management", level: 82 },
    { name: "Salesforce CRM", level: 78 },
    { name: "Team Leadership", level: 85 },
    { name: "Stakeholder Mgmt", level: 80 },
    { name: "Strategic Planning", level: 70 },
  ],
  gaps: [
    { name: "SQL", course: "SQL for Business", hours: 10 },
    { name: "Data Analytics", course: "Data Analysis Fundamentals", hours: 12 },
    { name: "Python Basics", course: "Python for Data Science", hours: 15 },
    { name: "Product Metrics", course: "Product Management Essentials", hours: 8 },
    { name: "A/B Testing", course: "Experimentation & Testing", hours: 6 },
  ],
};

const MOCK_ROLES: TargetRole[] = [
  { title: "Business Analyst", overlap: 74, phase: 1, gap_hours: 22, salary: "$72,000 \u2013 $95,000" },
  { title: "Customer Success Manager", overlap: 82, phase: 1, gap_hours: 8, salary: "$65,000 \u2013 $85,000" },
  { title: "Product Manager", overlap: 67, phase: 2, gap_hours: 36, salary: "$95,000 \u2013 $130,000" },
];

const MOCK_PLAN: PlanPhase[] = [
  { phase: 1, title: "Foundation", items: ["Complete SQL for Business on Consensus (10 hrs)", "Complete Data Analysis Fundamentals (12 hrs)", "Earn IBM Data Fundamentals badge", "Update resume with BA positioning"] },
  { phase: 2, title: "Apply", items: ["Target Business Analyst roles at 3 companies", "Use reframed resume + cover letter from Career Strategist", "Connect with 2 mentor matches from Network Agent", "Prepare for interviews with generated talking points"] },
  { phase: 3, title: "Level up", items: ["After 6\u201312 months as BA, begin PM transition", "Complete Product Management Essentials (8 hrs)", "Complete Agile Methodology (6 hrs)", "Build internal case study for PM portfolio"] },
];

const MOCK_MENTORS: Mentor[] = [
  { name: "Sarah Chen", role: "Senior Business Analyst", company: "IBM", match: "92%", reason: "Transitioned from client services \u2192 BA. Same skill profile." },
  { name: "Marcus Williams", role: "Business Analyst", company: "Cisco RTP", match: "87%", reason: "NCCU alum, 3 years BA experience in tech." },
];

// --- Utility ---
function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
