import path from "node:path";

import { describe, expect, it } from "vitest";

import { resolveGatewayStateDir } from "./paths.js";

describe("resolveGatewayStateDir", () => {
  it("uses the default state dir when no overrides are set", () => {
    const env = { HOME: "/Users/test" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".alize"));
  });

  it("appends the profile suffix when set", () => {
    const env = { HOME: "/Users/test", ALIZE_PROFILE: "rescue" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".alize-rescue"));
  });

  it("treats default profiles as the base state dir", () => {
    const env = { HOME: "/Users/test", ALIZE_PROFILE: "Default" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".alize"));
  });

  it("uses ALIZE_STATE_DIR when provided", () => {
    const env = { HOME: "/Users/test", ALIZE_STATE_DIR: "/var/lib/alize" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/var/lib/alize"));
  });

  it("expands ~ in ALIZE_STATE_DIR", () => {
    const env = { HOME: "/Users/test", ALIZE_STATE_DIR: "~/alize-state" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/Users/test/alize-state"));
  });

  it("preserves Windows absolute paths without HOME", () => {
    const env = { ALIZE_STATE_DIR: "C:\\State\\alize" };
    expect(resolveGatewayStateDir(env)).toBe("C:\\State\\alize");
  });
});
