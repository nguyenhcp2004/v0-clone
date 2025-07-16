import React from "react";
import SandpackPreviewContainer from "@/features/shared/components/SandpackPreview";

interface SandpackPreviewPanelProps {
  codeHistory: string[];
  historyIndex: number;
  setHistoryIndex: (idx: number) => void;
  setPreviewCode: (code: string) => void;
  setShowPreview: (show: boolean) => void;
  previewCode: string | null;
}

const SandpackPreviewPanel: React.FC<SandpackPreviewPanelProps> = ({
  codeHistory,
  historyIndex,
  setHistoryIndex,
  setPreviewCode,
  setShowPreview,
  previewCode
}) => {
  if (!previewCode) return null;
  return (
    <div className="flex flex-col flex-1 h-fit bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 m-2">
      <div className="flex-1 h-full w-full">
        <SandpackPreviewContainer
          code={previewCode}
          template="react"
          codeHistory={codeHistory}
          historyIndex={historyIndex}
          onClose={() => setShowPreview(false)}
        />
      </div>
    </div>
  );
};

export default SandpackPreviewPanel;
