import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
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

    // DEFAULT FILES
    return defaultFiles;
  });

  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);

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

  // CURRENT OPEN FILE
  const [activeFile, setActiveFile] = useState("/src/index.html");

  const [currentProjectName, setCurrentProjectName] =
    useState("Untitled Project");

  // FOLDER OPEN/CLOSE STATE
  const [openFolders, setOpenFolders] = useState({
    src: true,
    styles: true,
    scripts: true,
  });

  // AUTO SAVE FILES
  useEffect(() => {
    localStorage.setItem("sandbox-files", JSON.stringify(files));
  }, [files]);

  // DETECT LANGUAGE
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

  // BUILD LIVE PREVIEW DOCUMENT
  // GET HTML FILE
  const htmlFile = Object.keys(files).find((file) => file.endsWith(".html"));

  // GET ALL CSS FILES
  const cssFiles = Object.keys(files).filter((file) => file.endsWith(".css"));

  // GET ALL JS FILES
  const jsFiles = Object.keys(files).filter((file) => file.endsWith(".js"));

  // COMBINE CSS
  const combinedCSS = cssFiles.map((file) => files[file]).join("\n");

  // COMBINE JS
  const combinedJS = jsFiles.map((file) => files[file]).join("\n");

  // BUILD LIVE DOCUMENT
  const srcDoc = `
${files[htmlFile] || ""}

<style>
${combinedCSS}
</style>

<script>
${combinedJS}
</script>
`;

  // DELETE FILE
  const deleteFile = (fileToDelete) => {
    // PREVENT MAIN HTML DELETE
    if (fileToDelete === "/src/index.html") {
      alert("Cannot delete main HTML file.");

      return;
    }

    const updatedFiles = {
      ...files,
    };

    delete updatedFiles[fileToDelete];

    setFiles(updatedFiles);

    // FALLBACK ACTIVE FILE
    if (activeFile === fileToDelete) {
      setActiveFile("/src/index.html");
    }
  };

  // RESET SANDBOX
  const resetSandbox = () => {
    localStorage.clear();

    window.location.reload();
  };

  const handleSaveProject = async () => {
    try {
      // UPDATE EXISTING PROJECT
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

        console.log("Project Updated:", updatedProject);

        alert("Project updated!");

        return;
      }

      // CREATE NEW PROJECT
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

      console.log("Project Created:", savedProject);

      alert("Project created!");
    } catch (error) {
      console.error("Save failed:", error);

      alert("Failed to save project.");
    }
  };

  const handleLoadProject = async (id) => {
    try {
      const project = await getProjectById(id);

      setFiles(project.files);

      setActiveFile(Object.keys(project.files)[0]);

      setCurrentProjectId(id);

      setCurrentProjectName(project.name);

      console.log("Project Loaded:", project);

      alert("Project loaded!");
    } catch (error) {
      console.error("Load failed:", error);

      alert("Failed to load project.");
    }
  };

  const handleNewProject = () => {
    setFiles(defaultFiles);

    setActiveFile("/src/index.html");

    setCurrentProjectId(null);

    setCurrentProjectName("Untitled Project");

    localStorage.removeItem("sandbox-files");

    console.log("New project started");

    alert("New project created!");
  };

  const handleDeleteProject = async (id) => {
    try {
      const confirmed = window.confirm("Delete this project?");

      if (!confirmed) return;

      await deleteProject(id);

      setProjects((prevProjects) =>
        prevProjects.filter((project) => project._id !== id),
      );

      // RESET IF CURRENT PROJECT DELETED
      if (currentProjectId === id) {
        setCurrentProjectId(null);

        setCurrentProjectName("Untitled Project");

        setFiles(defaultFiles);

        setActiveFile("/src/index.html");
      }

      alert("Project deleted!");
    } catch (error) {
      console.error("Delete failed:", error);

      alert("Failed to delete project.");
    }
  };

  // GROUP FILES INTO FOLDERS
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
      {/* FILE PANEL */}
      <div
        style={{
          borderRight: "1px solid gray",

          padding: "10px",

          background: "#f4f4f4",

          overflowY: "auto",
        }}
      >
        <h3>FILES</h3>
        <h3>PROJECTS</h3>

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

        {/* CREATE FILE */}
        <button
          onClick={() => {
            const fileName = prompt(
              "Enter full file path (example: /src/test.js)",
            );

            if (!fileName) return;

            // PREVENT OVERWRITE
            if (files[fileName]) {
              alert("File already exists!");

              return;
            }

            setFiles({
              ...files,
              [fileName]: "",
            });

            setActiveFile(fileName);
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

        {/* RESET BUTTON */}
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

        {/* FOLDER TREE */}
        {Object.keys(groupedFiles).map((folder) => (
          <div key={folder}>
            {/* FOLDER HEADER */}
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
                  {/* FILE NAME */}
                  <span
                    onClick={() => setActiveFile(file.fullPath)}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    {file.fileName}
                  </span>

                  {/* DELETE */}
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
        }}
      >
        {/* ACTIVE FILE HEADER */}
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

        <Editor
          height="95vh"
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

      {/* PREVIEW PANEL */}
      <div
        style={{
          height: "100vh",
          background: "white",
        }}
      >
        <iframe
          srcDoc={srcDoc}
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
