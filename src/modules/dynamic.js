import path from "node:path";
import { pathToFileURL } from "node:url";

const dynamic = async () => {
  const pluginName = process.argv[2];

  if (!pluginName) {
    console.log("Plugin not found");
    process.exit(1);
  }

  try {
    const pluginPath = path.resolve(`./src/modules/plugins/${pluginName}.js`);
    const module = await import(pathToFileURL(pluginPath));

    const result = module.run();
    console.log(result);
  } catch {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
