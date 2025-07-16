import { Textarea } from "@/features/shared/components/ui/textarea";
import { Button } from "@/features/shared/components/ui/button";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit
}: ChatInputProps) {
  return (
    <form onSubmit={handleSubmit} className="w-full flex justify-center">
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
          className={`absolute right-5 bottom-4 bg-zinc-800 hover:bg-zinc-700 rounded-full p-2 flex items-center justify-center shadow-none transition-colors`}
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
  );
}
