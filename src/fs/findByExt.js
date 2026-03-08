import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const findByExt = async () => {
  const workspacePath = path.resolve("./src/fs/files");

  // Parse CLI args
  const args = process.argv.slice(2);
  const extIndex = args.indexOf("--ext");
  let extension = ".txt";

  if (extIndex !== -1 && args[extIndex + 1]) {
    extension = args[extIndex + 1].startsWith(".")
      ? args[extIndex + 1]
      : `.${args[extIndex + 1]}`;
  }

  // Check workspace existence
  try {
    const stats = await stat(workspacePath);
    if (!stats.isDirectory()) throw new Error();
  } catch {
    throw new Error("FS operation failed");
  }

  const results = [];

  const scan = async (dir) => {
    const items = await readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const itemStat = await stat(fullPath);

      if (itemStat.isDirectory()) {
        await scan(fullPath);
      } else if (itemStat.isFile() && path.extname(item) === extension) {
        const relativePath = path.relative(workspacePath, fullPath);
        results.push(relativePath);
      }
    }
  };

  await scan(workspacePath);

  results.sort();

  for (const file of results) {
    console.log(file);
  }
};

await findByExt();
