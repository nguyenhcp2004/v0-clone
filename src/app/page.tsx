"use client";

import { useState, useEffect, useRef } from "react";
import ChatWelcome from "@/features/shared/components/ChatWelcome";
import ChatMessages from "@/features/shared/components/ChatMessages";
import ChatForm from "@/features/shared/components/ChatForm";
import { useChat, type Message } from "@ai-sdk/react";
import dynamic from "next/dynamic";
import SandpackPreviewPanel from "@/features/shared/components/SandpackPreviewPanel";

const SandpackPreview = dynamic(
  () => import("@/features/shared/components/SandpackPreview"),
  { ssr: false }
);

export default function Home() {
  // Ref for auto-scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // State
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [codeHistory, setCodeHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [chatWidth, setChatWidth] = useState(500);
  const [isResizing, setIsResizing] = useState(false);

  // Chat hook
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat"
  });

  // Extract code block from AI message
  const extractReactCode = (text: string) => {
    const match = text.match(
      /```(?:jsx|tsx|js|javascript|html|css|scss|sass|less)?\n([\s\S]*?)```/
    );
    return match ? match[1] : null;
  };

  // Find latest code block in assistant message
  const getLatestCodeBlock = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === "assistant") {
        if (Array.isArray(msg.parts)) {
          for (let j = 0; j < msg.parts.length; j++) {
            const part = msg.parts[j];
            if (part.type === "text" && extractReactCode(part.text)) {
              return { msgIdx: i, partIdx: j };
            }
          }
        } else if (msg.content && extractReactCode(msg.content)) {
          return { msgIdx: i, partIdx: 0 };
        }
      }
    }
    return { msgIdx: -1, partIdx: -1 };
  };
  const { msgIdx: latestCodeMsgIdx, partIdx: latestCodePartIdx } =
    getLatestCodeBlock();

  // History effect
  useEffect(() => {
    if (
      previewCode &&
      (codeHistory.length === 0 || previewCode !== codeHistory[historyIndex])
    ) {
      const newHistory = codeHistory.slice(0, historyIndex + 1);
      newHistory.push(previewCode);
      setCodeHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    if (previewCode) setShowPreview(true);
  }, [previewCode]);

  // Resizing effect
  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const min = 320,
        max = 900;
      let newWidth = e.clientX - document.body.getBoundingClientRect().left;
      if (newWidth < min) newWidth = min;
      if (newWidth > max) newWidth = max;
      setChatWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Auto show preview when AI finishes generating
  const prevStatus = useRef<string>("");
  const prevPreviewCode = useRef<string | null>(null);
  useEffect(() => {
    if (
      status === "ready" &&
      previewCode &&
      (prevStatus.current !== "ready" ||
        prevPreviewCode.current !== previewCode)
    ) {
      setShowPreview(true);
    }
    prevStatus.current = status;
    prevPreviewCode.current = previewCode;
  }, [status, previewCode]);

  // Auto update previewCode when new AI message contains code
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === "assistant") {
        let code = null;
        if (Array.isArray(msg.parts)) {
          for (const part of msg.parts) {
            if (part.type === "text") {
              code = extractReactCode(part.text);
              if (code) break;
            }
          }
        } else if (msg.content) {
          code = extractReactCode(msg.content);
        }
        if (code) {
          setPreviewCode(code);
          break;
        }
      }
    }
  }, [messages]);

  // User message check
  const hasUserMessage = messages.some(
    (msg: Message) => msg.role === "user" && msg.content?.trim()
  );

  // Preview handler
  const handlePreview = (code: string) => {
    setPreviewCode(code);
    setShowPreview(true);
  };

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // State for showing scroll-to-bottom button
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Show scroll-to-bottom button if not at bottom
  useEffect(() => {
    const container = document.getElementById("chat-scroll-container");
    if (!container) return;
    const handleScroll = () => {
      // Show button if user scrolls up more than 1px from bottom
      const atBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        1;
      setShowScrollBtn(!atBottom);
    };
    container.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [hasUserMessage]);

  // Render
  return (
    <div
      className={`flex w-full max-w-[1800px] h-screen mx-auto bg-zinc-950 ${
        showPreview && previewCode
          ? "flex-row"
          : "flex-col justify-center items-center"
      }`}
      style={{ position: "relative" }}
    >
      {/* Chat section */}
      <div
        className={`flex flex-col h-screen px-2 py-2 relative z-10 bg-zinc-950 ${
          showPreview && previewCode
            ? ""
            : "w-full max-w-[800px] min-w-[360px] justify-center items-center"
        }`}
        style={
          showPreview && previewCode
            ? {
                width: chatWidth,
                minWidth: 320,
                maxWidth: 900,
                transition: isResizing ? "none" : "width 0.2s"
              }
            : undefined
        }
      >
        <div className="flex flex-col flex-1 min-h-0 relative">
          <div
            className="flex-1 overflow-y-auto relative"
            id="chat-scroll-container"
          >
            {!hasUserMessage ? (
              <ChatWelcome
                handleSubmit={handleSubmit}
                input={input}
                handleInputChange={handleInputChange}
              />
            ) : (
              <>
                <ChatMessages
                  messages={messages}
                  extractReactCode={extractReactCode}
                  latestCodeMsgIdx={latestCodeMsgIdx}
                  latestCodePartIdx={latestCodePartIdx}
                  handlePreview={handlePreview}
                />
                {/* Scroll anchor */}
                <div ref={messagesEndRef} className="relative" />
              </>
            )}
          </div>
          {showScrollBtn && (
            <button
              className="absolute left-1/2 -translate-x-1/2 bottom-20 bg-zinc-800 text-white rounded-full shadow hover:bg-zinc-700 transition-opacity duration-200 z-50 flex items-center justify-center w-12 h-12 opacity-100 pointer-events-auto cursor-pointer"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.18)" }}
              onClick={() => {
                messagesEndRef.current?.scrollIntoView({
                  behavior: "smooth"
                });
              }}
              aria-label="Scroll to bottom"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          )}
          {hasUserMessage && (
            <ChatForm
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
            />
          )}
        </div>
      </div>

      {/* Resizer */}
      {showPreview && previewCode && (
        <div
          style={{
            width: 6,
            cursor: isResizing ? "col-resize" : "ew-resize",
            zIndex: 20,
            background: isResizing ? "#334155" : "#27272a",
            borderLeft: "1px solid #3f3f46",
            borderRight: "1px solid #3f3f46",
            transition: "background 0.2s",
            userSelect: "none"
          }}
          onMouseDown={() => setIsResizing(true)}
          className="h-full flex-shrink-0 hover:bg-zinc-800"
        />
      )}

      {/* Preview section */}
      {showPreview && previewCode && (
        <SandpackPreviewPanel
          codeHistory={codeHistory}
          historyIndex={historyIndex}
          setHistoryIndex={setHistoryIndex}
          setPreviewCode={setPreviewCode}
          setShowPreview={setShowPreview}
          previewCode={previewCode}
        />
      )}
    </div>
  );
}
