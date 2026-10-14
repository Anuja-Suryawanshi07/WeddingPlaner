import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ readFile: vi.fn(), connect: vi.fn(), disconnect: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("node:fs/promises", () => ({ readFile: mocks.readFile }));
vi.mock("../src/lib/db/mongoose", () => ({
  DATABASE_NAME: "WeddingPlaner", connectToDatabase: mocks.connect,
  disconnectFromDatabase: mocks.disconnect,
}));
import { runMongoCheck } from "./check-mongodb-runner";

const localUri = "mongodb://local-fake:local-fake-secret@localhost/WeddingPlaner";
const inheritedUri = "mongodb://inherited-fake:inherited-secret@other.invalid/OtherProject";
let command: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("MONGODB_URI", inheritedUri);
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  mocks.readFile.mockReset().mockResolvedValue(`MONGODB_URI=${localUri}`);
  mocks.disconnect.mockReset().mockResolvedValue(undefined);
  command = vi.fn().mockResolvedValue({ ok: 1 });
  mocks.connect.mockReset().mockImplementation(async () => {
    expect(process.env.MONGODB_URI).toBe(localUri);
    return { db: { databaseName: "WeddingPlaner", command } };
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

function expectSafeOutput() {
  const output = JSON.stringify([vi.mocked(console.log).mock.calls, vi.mocked(console.error).mock.calls]);
  expect(output).not.toContain(localUri);
  expect(output).not.toContain(inheritedUri);
  expect(output).not.toContain("fake-secret-error");
  expect(output).not.toContain("local-fake-secret");
  expect(output).not.toContain("inherited-secret");
}

describe("standalone MongoDB verification", () => {
  it("uses the repository local file over inherited configuration and only pings", async () => {
    expect(await runMongoCheck()).toBe(0);
    expect(mocks.readFile.mock.calls[0][0].href).toBe(new URL("../.env.local", import.meta.url).href);
    expect(command).toHaveBeenCalledExactlyOnceWith({ ping: 1 });
    expect(mocks.disconnect).toHaveBeenCalledOnce();
    expect(process.env.MONGODB_URI).toBe(inheritedUri);
    expect(console.log).toHaveBeenCalledWith("MongoDB ping succeeded. Selected database: WeddingPlaner");
    expectSafeOutput();
  });

  it.each(["production", "test"])("rejects inherited %s execution before reading configuration", async (mode) => {
    vi.stubEnv("NODE_ENV", mode);
    expect(await runMongoCheck()).toBe(1);
    expect(mocks.readFile).not.toHaveBeenCalled();
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it.each(["production", "test"])("rejects %s mode specified in the local file", async (mode) => {
    mocks.readFile.mockResolvedValue(`NODE_ENV=${mode}\nMONGODB_URI=${localUri}`);
    expect(await runMongoCheck()).toBe(1);
    expect(mocks.connect).not.toHaveBeenCalled();
    expect(process.env.MONGODB_URI).toBe(inheritedUri);
  });

  it("allows an unset local CLI mode and restores an absent inherited URI", async () => {
    vi.stubEnv("NODE_ENV", undefined);
    vi.stubEnv("MONGODB_URI", undefined);
    expect(await runMongoCheck()).toBe(0);
    expect(process.env.MONGODB_URI).toBeUndefined();
  });

  it("rejects a missing file without falling back to the inherited URI", async () => {
    mocks.readFile.mockRejectedValue(new Error("fake-secret-error"));
    expect(await runMongoCheck()).toBe(1);
    expect(mocks.connect).not.toHaveBeenCalled();
    expect(mocks.disconnect).not.toHaveBeenCalled();
    expectSafeOutput();
  });

  it.each(["", "OTHER=value", "MONGODB_URI=", "MONGODB_URI=mongodb+srv://host:27017/db"])(
    "rejects missing or malformed configuration %s", async (content) => {
      mocks.readFile.mockResolvedValue(content);
      expect(await runMongoCheck()).toBe(1);
      expect(mocks.connect).not.toHaveBeenCalled();
      expect(process.env.MONGODB_URI).toBe(inheritedUri);
      expectSafeOutput();
    },
  );

  it("rejects database mismatch before issuing a command and cleans up", async () => {
    mocks.connect.mockResolvedValue({ db: { databaseName: "OtherProject", command } });
    expect(await runMongoCheck()).toBe(1);
    expect(command).not.toHaveBeenCalled();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
    expectSafeOutput();
  });

  it("cleans up after a failed ping and suppresses raw errors", async () => {
    command.mockRejectedValue(new Error(`fake-secret-error ${localUri}`));
    expect(await runMongoCheck()).toBe(1);
    expect(mocks.disconnect).toHaveBeenCalledOnce();
    expect(process.env.MONGODB_URI).toBe(inheritedUri);
    expectSafeOutput();
  });

  it("attempts cleanup even when connection establishment fails", async () => {
    mocks.connect.mockRejectedValue(new Error(`fake-secret-error ${localUri}`));
    expect(await runMongoCheck()).toBe(1);
    expect(mocks.disconnect).toHaveBeenCalledOnce();
    expect(command).not.toHaveBeenCalled();
    expectSafeOutput();
  });

  it("reports cleanup failure safely and restores the environment", async () => {
    mocks.disconnect.mockRejectedValue(new Error(`fake-secret-error ${localUri}`));
    expect(await runMongoCheck()).toBe(1);
    expect(process.env.MONGODB_URI).toBe(inheritedUri);
    expect(console.error).toHaveBeenCalledWith("MongoDB verification connection cleanup failed.");
    expectSafeOutput();
  });
});
