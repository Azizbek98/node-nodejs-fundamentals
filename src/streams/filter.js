import { Transform } from "node:stream";

const filter = () => {
  const args = process.argv.slice(2);
  const patternIndex = args.indexOf("--pattern");

  const pattern =
    patternIndex !== -1 && args[patternIndex + 1] ? args[patternIndex + 1] : "";

  let leftover = "";

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");

      leftover = lines.pop(); // keep incomplete line

      const filtered = lines
        .filter((line) => line.includes(pattern))
        .join("\n");

      callback(null, filtered ? filtered + "\n" : "");
    },

    flush(callback) {
      if (leftover && leftover.includes(pattern)) {
        this.push(leftover + "\n");
      }
      callback();
    },
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

filter();
