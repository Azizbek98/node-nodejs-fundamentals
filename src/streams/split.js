import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";

const split = async () => {
  const args = process.argv.slice(2);
  const index = args.indexOf("--lines");

  const maxLines =
    index !== -1 && args[index + 1] ? Number(args[index + 1]) : 10;

  let leftover = "";
  let lineCount = 0;
  let chunkIndex = 1;

  let writer = createWriteStream(`./src/streams/chunk_${chunkIndex}.txt`);

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");

      leftover = lines.pop();

      for (const line of lines) {
        if (lineCount === maxLines) {
          writer.end();
          chunkIndex++;
          writer = createWriteStream(`./src/streams/chunk_${chunkIndex}.txt`);
          lineCount = 0;
        }

        writer.write(line + "\n");
        lineCount++;
      }

      callback();
    },

    flush(callback) {
      if (leftover) {
        if (lineCount === maxLines) {
          writer.end();
          chunkIndex++;
          writer = createWriteStream(`chunk_${chunkIndex}.txt`);
          lineCount = 0;
        }

        writer.write(leftover + "\n");
      }

      writer.end();
      callback();
    },
  });

  const reader = createReadStream("./src/streams/source.txt");

  reader.pipe(transformer);
};

await split();
