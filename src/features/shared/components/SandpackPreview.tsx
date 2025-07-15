import {
  Sandpack,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider
} from "@codesandbox/sandpack-react";
import type { FC } from "react";
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

  return (
    <Sandpack
      theme={dracula}
      template={template}
      files={files}
      customSetup={
        template === "react"
          ? {
              dependencies: {
                tailwindcss: "latest",
                autoprefixer: "latest",
                postcss: "latest",
                "framer-motion": "latest"
              }
            }
          : undefined
      }
      options={{
        showNavigator: true,
        showTabs: true,
        showLineNumbers: true,
        wrapContent: true,
        autoReload: true,
        externalResources: ["https://cdn.tailwindcss.com"],
        resizablePanels: true,
        editorHeight: "90vh",
        editorWidthPercentage: 50
      }}
    />
    // <SandpackProvider
    //   files={files}
    //   theme="light"
    //   template="react"
    //   options={{
    //     externalResources: ["https://cdn.tailwindcss.com"]
    //   }}
    // >
    //   <SandpackLayout style={{ height: "90vh" }}>
    //     <SandpackFileExplorer style={{ height: "90vh", width: "20%" }} />
    //     <SandpackCodeEditor
    //       closableTabs
    //       showTabs
    //       wrapContent
    //       style={{ height: "90vh", width: "30%" }}
    //     />
    //     <SandpackPreview style={{ height: "90vh", width: "50%" }} />
    //   </SandpackLayout>
    // </SandpackProvider>
  );
};

export default SandpackPreviewContainer;
