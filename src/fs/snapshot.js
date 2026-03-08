import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const snapshot = async () => {
  const rootPath = path.resolve("./src/fs/files");

  try {
    const stats = await stat(rootPath);
    if (!stats.isDirectory()) {
      throw new Error();
    }
  } catch {
    throw new Error("FS operation failed");
  }

  const entries = [];

  const scan = async (dir) => {
    const items = await readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const itemStat = await stat(fullPath);
      const relativePath = path.relative(rootPath, fullPath);

      if (itemStat.isDirectory()) {
        entries.push({
          path: relativePath,
          type: "directory",
        });

        await scan(fullPath);
      } else if (itemStat.isFile()) {
        const buffer = await readFile(fullPath);

        entries.push({
          path: relativePath,
          type: "file",
          size: itemStat.size,
          content: buffer.toString("base64"),
        });
      }
    }
  };

  await scan(rootPath);

  const snapshotData = {
    rootPath,
    entries,
  };

  const snapshotPath = path.resolve("./src/fs/snapshot.json");

  await writeFile(snapshotPath, JSON.stringify(snapshotData, null, 2));
};

await snapshot();
