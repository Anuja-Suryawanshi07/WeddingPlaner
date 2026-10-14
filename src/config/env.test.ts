import { afterEach, describe, expect, it, vi } from "vitest";
import { mongo } from "mongoose";
vi.mock("server-only", () => ({}));
import { getServerEnv } from "./env";

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("server environment", () => {
  it.each([
    "mongodb+srv://cluster.example.invalid/WeddingPlaner?retryWrites=true",
    "mongodb://localhost:27017/WeddingPlaner",
    "mongodb://host1:27017,host2:27017/WeddingPlaner?replicaSet=test",
    "mongodb://127.0.0.1:27017/WeddingPlaner",
    "mongodb://[::1]:27017/WeddingPlaner",
    "mongodb://fake-user:encoded%40password@localhost/WeddingPlaner",
  ])("accepts valid URI %s", (uri) => {
    expect(getServerEnv({ MONGODB_URI: uri })).toEqual({ MONGODB_URI: uri });
  });

  it.each([
    undefined, "", "   ", "https://example.invalid", "mongodb://",
    "mongodb+srv:///db", "mongodb://host with spaces/db", "mongodb://fake:fake@",
    "mongodb+srv://example.invalid:27017/db", "mongodb+srv://one.invalid,two.invalid/db",
    "mongodb://bad_host/db", "mongodb://bad..host/db", "mongodb://-bad.example/db",
    "mongodb://999.999.999.999/db", "mongodb://host:99999/db",
  ])("rejects malformed URI %s with sanitized error", (uri) => {
    expect(() => getServerEnv({ MONGODB_URI: uri })).toThrow(
      /^MONGODB_URI must be a valid MongoDB connection URI\.$/,
    );
  });

  it("validates lazily without opening a connection", async () => {
    const connect = vi.spyOn(mongo.MongoClient.prototype, "connect");
    vi.stubEnv("MONGODB_URI", undefined);
    vi.resetModules();
    const envConfig = await import("./env");
    expect(() => envConfig.getServerEnv()).toThrow("MONGODB_URI");
    vi.stubEnv("MONGODB_URI", "mongodb://localhost/WeddingPlaner");
    expect(envConfig.getServerEnv().MONGODB_URI).toBe("mongodb://localhost/WeddingPlaner");
    expect(connect).not.toHaveBeenCalled();
  });
});
