import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const decompressDir = async () => {
  const compressedDir = path.resolve("./src/zip/compressed");
  const archivePath = path.join(compressedDir, "archive.br");
  const destDir = path.resolve("./src/zip/decompressed");

  try {
    const stats = await stat(compressedDir);
    if (!stats.isDirectory()) throw new Error();
    await stat(archivePath);
  } catch {
    throw new Error("FS operation failed");
  }

  await mkdir(destDir, { recursive: true });

  const input = createReadStream(archivePath);
  const brotli = zlib.createBrotliDecompress();

  let leftover = "";
  let currentFile = null;
  let remainingBytes = 0;
  let buffers = [];

  const processChunk = (chunk) => {
    let data = leftover + chunk.toString("binary");
    let index = 0;

    while (index < data.length) {
      if (!currentFile) {
        const newline1 = data.indexOf("\n", index);
        if (newline1 === -1) break;
        const headerLine = data.slice(index, newline1);
        if (!headerLine.startsWith("FILE:")) {
          throw new Error("Invalid archive format");
        }
        const relPath = headerLine.slice(5);
        index = newline1 + 1;

        const newline2 = data.indexOf("\n", index);
        if (newline2 === -1) break;
        const sizeLine = data.slice(index, newline2);
        const size = Number(sizeLine);
        if (isNaN(size)) throw new Error("Invalid archive format");
        index = newline2 + 1;

        currentFile = relPath;
        remainingBytes = size;
        buffers = [];
      }

      const available = data.length - index;
      const toRead = Math.min(remainingBytes, available);
      buffers.push(Buffer.from(data.slice(index, index + toRead), "binary"));
      index += toRead;
      remainingBytes -= toRead;

      if (remainingBytes === 0) {
        const fullBuffer = Buffer.concat(buffers);
        const filePath = path.join(destDir, currentFile);
        mkdir(path.dirname(filePath), { recursive: true }).then(() =>
          writeFile(filePath, fullBuffer)
        );
        currentFile = null;
        buffers = [];
      }
    }

    leftover = data.slice(index);
  };

  brotli.on("data", processChunk);

  await new Promise((resolve, reject) => {
    brotli.on("end", resolve);
    brotli.on("error", reject);
    input.pipe(brotli);
  });
};

await decompressDir();
