import { loadConfig } from "./dist/config/io.js";
console.log("Calling loadConfig...");
try {
    const cfg = loadConfig();
    console.log("Config loaded:", JSON.stringify(cfg, null, 2));
} catch (e) {
    console.error("Error loading config:", e);
}
