"use client";
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackPreview
} from "@codesandbox/sandpack-react";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { dracula } from "@codesandbox/sandpack-themes";

interface SandpackPreviewContainerProps {
  code: string;
  template?: "react" | "vanilla" | "static";
  codeHistory?: string[];
  historyIndex?: number;
  onClose?: () => void;
}

const SandpackPreviewContainer: FC<SandpackPreviewContainerProps> = ({
  code,
  template = "react",
  codeHistory,
  historyIndex,
  onClose
}) => {
  const [showPreview, setShowPreview] = useState(true);
  // Tailwind CSS config and files for Sandpack
  const tailwindFiles = {
    "/App.js": code,
    "/index.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
    "/tailwind.config.js": `module.exports = { content: [\"./App.js\"], theme: { extend: {} }, plugins: [] }`,
    "/postcss.config.js": `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }`,
    "/package.json": JSON.stringify(
      {
        dependencies: {
          react: "latest",
          "react-dom": "latest",
          "framer-motion": "latest"
        },
        devDependencies: {
          tailwindcss: "latest",
          autoprefixer: "latest",
          postcss: "latest"
        }
      },
      null,
      2
    )
  };

  // Use Tailwind config only if template is react
  const files = template === "react" ? tailwindFiles : { "/App.js": code };

  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [providerKey, setProviderKey] = useState(0);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(
    historyIndex ?? 0
  );
  const [currentCode, setCurrentCode] = useState(code);

  // Sync code/historyIndex from props
  useEffect(() => {
    setCurrentCode(code);
    if (typeof historyIndex === "number") setCurrentHistoryIndex(historyIndex);
  }, [code, historyIndex]);

  // Reset provider when code changes
  useEffect(() => {
    setProviderKey((k) => k + 1);
  }, [currentCode]);

  // Reset provider when switching to preview to force re-render
  useEffect(() => {
    if (activeTab === "preview") {
      setProviderKey((k) => k + 1);
    }
  }, [activeTab]);

  // Change version handler
  const handleChangeVersion = (idx: number) => {
    if (codeHistory && codeHistory[idx]) {
      setCurrentHistoryIndex(idx);
      setCurrentCode(codeHistory[idx]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg">
      {/* Tabs with smooth transitions */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 h-12">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2 rounded font-semibold text-base transition-all duration-200 ${
              activeTab === "code"
                ? "bg-zinc-800 text-white"
                : "bg-transparent text-zinc-400 hover:text-zinc-300"
            } border-none outline-none`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 rounded font-semibold text-base transition-all duration-200 ${
              activeTab === "preview"
                ? "bg-zinc-800 text-white"
                : "bg-transparent text-zinc-400 hover:text-zinc-300"
            } border-none outline-none ml-2`}
          >
            Preview
          </button>
        </div>
        <div className="flex items-center gap-2">
          {codeHistory && codeHistory.length > 1 && (
            <select
              className="bg-zinc-800 text-zinc-100 rounded px-2 py-1 border border-zinc-700 focus:outline-none focus:ring transition-all duration-200"
              value={currentHistoryIndex}
              onChange={(e) => handleChangeVersion(Number(e.target.value))}
              title="Choose version code"
            >
              {codeHistory.map((_, idx) => (
                <option key={idx} value={idx}>
                  v{idx + 1}
                </option>
              ))}
            </select>
          )}
          <button
            className="text-zinc-400 hover:text-white text-2xl font-bold px-2 transition-colors duration-200"
            onClick={onClose ? onClose : () => setShowPreview(false)}
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
      </div>

      {/* Layout with fade transition */}
      {showPreview && (
        <div className="flex-1 relative overflow-hidden">
          <SandpackProvider
            key={providerKey}
            files={
              template === "react"
                ? { ...tailwindFiles, "/App.js": currentCode }
                : { "/App.js": currentCode }
            }
            template="react"
            theme="light"
            options={{
              externalResources: ["https://cdn.tailwindcss.com"],
              autoReload: true,
              autorun: true
            }}
          >
            <div
              style={{
                display: "flex",
                height: "100%",
                minHeight: 0,
                opacity: 1,
                transform: "translateY(0)",
                transition: "opacity 0.2s ease, transform 0.2s ease"
              }}
            >
              {/* File Explorer with smooth width transition */}
              <div
                style={{
                  width: activeTab === "code" ? 220 : 0,
                  minWidth: activeTab === "code" ? 180 : 0,
                  height: "100%",
                  background: "#18181b",
                  borderRight:
                    activeTab === "code" ? "1px solid #27272a" : "none",
                  transition:
                    "width 0.25s ease-in-out, min-width 0.25s ease-in-out, border-right 0.25s ease-in-out",
                  overflow: "hidden",
                  transform:
                    activeTab === "code" ? "translateX(0)" : "translateX(-100%)"
                }}
              >
                {activeTab === "code" && (
                  <SandpackFileExplorer
                    style={{
                      height: "100%",
                      width: "220px",
                      background: "#18181b"
                    }}
                  />
                )}
              </div>

              {/* Main content area */}
              <div style={{ flex: 1, height: "100%", position: "relative" }}>
                {activeTab === "code" ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      opacity: 1,
                      transform: "translateX(0)",
                      transition: "opacity 0.2s ease, transform 0.2s ease"
                    }}
                  >
                    <SandpackCodeEditor
                      closableTabs
                      showTabs
                      wrapContent
                      style={{ height: "85vh", background: "#18181b" }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      opacity: 1,
                      transform: "translateX(0)",
                      transition: "opacity 0.2s ease, transform 0.2s ease"
                    }}
                  >
                    <SandpackPreview
                      style={{ height: "85vh", background: "#18181b" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </SandpackProvider>
        </div>
      )}
    </div>
  );
};

export default SandpackPreviewContainer;
