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

  // Reset provider khi code thay đổi
  useEffect(() => {
    setProviderKey((k) => k + 1);
  }, [currentCode]);

  // Reset provider khi switch sang preview để force re-render
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
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 h-12">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2 rounded font-semibold text-base ${
              activeTab === "code"
                ? "bg-zinc-800 text-white"
                : "bg-transparent text-zinc-400"
            } border-none outline-none`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 rounded font-semibold text-base ${
              activeTab === "preview"
                ? "bg-zinc-800 text-white"
                : "bg-transparent text-zinc-400"
            } border-none outline-none ml-2`}
          >
            Preview
          </button>
        </div>
        <div className="flex items-center gap-2">
          {codeHistory && codeHistory.length > 1 && (
            <select
              className="bg-zinc-800 text-zinc-100 rounded px-2 py-1 border border-zinc-700 focus:outline-none focus:ring"
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
            className="text-zinc-400 hover:text-white text-2xl font-bold px-2"
            onClick={onClose ? onClose : () => setShowPreview(false)}
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
      </div>

      {/* Layout */}
      {showPreview && (
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
          <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
            {activeTab === "code" && (
              <SandpackFileExplorer
                style={{
                  height: "100%",
                  width: 220,
                  minWidth: 180,
                  background: "#18181b",
                  borderRight: "1px solid #27272a"
                }}
              />
            )}
            <div style={{ flex: 1, height: "100%" }}>
              {activeTab === "code" ? (
                <SandpackCodeEditor
                  closableTabs
                  showTabs
                  wrapContent
                  style={{ height: "85vh", background: "#18181b" }}
                />
              ) : (
                <SandpackPreview
                  style={{ height: "85vh", background: "#18181b" }}
                />
              )}
            </div>
          </div>
        </SandpackProvider>
      )}
    </div>
  );
};

export default SandpackPreviewContainer;
