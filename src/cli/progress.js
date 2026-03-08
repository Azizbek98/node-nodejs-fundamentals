const progress = () => {
  const args = process.argv.slice(2);

  const getArg = (name, def) => {
    const index = args.indexOf(name);
    if (index !== -1 && args[index + 1]) {
      return args[index + 1];
    }
    return def;
  };

  const duration = Number(getArg("--duration", 5000));
  const interval = Number(getArg("--interval", 100));
  const length = Number(getArg("--length", 30));
  const colorHex = getArg("--color", null);

  let colorStart = "";
  const colorEnd = "\x1b[0m";

  // Validate hex color
  if (colorHex && /^#([0-9a-fA-F]{6})$/.test(colorHex)) {
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);

    // ANSI 24-bit color
    colorStart = `\x1b[38;2;${r};${g};${b}m`;
  }

  const steps = Math.ceil(duration / interval);
  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep++;

    const percent = Math.min(Math.round((currentStep / steps) * 100), 100);
    const filledLength = Math.round((percent / 100) * length);
    const emptyLength = length - filledLength;

    const filledBarRaw = "█".repeat(filledLength);
    const filledBar = colorStart
      ? `${colorStart}${filledBarRaw}${colorEnd}`
      : filledBarRaw;

    const emptyBar = " ".repeat(emptyLength);

    const bar = `[${filledBar}${emptyBar}] ${percent}%`;

    process.stdout.write("\r" + bar);

    if (percent >= 100) {
      clearInterval(timer);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();
