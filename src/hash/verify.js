import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const verify = async () => {
  let checksums;

  try {
    const data = await readFile("./src/hash/checksums.json", "utf8");
    checksums = JSON.parse(data);
  } catch {
    throw new Error("FS operation failed");
  }

  const calculateHash = (file) =>
    new Promise((resolve, reject) => {
      const hash = createHash("sha256");
      const stream = createReadStream(file);

      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });

  for (const [filename, expectedHash] of Object.entries(checksums)) {
    try {
      const actualHash = await calculateHash(filename);
      const result = actualHash === expectedHash ? "OK" : "FAIL";
      console.log(`${filename} — ${result}`);
    } catch {
      console.log(`${filename} — FAIL`);
    }
  }
};

await verify();
