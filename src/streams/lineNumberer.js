import { Transform } from "node:stream";

const lineNumberer = () => {
  let lineNumber = 1;
  let leftover = "";

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");

      leftover = lines.pop(); // save incomplete line

      const numbered = lines
        .map((line) => `${lineNumber++} | ${line}`)
        .join("\n");

      callback(null, numbered + "\n");
    },

    flush(callback) {
      if (leftover) {
        this.push(`${lineNumber++} | ${leftover}\n`);
      }
      callback();
    },
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

lineNumberer();
