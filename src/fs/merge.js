import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const merge = async () => {
  const workspacePath = path.resolve("./src/fs/files");
  const partsPath = path.join(workspacePath, "parts");
  const outputFile = path.join(workspacePath, "merged.txt");

  // check parts folder
  try {
    const s = await stat(partsPath);
    if (!s.isDirectory()) throw new Error();
  } catch {
    throw new Error("FS operation failed");
  }

  const args = process.argv.slice(2);
  const filesIndex = args.indexOf("--files");

  let files = [];

  if (filesIndex !== -1 && args[filesIndex + 1]) {
    // manual file list
    files = args[filesIndex + 1].split(",");

    for (const file of files) {
      try {
        await stat(path.join(partsPath, file));
      } catch {
        throw new Error("FS operation failed");
      }
    }
  } else {
    // automatic discovery
    const items = await readdir(partsPath);
    files = items.filter((f) => path.extname(f) === ".txt").sort();

    if (files.length === 0) {
      throw new Error("FS operation failed");
    }
  }

  let mergedContent = "";

  for (const file of files) {
    const content = await readFile(path.join(partsPath, file), "utf8");
    mergedContent += content;
  }

  await writeFile(outputFile, mergedContent);
};

await merge();
