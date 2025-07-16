import type { Message } from "@ai-sdk/react";

interface ChatMessagesProps {
  messages: Message[];
  extractReactCode: (text: string) => string | null;
  latestCodeMsgIdx: number;
  latestCodePartIdx: number;
  handlePreview: (code: string) => void;
}

export default function ChatMessages({
  messages,
  extractReactCode,
  latestCodeMsgIdx,
  latestCodePartIdx,
  handlePreview
}: ChatMessagesProps) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 px-0 py-8 w-full items-center">
      {messages.map(
        (message: Message, msgIdx: number) =>
          Array.isArray(message.parts) &&
          message.parts.map((part: any, partIdx: number) => {
            if (part.type !== "text") return null;
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
                {!isUser && <div className="flex items-end mr-2"></div>}
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
          })
      )}
    </div>
  );
}
