import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { createConnection } = vi.hoisted(() => ({ createConnection: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("mongoose", async (importOriginal) => {
  const actual = await importOriginal<typeof import("mongoose")>();
  return { ...actual, default: { ...actual.default, createConnection } };
});
import { connectToDatabase, disconnectFromDatabase } from "./mongoose";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}
function fakeConnection() {
  const connection = Object.assign(new EventEmitter(), {
    readyState: 1,
    asPromise: vi.fn(),
    destroy: vi.fn(),
  });
  connection.asPromise.mockResolvedValue(connection);
  connection.destroy.mockImplementation(async () => {
    connection.readyState = 0;
    connection.emit("close");
  });
  return connection;
}
beforeEach(() => {
  createConnection.mockReset();
  delete globalThis.weddingPlanerMongoCache;
  vi.stubEnv("MONGODB_URI", "mongodb://example.invalid/ignored_database");
});
afterEach(() => {
  vi.unstubAllEnvs();
  delete globalThis.weddingPlanerMongoCache;
});

describe("MongoDB lifecycle", () => {
  it("does not validate or connect on import", async () => {
    vi.stubEnv("MONGODB_URI", undefined);
    vi.resetModules();
    const db = await import("./mongoose");
    expect(createConnection).not.toHaveBeenCalled();
    await expect(db.connectToDatabase()).rejects.toThrow("MONGODB_URI");
    expect(createConnection).not.toHaveBeenCalled();
  });

  it("shares concurrent initial requests and selects only WeddingPlaner", async () => {
    const connection = fakeConnection();
    const gate = deferred<typeof connection>();
    connection.asPromise.mockReturnValue(gate.promise);
    createConnection.mockReturnValue(connection);
    const first = connectToDatabase();
    const second = connectToDatabase();
    await Promise.resolve();
    expect(createConnection).toHaveBeenCalledOnce();
    expect(createConnection).toHaveBeenCalledWith("mongodb://example.invalid/ignored_database", {
      dbName: "WeddingPlaner", serverSelectionTimeoutMS: 10_000,
      autoCreate: false, autoIndex: false, bufferCommands: false,
    });
    gate.resolve(connection);
    expect(await first).toBe(connection);
    expect(await second).toBe(connection);
  });

  it("shares a pending connection through hot reload", async () => {
    const connection = fakeConnection();
    const gate = deferred<typeof connection>();
    connection.asPromise.mockReturnValue(gate.promise);
    createConnection.mockReturnValue(connection);
    const first = connectToDatabase();
    vi.resetModules();
    const reloaded = await import("./mongoose");
    const second = reloaded.connectToDatabase();
    gate.resolve(connection);
    expect(await first).toBe(connection);
    expect(await second).toBe(connection);
    expect(await reloaded.connectToDatabase()).toBe(connection);
    expect(createConnection).toHaveBeenCalledOnce();
  });

  it("preserves established references during temporary disconnection and recovery", async () => {
    const connection = fakeConnection();
    createConnection.mockReturnValue(connection);
    const original = await connectToDatabase();
    connection.readyState = 0;
    connection.emit("disconnected");
    expect(await connectToDatabase()).toBe(original);
    connection.readyState = 1;
    expect(await connectToDatabase()).toBe(original);
    expect(connection.destroy).not.toHaveBeenCalled();
    expect(createConnection).toHaveBeenCalledOnce();
  });

  it("clears failed initial promises, sanitizes errors and retries", async () => {
    const failed = fakeConnection();
    failed.asPromise.mockRejectedValue(new Error("fake-secret-uri"));
    const good = fakeConnection();
    createConnection.mockReturnValueOnce(failed).mockReturnValueOnce(good);
    const results = await Promise.allSettled([connectToDatabase(), connectToDatabase()]);
    for (const result of results) {
      expect(result.status).toBe("rejected");
      if (result.status === "rejected") {
        expect(result.reason.message).toBe("Unable to connect to the WeddingPlaner database.");
        expect(result.reason.cause).toBeUndefined();
      }
    }
    expect(failed.destroy).toHaveBeenCalledOnce();
    expect(globalThis.weddingPlanerMongoCache?.promise).toBeNull();
    expect(await connectToDatabase()).toBe(good);
  });

  it("recovers from synchronous creation failure", async () => {
    createConnection.mockImplementationOnce(() => { throw new Error("fake-secret"); });
    await expect(connectToDatabase()).rejects.toThrow("Unable to connect");
    const good = fakeConnection();
    createConnection.mockReturnValue(good);
    expect(await connectToDatabase()).toBe(good);
  });

  it("serializes shutdown and subsequent concurrent reconnection", async () => {
    const old = fakeConnection();
    const good = fakeConnection();
    const gate = deferred<void>();
    old.destroy.mockReturnValue(gate.promise);
    createConnection.mockReturnValueOnce(old).mockReturnValueOnce(good);
    await connectToDatabase();
    const shutdown = disconnectFromDatabase();
    const duplicate = disconnectFromDatabase();
    const next = connectToDatabase();
    const nextAlso = connectToDatabase();
    await Promise.resolve();
    expect(createConnection).toHaveBeenCalledOnce();
    gate.resolve();
    await Promise.all([shutdown, duplicate]);
    expect(await next).toBe(good);
    expect(await nextAlso).toBe(good);
    expect(old.destroy).toHaveBeenCalledOnce();
    expect(createConnection).toHaveBeenCalledTimes(2);
  });

  it("waits for pending establishment before shutdown", async () => {
    const connection = fakeConnection();
    const gate = deferred<typeof connection>();
    connection.asPromise.mockReturnValue(gate.promise);
    createConnection.mockReturnValue(connection);
    const initial = connectToDatabase();
    const closing = disconnectFromDatabase();
    await Promise.resolve();
    expect(connection.destroy).not.toHaveBeenCalled();
    gate.resolve(connection);
    await initial;
    await closing;
    expect(connection.destroy).toHaveBeenCalledOnce();
    expect(globalThis.weddingPlanerMongoCache?.connection).toBeNull();
  });

  it("does not reuse a connection after an explicit close event", async () => {
    const old = fakeConnection();
    const good = fakeConnection();
    createConnection.mockReturnValueOnce(old).mockReturnValueOnce(good);
    await connectToDatabase();
    await old.destroy();
    expect(await connectToDatabase()).toBe(good);
  });

  it.each([true, false])("blocks duplicate pools after cleanup failure (initial failure=%s)", async (initialFailure) => {
    const failed = fakeConnection();
    if (initialFailure) failed.asPromise.mockRejectedValue(new Error("fake-secret"));
    failed.destroy.mockRejectedValueOnce(new Error("fake-cleanup-secret"));
    const good = fakeConnection();
    createConnection.mockReturnValueOnce(failed).mockReturnValueOnce(good);
    if (initialFailure) {
      await expect(connectToDatabase()).rejects.toThrow("Unable to connect");
    } else {
      await connectToDatabase();
      await expect(disconnectFromDatabase()).rejects.toThrow("Unable to close the WeddingPlaner database connection.");
    }
    await expect(connectToDatabase()).rejects.toThrow("MongoDB cleanup must succeed before reconnecting.");
    expect(createConnection).toHaveBeenCalledOnce();
    expect(globalThis.weddingPlanerMongoCache?.promise).toBeNull();
    await disconnectFromDatabase();
    expect(await connectToDatabase()).toBe(good);
  });
});
