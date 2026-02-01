import type { MoltbotPluginApi } from "alize/plugin-sdk";
import { emptyPluginConfigSchema } from "alize/plugin-sdk";

import { telegramPlugin } from "./src/channel.js";
import { setTelegramRuntime } from "./src/runtime.js";

const plugin = {
  id: "telegram",
  name: "Telegram",
  description: "Telegram channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: MoltbotPluginApi) {
    setTelegramRuntime(api.runtime);
    // Register global handler for unified webhook routing
    api.registerHttpHandler(api.runtime.channel.telegram.handleWebhookRequest);
    api.registerChannel({ plugin: telegramPlugin });
  },
};

export default plugin;
