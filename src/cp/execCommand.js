import { spawn } from "node:child_process";

const execCommand = () => {
  const commandString = process.argv[2];

  if (!commandString) {
    console.error("No command provided.");
    process.exit(1);
  }

  const parts = commandString.split(" ");
  const command = parts[0];
  const args = parts.slice(1);

  const child = spawn(command, args, {
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
    shell: false,
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on("close", (code) => {
    process.exit(code ?? 0);
  });

  child.on("error", (err) => {
    console.error(err.message);
    process.exit(1);
  });
};

execCommand();
