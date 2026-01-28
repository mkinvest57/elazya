import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "alize",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) throw new Error(res.error);
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "alize", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "alize", "--dev", "gateway"]);
    if (!res.ok) throw new Error(res.error);
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "alize", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "alize", "--profile", "work", "status"]);
    if (!res.ok) throw new Error(res.error);
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "alize", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "alize", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (dev first)", () => {
    const res = parseCliProfileArgs(["node", "alize", "--dev", "--profile", "work", "status"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (profile first)", () => {
    const res = parseCliProfileArgs(["node", "alize", "--profile", "work", "--dev", "status"]);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join("/home/peter", ".alize-dev");
    expect(env.ALIZE_PROFILE).toBe("dev");
    expect(env.ALIZE_STATE_DIR).toBe(expectedStateDir);
    expect(env.ALIZE_CONFIG_PATH).toBe(path.join(expectedStateDir, "alize.json"));
    expect(env.ALIZE_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      ALIZE_STATE_DIR: "/custom",
      ALIZE_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.ALIZE_STATE_DIR).toBe("/custom");
    expect(env.ALIZE_GATEWAY_PORT).toBe("19099");
    expect(env.ALIZE_CONFIG_PATH).toBe(path.join("/custom", "alize.json"));
  });
});

describe("formatCliCommand", () => {
  it("returns command unchanged when no profile is set", () => {
    expect(formatCliCommand("alize doctor --fix", {})).toBe("alize doctor --fix");
  });

  it("returns command unchanged when profile is default", () => {
    expect(formatCliCommand("alize doctor --fix", { ALIZE_PROFILE: "default" })).toBe(
      "alize doctor --fix",
    );
  });

  it("returns command unchanged when profile is Default (case-insensitive)", () => {
    expect(formatCliCommand("alize doctor --fix", { ALIZE_PROFILE: "Default" })).toBe(
      "alize doctor --fix",
    );
  });

  it("returns command unchanged when profile is invalid", () => {
    expect(formatCliCommand("alize doctor --fix", { ALIZE_PROFILE: "bad profile" })).toBe(
      "alize doctor --fix",
    );
  });

  it("returns command unchanged when --profile is already present", () => {
    expect(
      formatCliCommand("alize --profile work doctor --fix", { ALIZE_PROFILE: "work" }),
    ).toBe("alize --profile work doctor --fix");
  });

  it("returns command unchanged when --dev is already present", () => {
    expect(formatCliCommand("alize --dev doctor", { ALIZE_PROFILE: "dev" })).toBe(
      "alize --dev doctor",
    );
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("alize doctor --fix", { ALIZE_PROFILE: "work" })).toBe(
      "alize --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("alize doctor --fix", { ALIZE_PROFILE: "  jbclawd  " })).toBe(
      "alize --profile jbclawd doctor --fix",
    );
  });

  it("handles command with no args after alize", () => {
    expect(formatCliCommand("alize", { ALIZE_PROFILE: "test" })).toBe(
      "alize --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm alize doctor", { ALIZE_PROFILE: "work" })).toBe(
      "pnpm alize --profile work doctor",
    );
  });
});
