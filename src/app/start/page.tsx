"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

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
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ background, goal }),
      });
      const data = await res.json();
      sessionStorage.setItem("agent_messages", JSON.stringify(data.agent_messages));
      sessionStorage.setItem("final_plan", JSON.stringify(data.final_plan));
    } catch (err) {
      // API failed — demo still navigates with fallback data
      console.error("generate-plan failed:", err);
    }
    sessionStorage.setItem("sb_background", background);
    sessionStorage.setItem("sb_goal", goal);
    sessionStorage.setItem("sb_mode", mode);
    sessionStorage.setItem("user_background", background);
    sessionStorage.setItem("user_goal", goal);
    router.push("/agents");
  };

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
            onChange={(e) => setBackground(e.target.value)}
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
            onChange={(e) => setGoal(e.target.value)}
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
          {loading ? "Agents launching..." : "Launch agents →"}
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
