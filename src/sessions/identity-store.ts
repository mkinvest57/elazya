import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import lockfile from "proper-lockfile";
import { resolveStateDir } from "../config/paths.js";

const LOCK_OPTIONS = {
  retries: {
    retries: 10,
    factor: 2,
    minTimeout: 100,
    maxTimeout: 10_000,
    randomize: true,
  },
  stale: 30_000,
} as const;

type IdentityStoreData = {
  version: 1;
  // Map alias -> canonicalId
  aliases: Record<string, string>;
};

const DEFAULT_STORE: IdentityStoreData = {
  version: 1,
  aliases: {},
};

function resolveIdentityStorePath(env: NodeJS.ProcessEnv = process.env): string {
  const stateDir = resolveStateDir(env, os.homedir);
  return path.join(stateDir, "identity-store.json");
}

function safeParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function readJsonFile<T>(
  filePath: string,
  fallback: T,
): Promise<{ value: T; exists: boolean }> {
  try {
    const raw = await fs.promises.readFile(filePath, "utf-8");
    const parsed = safeParseJson<T>(raw);
    if (parsed == null) return { value: fallback, exists: true };
    return { value: parsed, exists: true };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "ENOENT") return { value: fallback, exists: false };
    return { value: fallback, exists: false };
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true, mode: 0o700 });
  const tmp = path.join(dir, `${path.basename(filePath)}.${crypto.randomUUID()}.tmp`);
  await fs.promises.writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf-8",
  });
  await fs.promises.chmod(tmp, 0o600);
  await fs.promises.rename(tmp, filePath);
}

async function ensureJsonFile(filePath: string, fallback: unknown) {
  try {
    await fs.promises.access(filePath);
  } catch {
    await writeJsonFile(filePath, fallback);
  }
}

async function withFileLock<T>(
  filePath: string,
  fallback: unknown,
  fn: () => Promise<T>,
): Promise<T> {
  await ensureJsonFile(filePath, fallback);
  let release: (() => Promise<void>) | undefined;
  try {
    release = await lockfile.lock(filePath, LOCK_OPTIONS);
    return await fn();
  } finally {
    if (release) {
      try {
        await release();
      } catch {
        // ignore unlock errors
      }
    }
  }
}

export async function linkIdentityAlias(params: {
  canonicalId: string;
  aliasId: string;
  env?: NodeJS.ProcessEnv;
}): Promise<{ changed: boolean }> {
  const env = params.env ?? process.env;
  const filePath = resolveIdentityStorePath(env);
  const canonical = params.canonicalId.trim().toLowerCase();
  const alias = params.aliasId.trim().toLowerCase();

  if (!canonical || !alias || canonical === alias) return { changed: false };

  return await withFileLock(filePath, DEFAULT_STORE, async () => {
    const { value } = await readJsonFile<IdentityStoreData>(filePath, DEFAULT_STORE);
    const aliases = value.aliases || {};

    // Check if mapping already exists
    if (aliases[alias] === canonical) {
      return { changed: false };
    }

    // Update mapping
    const nextAliases = { ...aliases, [alias]: canonical };

    // Also ensure transitive consistency?
    // If canonical was itself an alias, we should probably resolve it first?
    // For now, assume caller provides a "true" canonical ID (like user:name).

    await writeJsonFile(filePath, {
      version: 1,
      aliases: nextAliases,
    } satisfies IdentityStoreData);

    return { changed: true };
  });
}

export async function unlinkIdentityAlias(params: {
  aliasId: string;
  env?: NodeJS.ProcessEnv;
}): Promise<{ changed: boolean }> {
  const env = params.env ?? process.env;
  const filePath = resolveIdentityStorePath(env);
  const alias = params.aliasId.trim().toLowerCase();

  if (!alias) return { changed: false };

  return await withFileLock(filePath, DEFAULT_STORE, async () => {
    const { value } = await readJsonFile<IdentityStoreData>(filePath, DEFAULT_STORE);
    const aliases = value.aliases || {};

    if (!(alias in aliases)) {
      return { changed: false };
    }

    const nextAliases = { ...aliases };
    delete nextAliases[alias];

    await writeJsonFile(filePath, {
      version: 1,
      aliases: nextAliases,
    } satisfies IdentityStoreData);

    return { changed: true };
  });
}

export async function resolveCanonicalIdentity(params: {
  id: string;
  env?: NodeJS.ProcessEnv;
}): Promise<string> {
  const env = params.env ?? process.env;
  const filePath = resolveIdentityStorePath(env);
  const id = params.id.trim().toLowerCase();

  // Read without lock for speed (eventual consistency)
  const { value } = await readJsonFile<IdentityStoreData>(filePath, DEFAULT_STORE);
  const aliases = value.aliases || {};

  const mapped = aliases[id];
  return mapped || id; // Return alias if mapped, else return original
}

export async function listIdentityAliases(params: {
  canonicalId: string;
  env?: NodeJS.ProcessEnv;
}): Promise<string[]> {
  const env = params.env ?? process.env;
  const filePath = resolveIdentityStorePath(env);
  const canonical = params.canonicalId.trim().toLowerCase();

  const { value } = await readJsonFile<IdentityStoreData>(filePath, DEFAULT_STORE);
  const aliases = value.aliases || {};

  return Object.entries(aliases)
    .filter(([_, target]) => target === canonical)
    .map(([alias]) => alias);
}

export async function getAllIdentityLinks(
  params: {
    env?: NodeJS.ProcessEnv;
  } = {},
): Promise<Record<string, string[]>> {
  const env = params.env ?? process.env;
  const filePath = resolveIdentityStorePath(env);

  const { value } = await readJsonFile<IdentityStoreData>(filePath, DEFAULT_STORE);
  const aliases = value.aliases || {};

  const result: Record<string, string[]> = {};

  for (const [alias, canonical] of Object.entries(aliases)) {
    if (!result[canonical]) {
      result[canonical] = [];
    }
    result[canonical].push(alias);
  }

  return result;
}
