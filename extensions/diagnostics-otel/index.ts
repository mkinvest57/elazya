import type { MoltbotPluginApi } from "alize/plugin-sdk";
import { emptyPluginConfigSchema } from "alize/plugin-sdk";

import { createDiagnosticsOtelService } from "./src/service.js";

const plugin = {
  id: "diagnostics-otel",
  name: "Diagnostics OpenTelemetry",
  description: "Export diagnostics events to OpenTelemetry",
  configSchema: emptyPluginConfigSchema(),
  register(api: MoltbotPluginApi) {
    api.registerService(createDiagnosticsOtelService());
  },
};

export default plugin;
