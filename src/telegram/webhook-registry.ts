import { Bot, webhookCallback } from "grammy";
import type { IncomingMessage, ServerResponse } from "node:http";

type RegistryEntry = {
  bot: Bot;
  secretToken?: string;
  path: string;
  callback: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
};

// Map of path -> entry
const registry = new Map<string, RegistryEntry>();

export function registerTelegramWebhookBot(opts: { bot: Bot; path: string; secretToken?: string }) {
  const handler = webhookCallback(opts.bot, "http", {
    secretToken: opts.secretToken,
  });

  // Wrap handler to ensure promise return type if needed, though grammy usually returns void or Promise
  const callback = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      await handler(req, res);
    } catch (err) {
      // Should be handled by grammy, but safety net
      console.error("Telegram webhook handler error:", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end();
      }
    }
  };

  const entry: RegistryEntry = {
    bot: opts.bot,
    path: opts.path,
    secretToken: opts.secretToken,
    callback,
  };
  registry.set(opts.path, entry);
  return () => registry.delete(opts.path);
}

export async function handleTelegramWebhookRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://localhost");
  const entry = registry.get(url.pathname);
  if (!entry) return false;

  await entry.callback(req, res);
  return true;
}
