"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/features/shared/components/ui/textarea";
import { Button } from "@/features/shared/components/ui/button";
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
    api: "/api/chat"
    // initialMessages: [
    //   {
    //     id: "1",
    //     role: "user",
    //     content: "Hello, how are you?"
    //   }
    // ]
  });

  // Detect if AI message contains React code block
  const extractReactCode = (text: string) => {
    // Regex for ```jsx, ```tsx, ```js, ```javascript, ```html, ```css, ```scss, ```sass, ```less
    const match = text.match(
      /```(?:jsx|tsx|js|javascript|html|css|scss|sass|less)?\n([\s\S]*?)```/
    );
    return match ? match[1] : null;
  };

  // Find the latest assistant message index with a code block
  let latestCodeMsgIdx = -1;
  let latestCodePartIdx = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "assistant" && Array.isArray(msg.parts)) {
      for (let j = 0; j < msg.parts.length; j++) {
        const part = msg.parts[j];
        if (part.type === "text" && extractReactCode(part.text)) {
          latestCodeMsgIdx = i;
          latestCodePartIdx = j;
          break;
        }
      }
      if (latestCodeMsgIdx !== -1) break;
    } else if (msg.role === "assistant" && msg.content) {
      if (extractReactCode(msg.content)) {
        latestCodeMsgIdx = i;
        latestCodePartIdx = 0;
        break;
      }
    }
  }

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

  // Check if user has sent any message
  const hasUserMessage = messages.some(
    (msg: Message) => msg.role === "user" && msg.content?.trim()
  );

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
        className={`flex flex-col h-screen px-0 py-0 relative z-10 bg-zinc-950 ${
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
        {!hasUserMessage ? (
          <div className="flex flex-1 flex-col items-center justify-center w-full h-full">
            <div className="mb-8 text-center">
              <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
                What can I help you build?
              </h1>
              <p className="text-lg text-zinc-400 mb-6">
                Ask me to generate code, UI, or answer anything about React,
                Next.js, Tailwind, ...
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="w-full flex justify-center"
            >
              <div className="relative w-full max-w-2xl flex items-end bg-zinc-900 border border-zinc-700 rounded-2xl shadow-lg px-4 py-3">
                <Textarea
                  className="flex-1 resize-none bg-transparent text-base text-zinc-100 placeholder-zinc-400 focus:outline-none border-none shadow-none rounded-2xl min-h-[44px] max-h-60 leading-relaxed pr-12"
                  style={{ resize: "none", boxShadow: "none" }}
                  value={input}
                  placeholder="Enter your message..."
                  onChange={handleInputChange}
                  autoFocus
                  autoComplete="off"
                  rows={1}
                  maxLength={2000}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-5 bottom-4 bg-zinc-800 hover:bg-zinc-700 rounded-full p-2 flex items-center justify-center shadow-none transition-colors"
                  tabIndex={-1}
                  aria-label="Send"
                  style={{ height: 36, width: 36, minWidth: 36, minHeight: 36 }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 px-0 py-8 w-full items-center">
              {messages.map(
                (message: Message, msgIdx: number) =>
                  Array.isArray(message.parts) &&
                  message.parts.map((part: any, partIdx: number) => {
                    switch (part.type) {
                      case "text": {
                        const code = extractReactCode(part.text);
                        const isUser = message.role === "user";
                        const showPreviewBtn =
                          code &&
                          message.role === "assistant" &&
                          msgIdx === latestCodeMsgIdx &&
                          partIdx === latestCodePartIdx;
                        return (
                          <div
                            key={`${message.id}-${partIdx}`}
                            className={`w-full flex ${
                              isUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!isUser && (
                              <div className="flex items-end mr-2"></div>
                            )}
                            <div
                              className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-md text-base whitespace-pre-wrap break-words ${
                                isUser
                                  ? "bg-zinc-700 text-zinc-100 rounded-br-md"
                                  : " text-zinc-100 "
                              }`}
                            >
                              {part.text}
                              {showPreviewBtn && (
                                <button
                                  className="block mt-3 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded shadow-lg text-xs font-semibold hover:from-blue-700 hover:to-indigo-600 transition-all border border-blue-700"
                                  style={{ minWidth: 90 }}
                                  onClick={() => handlePreview(code)}
                                >
                                  Preview code
                                </button>
                              )}
                            </div>
                            {isUser && (
                              <div className="flex items-end ml-2">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center text-white font-bold text-lg select-none shadow-md"></div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      default:
                        return null;
                    }
                  })
              )}
            </div>
            <form
              onSubmit={handleSubmit}
              className="pb-8 pt-2 w-full flex justify-center"
            >
              <div className="relative w-full max-w-2xl flex items-end bg-zinc-900 border border-zinc-700 rounded-2xl shadow-lg px-4 py-3">
                <Textarea
                  className="flex-1 resize-none bg-transparent text-base text-zinc-100 placeholder-zinc-400 focus:outline-none border-none shadow-none rounded-2xl min-h-[44px] max-h-60 leading-relaxed pr-12"
                  style={{ resize: "none", boxShadow: "none" }}
                  value={input}
                  placeholder="Enter your message..."
                  onChange={handleInputChange}
                  autoComplete="off"
                  rows={1}
                  maxLength={2000}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-6 bottom-4 bg-zinc-800 hover:bg-zinc-700 rounded-full p-2 flex items-center justify-center shadow-none transition-colors"
                  tabIndex={-1}
                  aria-label="Send"
                  style={{ height: 36, width: 36, minWidth: 36, minHeight: 36 }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </Button>
              </div>
            </form>
          </>
        )}
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
