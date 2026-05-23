export const reactTemplate = {
  "package.json": {
  file: {
    contents: JSON.stringify({
      name: "sandbox-react-app",

      private: true,

      version: "0.0.0",

      scripts: {
        dev: "vite",
      },

      dependencies: {
        react: "18.2.0",
        "react-dom": "18.2.0",
      },

      devDependencies: {
        vite: "4.5.0",
        "@vitejs/plugin-react": "4.0.3",
      },
    }),
  },
},

  "index.html": {
    file: {
      contents: `
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
    },
  },

  src: {
    directory: {
      "main.jsx": {
        file: {
          contents: `
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
`,
        },
      },

      "App.jsx": {
        file: {
          contents: `
export default function App() {
  return (
    <div
      style={{
        padding: 40,
        fontFamily: "sans-serif"
      }}
    >
      <h1>React Sandbox Running 🚀</h1>
    </div>
  );
}
`,
        },
      },
    },
  },
};