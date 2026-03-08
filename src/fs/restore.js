import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const restore = async () => {
  const snapshotPath = path.resolve("./src/fs/snapshot.json");
  const restorePath = path.resolve("./src/fs/workspace_restored");

  let snapshot;

  // Check snapshot.json
  try {
    const data = await readFile(snapshotPath, "utf8");
    snapshot = JSON.parse(data);
  } catch {
    throw new Error("FS operation failed");
  }

  // Ensure workspace_restored does NOT exist
  try {
    await stat(restorePath);
    throw new Error("FS operation failed");
  } catch (err) {
    if (err.message === "FS operation failed") throw err;
  }

  // Create root restore directory
  await mkdir(restorePath, { recursive: true });

  for (const entry of snapshot.entries) {
    const targetPath = path.join(restorePath, entry.path);

    if (entry.type === "directory") {
      await mkdir(targetPath, { recursive: true });
    }

    if (entry.type === "file") {
      const dir = path.dirname(targetPath);
      await mkdir(dir, { recursive: true });

      const buffer = Buffer.from(entry.content, "base64");
      await writeFile(targetPath, buffer);
    }
  }
};

await restore();
