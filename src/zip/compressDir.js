import { createWriteStream, createReadStream } from "node:fs";
import { mkdir, stat, readdir } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const compressDir = async () => {
  const sourceDir = path.resolve("./src/zip/compress");
  const destDir = path.resolve("./src/zip/compressed");
  const archivePath = path.join(destDir, "archive.br");

  try {
    const s = await stat(sourceDir);
    if (!s.isDirectory()) throw new Error();
  } catch {
    throw new Error("FS operation failed");
  }

  await mkdir(destDir, { recursive: true });

  const getFiles = async (dir, base = "") => {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(base, entry.name);

      if (entry.isDirectory()) {
        files.push(...(await getFiles(fullPath, relPath)));
      } else if (entry.isFile()) {
        files.push({ fullPath, relPath });
      }
    }
    return files;
  };

  const files = await getFiles(sourceDir);

  const brotli = zlib.createBrotliCompress();
  const output = createWriteStream(archivePath);

  const writeArchive = async () => {
    for (const { fullPath, relPath } of files) {
      const stats = await stat(fullPath);
      const header = `FILE:${relPath}\n${stats.size}\n`;
      if (!brotli.write(header)) {
        await new Promise((r) => brotli.once("drain", r));
      }

      const fileStream = createReadStream(fullPath);
      await new Promise((resolve, reject) => {
        fileStream.pipe(brotli, { end: false });
        fileStream.on("end", resolve);
        fileStream.on("error", reject);
      });
    }
    brotli.end();
  };

  await Promise.all([
    writeArchive(),
    new Promise((r, e) => output.on("close", r).on("error", e)),
  ]);

  brotli.pipe(output);
};

await compressDir();
