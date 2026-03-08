import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

const interactive = () => {
  const rl = readline.createInterface({
    input,
    output,
    prompt: "> ",
  });

  function handleCommand(cmd) {
    const command = cmd.trim();

    switch (command) {
      case "uptime":
        console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
        break;

      case "cwd":
        console.log(process.cwd());
        break;

      case "date":
        console.log(new Date().toISOString());
        break;

      case "exit":
        console.log("Goodbye!");
        rl.close();
        return;

      case "":
        break;

      default:
        console.log("Unknown command");
    }

    rl.prompt();
  }

  rl.prompt();

  rl.on("line", handleCommand);

  rl.on("close", () => {
    console.log("Goodbye!");
    process.exit(0);
  });

  // Handle Ctrl+C
  rl.on("SIGINT", () => {
    console.log("Goodbye!");
    rl.close();
  });
};

interactive();
