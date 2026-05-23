import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { executeProject } from "./runtime/runtimeManager";
import { getWebContainer } from "./runtime/webcontainerRuntime";
import { mountFiles } from "./runtime/webcontainerRuntime";
import { startReactDevServer } from "./runtime/webcontainerRuntime";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "./services/projectApi";

const defaultFiles = {
  "/src/index.html": `
<!DOCTYPE html>
<html>

<body>

  <h1>Hello Sandbox</h1>

  <button onclick="changeText()">
    Click Me
  </button>

</body>

</html>
`,

  "/styles/styles.css": `
body {
  background: black;
  color: white;
  font-family: sans-serif;
  padding: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}
`,

  "/scripts/script.js": `
function changeText() {

  document.querySelector("h1").innerText =
    "Sandbox Running!";
}

console.log("Sandbox Running");
`,
};

function App() {
  // VIRTUAL FILE SYSTEM
  const [files, setFiles] = useState(() => {
    const savedFiles = localStorage.getItem("sandbox-files");

    if (savedFiles) {
      return JSON.parse(savedFiles);
    }

    return defaultFiles;
  });

  // PROJECT STATE
  const [projects, setProjects] = useState([]);

  const [currentProjectId, setCurrentProjectId] = useState(null);

  const [currentProjectName, setCurrentProjectName] =
    useState("Untitled Project");

  const [reactUrl, setReactUrl] = useState("");

  const [srcDoc, setSrcDoc] = useState("");
  useEffect(() => {
    const buildPreview = async () => {
      const result = await executeProject(files, "vanilla");

      setSrcDoc(result);
    };

    buildPreview();
  }, [files]);

  // ACTIVE FILE
  const [activeFile, setActiveFile] = useState("/src/index.html");

  // OPEN TABS
  const [openTabs, setOpenTabs] = useState(["/src/index.html"]);

  // FOLDER STATE
  const [openFolders, setOpenFolders] = useState({
    src: true,
    styles: true,
    scripts: true,
  });

  // LOAD PROJECTS
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();

        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // LOCAL STORAGE SAVE
  useEffect(() => {
    localStorage.setItem("sandbox-files", JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    const initContainer = async () => {
      const wc = await getWebContainer();

      console.log("WebContainer Booted:", wc);
    };

    initContainer();
  }, []);

  useEffect(() => {
    const testMount = async () => {
      await mountFiles(files);
    };

    testMount();
  }, []);

  useEffect(() => {
    const handler = (event) => {
      setReactUrl(event.detail.url);
    };

    window.addEventListener("sandbox-ready", handler);

    return () => {
      window.removeEventListener("sandbox-ready", handler);
    };
  }, []);

  // LANGUAGE DETECTION
  const getLanguage = () => {
    if (activeFile.endsWith(".html")) {
      return "html";
    }

    if (activeFile.endsWith(".css")) {
      return "css";
    }

    if (activeFile.endsWith(".js")) {
      return "javascript";
    }

    return "plaintext";
  };

  // OPEN FILE
  const openFile = (filePath) => {
    setActiveFile(filePath);

    if (!openTabs.includes(filePath)) {
      setOpenTabs([...openTabs, filePath]);
    }
  };

  // CLOSE TAB
  const closeTab = (e, filePath) => {
    e.stopPropagation();

    // PREVENT CLOSING LAST TAB
    if (openTabs.length === 1) {
      return;
    }

    const updatedTabs = openTabs.filter((tab) => tab !== filePath);

    setOpenTabs(updatedTabs);

    // ACTIVE TAB FALLBACK
    if (activeFile === filePath) {
      setActiveFile(updatedTabs[0]);
    }
  };

  // DELETE FILE
  const deleteFile = (fileToDelete) => {
    if (fileToDelete === "/src/index.html") {
      alert("Cannot delete main HTML file.");

      return;
    }

    const updatedFiles = {
      ...files,
    };

    delete updatedFiles[fileToDelete];

    setFiles(updatedFiles);

    // REMOVE CLOSED TAB
    setOpenTabs(openTabs.filter((tab) => tab !== fileToDelete));

    // ACTIVE FILE FALLBACK
    if (activeFile === fileToDelete) {
      setActiveFile("/src/index.html");
    }
  };

  const renameFile = (oldPath) => {
    const newPath = prompt("Enter new file path:", oldPath);

    if (!newPath) return;

    // PREVENT DUPLICATES
    if (files[newPath]) {
      alert("File already exists!");

      return;
    }

    const updatedFiles = {
      ...files,
    };

    updatedFiles[newPath] = updatedFiles[oldPath];

    delete updatedFiles[oldPath];
    setFiles(updatedFiles);

    // UPDATE ACTIVE FILE
    if (activeFile === oldPath) {
      setActiveFile(newPath);
    }

    // UPDATE OPEN TABS
    setOpenTabs(openTabs.map((tab) => (tab === oldPath ? newPath : tab)));
  };

  // RESET SANDBOX
  const resetSandbox = () => {
    localStorage.clear();

    window.location.reload();
  };

  // SAVE PROJECT
  const handleSaveProject = async () => {
    try {
      // UPDATE PROJECT
      if (currentProjectId) {
        const updatedProject = await updateProject(currentProjectId, {
          files,
        });

        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project._id === currentProjectId ? updatedProject : project,
          ),
        );

        setCurrentProjectName(updatedProject.name);

        alert("Project updated!");

        return;
      }

      // CREATE PROJECT
      const projectName = prompt("Enter project name:");

      if (!projectName) return;

      const projectData = {
        name: projectName,
        files,
      };

      const savedProject = await createProject(projectData);

      setProjects((prevProjects) => [savedProject, ...prevProjects]);

      setCurrentProjectId(savedProject._id);

      setCurrentProjectName(savedProject.name);

      alert("Project created!");
    } catch (error) {
      console.error("Save failed:", error);

      alert("Failed to save project.");
    }
  };

  // LOAD PROJECT
  const handleLoadProject = async (id) => {
    try {
      const project = await getProjectById(id);

      setFiles(project.files);

      const firstFile = Object.keys(project.files)[0];

      setActiveFile(firstFile);

      setOpenTabs([firstFile]);

      setCurrentProjectId(id);

      setCurrentProjectName(project.name);

      alert("Project loaded!");
    } catch (error) {
      console.error("Load failed:", error);

      alert("Failed to load project.");
    }
  };

  // NEW PROJECT
  const handleNewProject = () => {
    setFiles(defaultFiles);

    setActiveFile("/src/index.html");

    setOpenTabs(["/src/index.html"]);

    setCurrentProjectId(null);

    setCurrentProjectName("Untitled Project");

    localStorage.removeItem("sandbox-files");

    alert("New project created!");
  };

  // DELETE PROJECT
  const handleDeleteProject = async (id) => {
    try {
      const confirmed = window.confirm("Delete this project?");

      if (!confirmed) return;

      await deleteProject(id);

      setProjects((prevProjects) =>
        prevProjects.filter((project) => project._id !== id),
      );

      // RESET IF ACTIVE PROJECT DELETED
      if (currentProjectId === id) {
        setCurrentProjectId(null);

        setCurrentProjectName("Untitled Project");

        setFiles(defaultFiles);

        setOpenTabs(["/src/index.html"]);

        setActiveFile("/src/index.html");
      }

      alert("Project deleted!");
    } catch (error) {
      console.error("Delete failed:", error);

      alert("Failed to delete project.");
    }
  };

  // GROUP FILES
  const groupedFiles = {};

  Object.keys(files).forEach((filePath) => {
    const parts = filePath.split("/");

    const folder = parts.length > 2 ? parts[1] : "root";

    const fileName = parts.length > 2 ? parts[2] : parts[1];

    if (!groupedFiles[folder]) {
      groupedFiles[folder] = [];
    }

    groupedFiles[folder].push({
      fullPath: filePath,
      fileName,
    });
  });

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",

        gridTemplateColumns: "250px minmax(300px, 45%) minmax(300px, 55%)",

        overflow: "hidden",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          borderRight: "1px solid gray",

          padding: "10px",

          background: "#f4f4f4",

          overflowY: "auto",
        }}
      >
        <button onClick={startReactDevServer}>Start React Runtime</button>
        <h3>PROJECTS</h3>

        {/* PROJECT LIST */}
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          {projects.length === 0 && <p>No saved projects yet.</p>}

          {projects.map((project) => (
            <div
              key={project._id}
              style={{
                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                padding: "8px",

                background: currentProjectId === project._id ? "#333" : "#ddd",

                color: currentProjectId === project._id ? "white" : "black",

                marginBottom: "5px",
              }}
            >
              <span
                onClick={() => handleLoadProject(project._id)}
                style={{
                  cursor: "pointer",

                  flex: 1,
                }}
              >
                {project.name}
              </span>

              <button
                onClick={() => handleDeleteProject(project._id)}
                style={{
                  background: "red",

                  color: "white",

                  border: "none",

                  cursor: "pointer",

                  padding: "2px 8px",
                }}
              >
                X
              </button>
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <button
          onClick={handleNewProject}
          style={{
            marginBottom: "10px",

            padding: "8px",

            cursor: "pointer",

            width: "100%",

            background: "#22aa44",

            color: "white",

            border: "none",
          }}
        >
          New Project
        </button>

        <button
          onClick={handleSaveProject}
          style={{
            marginBottom: "10px",

            padding: "8px",

            cursor: "pointer",

            width: "100%",

            background: "#0078ff",

            color: "white",

            border: "none",
          }}
        >
          Save Project
        </button>

        {/* NEW FILE */}
        <button
          onClick={() => {
            const fileName = prompt(
              "Enter full file path (example: /src/test.js)",
            );

            if (!fileName) return;

            // PREVENT DUPLICATE
            if (files[fileName]) {
              alert("File already exists!");

              return;
            }

            setFiles({
              ...files,
              [fileName]: "",
            });

            openFile(fileName);
          }}
          style={{
            marginBottom: "10px",

            padding: "8px",

            cursor: "pointer",

            width: "100%",
          }}
        >
          + New File
        </button>

        {/* RESET */}
        <button
          onClick={resetSandbox}
          style={{
            marginBottom: "20px",

            padding: "8px",

            cursor: "pointer",

            width: "100%",

            background: "#222",

            color: "white",

            border: "none",
          }}
        >
          Reset Sandbox
        </button>

        {/* FILE TREE */}
        <h3>FILES</h3>

        {Object.keys(groupedFiles).map((folder) => (
          <div key={folder}>
            {/* FOLDER */}
            <div
              onClick={() => {
                setOpenFolders({
                  ...openFolders,

                  [folder]: !openFolders[folder],
                });
              }}
              style={{
                fontWeight: "bold",

                cursor: "pointer",

                padding: "8px",

                background: "#ddd",

                marginTop: "10px",
              }}
            >
              {openFolders[folder] ? "📂" : "📁"} {folder}
            </div>

            {/* FILES */}
            {openFolders[folder] &&
              groupedFiles[folder].map((file) => (
                <div
                  key={file.fullPath}
                  style={{
                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "center",

                    padding: "8px 8px 8px 20px",

                    background:
                      activeFile === file.fullPath ? "#333" : "transparent",

                    color: activeFile === file.fullPath ? "white" : "black",
                  }}
                >
                  <span
                    onClick={() => openFile(file.fullPath)}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    {file.fileName}
                  </span>
                  <button
                    onClick={() => renameFile(file.fullPath)}
                    style={{
                      background: "orange",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px 6px",
                      marginRight: "5px",
                    }}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteFile(file.fullPath)}
                    style={{
                      background: "red",

                      color: "white",

                      border: "none",

                      cursor: "pointer",

                      padding: "2px 6px",
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* EDITOR PANEL */}
      <div
        style={{
          borderRight: "1px solid gray",

          overflow: "hidden",

          display: "flex",

          flexDirection: "column",
        }}
      >
        {/* TAB BAR */}
        <div
          style={{
            display: "flex",

            background: "#252526",

            borderBottom: "1px solid #444",

            overflowX: "auto",
          }}
        >
          {openTabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveFile(tab)}
              style={{
                display: "flex",

                alignItems: "center",

                padding: "8px 12px",

                cursor: "pointer",

                background: activeFile === tab ? "#1e1e1e" : "#2d2d2d",

                color: "white",

                borderRight: "1px solid #444",

                minWidth: "120px",
              }}
            >
              <span
                style={{
                  flex: 1,
                }}
              >
                {tab.split("/").pop()}
              </span>

              <button
                onClick={(e) => closeTab(e, tab)}
                style={{
                  marginLeft: "8px",

                  background: "transparent",

                  color: "#aaa",

                  border: "none",

                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* HEADER */}
        <div
          style={{
            padding: "10px",

            background: "#1e1e1e",

            color: "white",

            borderBottom: "1px solid #444",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: "bold",

                marginBottom: "5px",
              }}
            >
              {currentProjectName}
            </div>

            <div
              style={{
                fontSize: "14px",

                opacity: 0.8,
              }}
            >
              {activeFile}
            </div>
          </div>
        </div>

        {/* MONACO */}
        <Editor
          height="100%"
          language={getLanguage()}
          value={files[activeFile] || ""}
          onChange={(value = "") => {
            setFiles({
              ...files,

              [activeFile]: value,
            });
          }}
          theme="vs-dark"
        />
      </div>

      {/* PREVIEW */}
      <div
        style={{
          height: "100vh",
          background: "white",
        }}
      >
        <iframe
          src={reactUrl || undefined}
          srcDoc={!reactUrl ? srcDoc : undefined}
          title="preview"
          sandbox="allow-scripts"
          width="100%"
          height="100%"
          style={{
            border: "none",
          }}
        />
      </div>
    </div>
  );
}

export default App;
