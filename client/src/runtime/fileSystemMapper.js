export function convertToWebContainerFS(files) {
  const tree = {};

  Object.entries(files).forEach(([path, content]) => {
    const cleanPath = path.startsWith("/")
      ? path.slice(1)
      : path;

    const parts = cleanPath.split("/");

    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      const isFile = i === parts.length - 1;

      if (isFile) {
        current[part] = {
          file: {
            contents: content,
          },
        };
      } else {
        current[part] ??= {
          directory: {},
        };

        current = current[part].directory;
      }
    }
  });

  return tree;
}