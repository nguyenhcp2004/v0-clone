"use client";

import React, { useEffect, useState } from "react";
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
  const [currentPreviewCode, setCurrentPreviewCode] = useState(previewCode);

  // Sync previewCode với current code từ history
  useEffect(() => {
    if (codeHistory && codeHistory[historyIndex]) {
      const newCode = codeHistory[historyIndex];
      setCurrentPreviewCode(newCode);
      setPreviewCode(newCode);
    }
  }, [historyIndex, codeHistory, setPreviewCode]);

  // Sync khi previewCode thay đổi từ bên ngoài
  useEffect(() => {
    setCurrentPreviewCode(previewCode);
  }, [previewCode]);

  if (!currentPreviewCode) return null;

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-zinc-900  shadow-2xl p-2">
      <SandpackPreviewContainer
        code={currentPreviewCode}
        template="react"
        codeHistory={codeHistory}
        historyIndex={historyIndex}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default SandpackPreviewPanel;
