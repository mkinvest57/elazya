import { describe, expect, it } from "vitest";

import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it("detects help/version flags", () => {
    expect(hasHelpOrVersion(["node", "alize", "--help"])).toBe(true);
    expect(hasHelpOrVersion(["node", "alize", "-V"])).toBe(true);
    expect(hasHelpOrVersion(["node", "alize", "status"])).toBe(false);
  });

  it("extracts command path ignoring flags and terminator", () => {
    expect(getCommandPath(["node", "alize", "status", "--json"], 2)).toEqual(["status"]);
    expect(getCommandPath(["node", "alize", "agents", "list"], 2)).toEqual(["agents", "list"]);
    expect(getCommandPath(["node", "alize", "status", "--", "ignored"], 2)).toEqual(["status"]);
  });

  it("returns primary command", () => {
    expect(getPrimaryCommand(["node", "alize", "agents", "list"])).toBe("agents");
    expect(getPrimaryCommand(["node", "alize"])).toBeNull();
  });

  it("parses boolean flags and ignores terminator", () => {
    expect(hasFlag(["node", "alize", "status", "--json"], "--json")).toBe(true);
    expect(hasFlag(["node", "alize", "--", "--json"], "--json")).toBe(false);
  });

  it("extracts flag values with equals and missing values", () => {
    expect(getFlagValue(["node", "alize", "status", "--timeout", "5000"], "--timeout")).toBe(
      "5000",
    );
    expect(getFlagValue(["node", "alize", "status", "--timeout=2500"], "--timeout")).toBe("2500");
    expect(getFlagValue(["node", "alize", "status", "--timeout"], "--timeout")).toBeNull();
    expect(getFlagValue(["node", "alize", "status", "--timeout", "--json"], "--timeout")).toBe(
      null,
    );
    expect(getFlagValue(["node", "alize", "--", "--timeout=99"], "--timeout")).toBeUndefined();
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "alize", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "alize", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "alize", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it("parses positive integer flag values", () => {
    expect(getPositiveIntFlagValue(["node", "alize", "status"], "--timeout")).toBeUndefined();
    expect(
      getPositiveIntFlagValue(["node", "alize", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getPositiveIntFlagValue(["node", "alize", "status", "--timeout", "5000"], "--timeout"),
    ).toBe(5000);
    expect(
      getPositiveIntFlagValue(["node", "alize", "status", "--timeout", "nope"], "--timeout"),
    ).toBeUndefined();
  });

  it("builds parse argv from raw args", () => {
    const nodeArgv = buildParseArgv({
      programName: "alize",
      rawArgs: ["node", "alize", "status"],
    });
    expect(nodeArgv).toEqual(["node", "alize", "status"]);

    const versionedNodeArgv = buildParseArgv({
      programName: "alize",
      rawArgs: ["node-22", "alize", "status"],
    });
    expect(versionedNodeArgv).toEqual(["node-22", "alize", "status"]);

    const versionedNodeWindowsArgv = buildParseArgv({
      programName: "alize",
      rawArgs: ["node-22.2.0.exe", "alize", "status"],
    });
    expect(versionedNodeWindowsArgv).toEqual(["node-22.2.0.exe", "alize", "status"]);

    const versionedNodePatchlessArgv = buildParseArgv({
      programName: "alize",
      rawArgs: ["node-22.2", "alize", "status"],
    });
    expect(versionedNodePatchlessArgv).toEqual(["node-22.2", "alize", "status"]);

    const versionedNodeWindowsPatchlessArgv = buildParseArgv({
      programName: "alize",
      rawArgs: ["node-22.2.exe", "alize", "status"],
    });
    expect(versionedNodeWindowsPatchlessArgv).toEqual(["node-22.2.exe", "alize", "status"]);

    const versionedNodeWithPathArgv = buildParseArgv({
      programName: "alize",
      rawArgs: ["/usr/bin/node-22.2.0", "alize", "status"],
    });
    expect(versionedNodeWithPathArgv).toEqual(["/usr/bin/node-22.2.0", "alize", "status"]);

    const nodejsArgv = buildParseArgv({
      programName: "alize",
      rawArgs: ["nodejs", "alize", "status"],
    });
    expect(nodejsArgv).toEqual(["nodejs", "alize", "status"]);

    const nonVersionedNodeArgv = buildParseArgv({
      programName: "alize",
      rawArgs: ["node-dev", "alize", "status"],
    });
    expect(nonVersionedNodeArgv).toEqual(["node", "alize", "node-dev", "alize", "status"]);

    const directArgv = buildParseArgv({
      programName: "alize",
      rawArgs: ["alize", "status"],
    });
    expect(directArgv).toEqual(["node", "alize", "status"]);

    const bunArgv = buildParseArgv({
      programName: "alize",
      rawArgs: ["bun", "src/entry.ts", "status"],
    });
    expect(bunArgv).toEqual(["bun", "src/entry.ts", "status"]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "alize",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "alize", "status"]);
  });

  it("decides when to migrate state", () => {
    expect(shouldMigrateState(["node", "alize", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "alize", "health"])).toBe(false);
    expect(shouldMigrateState(["node", "alize", "sessions"])).toBe(false);
    expect(shouldMigrateState(["node", "alize", "memory", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "alize", "agent", "--message", "hi"])).toBe(false);
    expect(shouldMigrateState(["node", "alize", "agents", "list"])).toBe(true);
    expect(shouldMigrateState(["node", "alize", "message", "send"])).toBe(true);
  });

  it("reuses command path for migrate state decisions", () => {
    expect(shouldMigrateStateFromPath(["status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["agents", "list"])).toBe(true);
  });
});
