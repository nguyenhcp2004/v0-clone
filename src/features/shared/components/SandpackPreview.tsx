import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackPreview
} from "@codesandbox/sandpack-react";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { dracula } from "@codesandbox/sandpack-themes";
// import { useSandpackNavigation } from "@codesandbox/sandpack-react";

interface SandpackPreviewContainerProps {
  code: string;
  template?: "react" | "vanilla" | "static";
}

const SandpackPreviewContainer: FC<SandpackPreviewContainerProps> = ({
  code,
  template = "react"
}) => {
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

  // Ensure /App.js is always the open file when code changes
  // (Not supported in current Sandpack version, so skip)

  return (
    <div
      style={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        background: "#18181b",
        borderRadius: 8
      }}
    >
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #27272a",
          padding: "0 1rem",
          alignItems: "center",
          height: 48
        }}
      >
        <button
          onClick={() => setActiveTab("code")}
          style={{
            background: activeTab === "code" ? "#27272a" : "transparent",
            color: activeTab === "code" ? "#fff" : "#a1a1aa",
            border: "none",
            outline: "none",
            padding: "8px 20px",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          style={{
            background: activeTab === "preview" ? "#27272a" : "transparent",
            color: activeTab === "preview" ? "#fff" : "#a1a1aa",
            border: "none",
            outline: "none",
            padding: "8px 20px",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 16,
            marginLeft: 8,
            cursor: "pointer"
          }}
        >
          Preview
        </button>
      </div>
      {/* Layout */}
      <SandpackProvider
        key={code}
        files={files}
        template="react"
        theme="light"
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
          autoReload: true
        }}
      >
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <SandpackFileExplorer
            style={{
              height: "100%",
              width: 220,
              minWidth: 180,
              background: "#18181b",
              borderRight: "1px solid #27272a"
            }}
          />
          <div style={{ flex: 1, height: "100%" }}>
            {activeTab === "code" ? (
              <SandpackCodeEditor
                closableTabs
                showTabs
                wrapContent
                style={{ height: "90vh", background: "#18181b" }}
              />
            ) : (
              <SandpackPreview
                style={{ height: "90vh", background: "#18181b" }}
              />
            )}
          </div>
        </div>
      </SandpackProvider>
    </div>
  );
};

export default SandpackPreviewContainer;
