import ChatInput from "./ChatInput";

interface ChatFormProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function ChatForm({
  input,
  handleInputChange,
  handleSubmit
}: ChatFormProps) {
  return (
    <ChatInput
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      right={6}
    />
  );
}
