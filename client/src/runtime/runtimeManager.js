import { runIframeRuntime } from "./iframeRuntime";

export async function executeProject(files, projectType) {
  switch (projectType) {
    case "react":
      console.log("React runtime coming soon...");
      return "";

    case "vanilla":
    default:
      return runIframeRuntime(files);
  }
}