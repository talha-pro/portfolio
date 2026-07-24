"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

const F = {
  space: "var(--font-space-grotesk), sans-serif",
  inter: "var(--font-inter), system-ui, sans-serif",
  mono: "var(--font-jetbrains), monospace",
};

const SUGGESTIONS = [
  "What's his experience?",
  "What projects has he worked on?",
  "What's his tech stack?",
  "Is he available for hire?",
];

export default function ChatWidget() {
  const { messages, sendMessage, status, error, clearError } = useChat();
  const [input, setInput] = useState("");

  const isBusy = status === "submitted" || status === "streaming";

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    clearError();
    sendMessage({ text: trimmed });
    setInput("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "clamp(420px, 56vh, 560px)",
        borderRadius: 18,
        border: "1px solid var(--border)",
        background: "var(--card)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--accent)",
          }}
          aria-hidden="true"
        />
        <span
          style={{
            fontFamily: F.space,
            fontWeight: 600,
            fontSize: 14.5,
          }}
        >
          Ask about Talha
        </span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              color: "var(--muted)",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: 0 }}>
              Ask me anything about Talha&apos;s experience, skills, or
              projects — answers are grounded in his actual career info.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 100,
                    border: "1px solid var(--border)",
                    background: "var(--card2)",
                    color: "var(--text)",
                    fontSize: 12.5,
                    fontFamily: F.mono,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              alignSelf: message.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "88%",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 14,
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              background:
                message.role === "user" ? "var(--accent-soft)" : "var(--card2)",
              border: `1px solid ${
                message.role === "user" ? "var(--accent-line)" : "var(--border)"
              }`,
              color: "var(--text)",
              fontFamily: F.inter,
            }}
          >
            {message.parts
              .filter((part) => part.type === "text")
              .map((part, i) => (
                <span key={i}>{part.text}</span>
              ))}
          </div>
        ))}

        {isBusy && (
          <div
            style={{
              alignSelf: "flex-start",
              color: "var(--muted)",
              fontSize: 13,
              fontFamily: F.mono,
            }}
          >
            thinking…
          </div>
        )}

        {error && (
          <div
            style={{
              alignSelf: "flex-start",
              color: "var(--amber)",
              fontSize: 13,
              fontFamily: F.mono,
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "8px 12px",
            }}
          >
            {error.message || "Something went wrong. Please try again."}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        style={{
          display: "flex",
          gap: 10,
          padding: 14,
          borderTop: "1px solid var(--border)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={isBusy}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--card2)",
            color: "var(--text)",
            fontSize: 14,
            fontFamily: F.inter,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: "var(--accent)",
            color: "#04100F",
            fontWeight: 600,
            fontSize: 14,
            cursor: isBusy || !input.trim() ? "not-allowed" : "pointer",
            opacity: isBusy || !input.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
