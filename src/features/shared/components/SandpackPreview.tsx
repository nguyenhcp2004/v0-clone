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
  const [providerKey, setProviderKey] = useState(0);

  // Reset provider khi code thay đổi
  useEffect(() => {
    setProviderKey((k) => k + 1);
  }, [code]);

  // Reset provider khi switch sang preview để force re-render
  useEffect(() => {
    if (activeTab === "preview") {
      setProviderKey((k) => k + 1);
    }
  }, [activeTab]);

  console.log("Active tab:", activeTab, code);

  return (
    <div
      style={{
        height: "100%",
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
        key={providerKey} // Luôn sử dụng providerKey để đảm bảo đồng bộ
        files={files}
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
    </div>
  );
};

export default SandpackPreviewContainer;
