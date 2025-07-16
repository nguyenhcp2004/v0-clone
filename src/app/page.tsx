"use client";

import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useChat, type Message } from "@ai-sdk/react";
import dynamic from "next/dynamic";
import SandpackPreviewContainer from "@/features/shared/components/SandpackPreview";
import SandpackPreviewPanel from "@/features/shared/components/SandpackPreviewPanel";
const SandpackPreview = dynamic(
  () => import("@/features/shared/components/SandpackPreview"),
  { ssr: false }
);

export default function Home() {
  // State for preview & versioned code history
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [codeHistory, setCodeHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1); // -1: no code yet

  // Whenever previewCode changes (and is not null), push to history if it's new
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
    // Auto open preview if there is code
    if (previewCode) {
      setShowPreview(true);
    }
  }, [previewCode]);

  // Undo/redo handlers
  // (Already declared above, remove duplicate)

  // State for resizable chat width
  const [chatWidth, setChatWidth] = useState(500);
  const [isResizing, setIsResizing] = useState(false);

  // Handle mouse move and up for resizing
  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      // Limit min/max width if needed
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

  // Whenever previewCode changes (and is not null), push to history if it's new
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
  }, [previewCode]);

  // Undo/redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPreviewCode(codeHistory[historyIndex - 1]);
    }
  };
  const handleRedo = () => {
    if (historyIndex < codeHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPreviewCode(codeHistory[historyIndex + 1]);
    }
  };

  // (Already merged in the above useEffect)

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "1",
        role: "user",
        content: "Hello, how are you?"
      }
    ]
  });

  // Detect if AI message contains React code block
  const extractReactCode = (text: string) => {
    // Regex for ```jsx, ```tsx, ```js, ```javascript, ```html, ```css, ```scss, ```sass, ```less
    const match = text.match(
      /```(?:jsx|tsx|js|javascript|html|css|scss|sass|less)?\n([\s\S]*?)```/
    );
    return match ? match[1] : null;
  };

  const handlePreview = (code: string) => {
    setPreviewCode(code);
    setShowPreview(true);
  };

  // Auto show preview when AI finishes generating and there is code (only for new code)
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

  // Auto update previewCode when there is a new AI message containing UI code
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    // Find the newest AI message that has UI code
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
        className={`flex flex-col h-screen px-8 py-8 relative z-10 bg-transparent ${
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
        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          {messages.map((message: Message) => (
            <div
              key={message.id}
              className="whitespace-pre-wrap mb-4 flex items-start"
            >
              <div
                className="font-semibold min-w-[48px] text-right pr-2 select-none"
                style={{
                  color: message.role === "user" ? "#a5b4fc" : "#f472b6"
                }}
              >
                {message.role === "user" ? "User:" : "AI:"}
              </div>
              <div className="flex-1 relative">
                {Array.isArray(message.parts) &&
                  message.parts.map((part: any, i: number) => {
                    switch (part.type) {
                      case "text": {
                        const code = extractReactCode(part.text);
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className="flex items-center group"
                          >
                            <div className="whitespace-pre-wrap break-words flex-1">
                              {part.text}
                            </div>
                            {code && (
                              <button
                                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-all shadow group-hover:scale-105"
                                style={{ minWidth: 90 }}
                                onClick={() => handlePreview(code)}
                              >
                                Preview code
                              </button>
                            )}
                          </div>
                        );
                      }
                      default:
                        return null;
                    }
                  })}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="pt-2 w-full">
          <input
            className="dark:bg-zinc-900 w-full p-2 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>

      {/* Resizer */}
      {showPreview && previewCode && (
        <div
          style={{
            width: 8,
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

      {/* Preview section (right side, inline layout) */}
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
