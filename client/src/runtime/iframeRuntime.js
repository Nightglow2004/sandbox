export function runIframeRuntime(files) {
    // FIND HTML FILE
    const htmlFile = Object.keys(files).find((file) =>
        file.endsWith(".html"),
    );

    // FIND CSS FILES
    const cssFiles = Object.keys(files).filter((file) =>
        file.endsWith(".css"),
    );

    // FIND JS FILES
    const jsFiles = Object.keys(files).filter((file) =>
        file.endsWith(".js"),
    );

    // COMBINE CSS
    const combinedCSS = cssFiles
        .map((file) => files[file] || "")
        .join("\n");

    // COMBINE JS
    const combinedJS = jsFiles
        .map((file) => files[file] || "")
        .join("\n");

    // BUILD RUNTIME DOCUMENT
    const srcDoc = `
    ${files[htmlFile] || ""}

    <style>
      ${combinedCSS}
    </style>

    <script>
      ${combinedJS}
    </script>
  `;

    return srcDoc;
}