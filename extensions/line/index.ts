import type { MoltbotPluginApi } from "alize/plugin-sdk";
import { emptyPluginConfigSchema } from "alize/plugin-sdk";

import { linePlugin } from "./src/channel.js";
import { registerLineCardCommand } from "./src/card-command.js";
import { setLineRuntime } from "./src/runtime.js";

const plugin = {
  id: "line",
  name: "LINE",
  description: "LINE Messaging API channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: MoltbotPluginApi) {
    setLineRuntime(api.runtime);
    api.registerChannel({ plugin: linePlugin });
    registerLineCardCommand(api);
  },
};

export default plugin;
