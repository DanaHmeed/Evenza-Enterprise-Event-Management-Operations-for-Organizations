// app/components/shared/ChatBot.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { BotMessageSquare } from "lucide-react";
import Image from "next/image";
interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Evenza Assistant, Ask me anything about events, tickets, or the platform.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message ?? "Sorry, something went wrong.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't connect right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "88px",
            right: "24px",
            width: "360px",
            maxHeight: "520px",
            background: "#ffffff",
            border: "1px solid #e8e8e4",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            fontFamily: "Rubik, sans-serif",
            overflow: "hidden",
            animation: "chatSlideUp 0.22s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f0f0ec",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#fafaf8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div>
                <Image
                  src="/icons/chatLogo.png"
                  alt="Evenza Assistant Avatar"
                  width={70}
                  height={70}
                />
      
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.01em" }}>
                  Evenza Assistant
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "#999", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#999",
                fontSize: "18px",
                lineHeight: 1,
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "#fafaf8",
              scrollbarWidth: "thin",
              scrollbarColor: "#e0e0da transparent",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "10px 14px",
                    borderRadius:
                      msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: msg.role === "user" ? "#1a1a1a" : "#ffffff",
                    color: msg.role === "user" ? "#ffffff" : "#1a1a1a",
                    fontSize: "13.5px",
                    lineHeight: "1.55",
                    border: msg.role === "user" ? "none" : "1px solid #eeeeea",
                    boxShadow: msg.role === "user" ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "14px 14px 14px 4px",
                    background: "#ffffff",
                    border: "1px solid #eeeeea",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: "6px",
                        height: "6px",
                        background: "#bbb",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #f0f0ec",
              background: "#ffffff",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              disabled={isLoading}
              style={{
                flex: 1,
                border: "1px solid #e8e8e4",
                borderRadius: "10px",
                padding: "9px 14px",
                fontSize: "13.5px",
            fontFamily: "Rubik, sans-serif",
                outline: "none",
                background: "#fafaf8",
                color: "#1a1a1a",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e8e4")}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: input.trim() && !isLoading ? "#1a1a1a" : "#e8e8e4",
                border: "none",
                cursor: input.trim() && !isLoading ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
                flexShrink: 0,
              }}
              aria-label="Send message"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13"
                  stroke={input.trim() && !isLoading ? "#ffffff" : "#aaa"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke={input.trim() && !isLoading ? "#ffffff" : "#aaa"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "52px",
          height: "52px",
          borderRadius: "14px",
          background: "#1a1a1a",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          zIndex: 9999,
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          fontFamily: "Rubik, sans-serif",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.06)";
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.24)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.18)";
        }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <BotMessageSquare size={26} color="#fff" />
        )}
      </button>

      {/* Animations */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
}