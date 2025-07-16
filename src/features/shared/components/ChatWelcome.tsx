interface ChatWelcomeProps {
  handleSubmit: (e: React.FormEvent) => void;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
import ChatInput from "./ChatInput";

export default function ChatWelcome({
  handleSubmit,
  input,
  handleInputChange
}: ChatWelcomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center w-full h-full">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
          What can I help you build?
        </h1>
        <p className="text-lg text-zinc-400 mb-6">
          Ask me to generate code, UI, or answer anything about React, Next.js,
          Tailwind, ...
        </p>
      </div>
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        right={5}
      />
    </div>
  );
}
