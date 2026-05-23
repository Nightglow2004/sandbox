import { WebContainer } from "@webcontainer/api";
import { reactTemplate } from "./reactTemplate";

import { convertToWebContainerFS } from "./fileSystemMapper";

let webcontainerInstance = null;

let bootPromise = null;

export async function getWebContainer() {
    if (webcontainerInstance) {
        return webcontainerInstance;
    }

    if (bootPromise) {
        return bootPromise;
    }

    try {
        bootPromise = WebContainer.boot();

        webcontainerInstance = await bootPromise;

        return webcontainerInstance;
    } catch (error) {
        console.error("WebContainer boot failed:", error);

        bootPromise = null;

        throw error;
    }
}

export async function mountFiles(files) {
    const webcontainer = await getWebContainer();

    const fileSystemTree =
        convertToWebContainerFS(files);

    await webcontainer.mount(fileSystemTree);

    console.log("Files mounted successfully");
}

export async function startReactDevServer() {
    const webcontainer = await getWebContainer();

    // MOUNT TEMPLATE
    await webcontainer.mount(reactTemplate);

    console.log("React template mounted");

    // INSTALL PACKAGES
    const installProcess =
  await webcontainer.spawn("pnpm", [
    "install",
  ]);

  
  
    installProcess.output.pipeTo(
        new WritableStream({
            write(data) {
                console.log(data);
            },
        }),
    );

    const installExitCode =
        await installProcess.exit;

    if (installExitCode !== 0) {
        throw new Error("npm install failed");
    }

    console.log("Dependencies installed");

    // START VITE DEV SERVER
    const devProcess =
        await webcontainer.spawn("npm", ["run", "dev"]);

    devProcess.output.pipeTo(
        new WritableStream({
            write(data) {
                console.log(data);
            },
        }),
    );

    // WAIT FOR SERVER
    webcontainer.on("server-ready", (port, url) => {
        console.log("Dev server ready:", url);

        window.dispatchEvent(
            new CustomEvent("sandbox-ready", {
                detail: { url },
            }),
        );
    });
}