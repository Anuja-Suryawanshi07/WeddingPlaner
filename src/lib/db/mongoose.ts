import "server-only";
import mongoose, { type Connection } from "mongoose";
import { getServerEnv } from "@/config/env";

export const DATABASE_NAME = "WeddingPlaner";

type ConnectionCache = {
  connection: Connection | null;
  promise: Promise<Connection> | null;
  shutdown: Promise<void> | null;
  cleanupRequired: boolean;
};

declare global {
  var weddingPlanerMongoCache: ConnectionCache | undefined;
}

function getCache(): ConnectionCache {
  return (globalThis.weddingPlanerMongoCache ??= {
    connection: null,
    promise: null,
    shutdown: null,
    cleanupRequired: false,
  });
}

export async function connectToDatabase(): Promise<Connection> {
  const cache = getCache();
  if (cache.shutdown) {
    await cache.shutdown;
    return connectToDatabase();
  }
  if (cache.cleanupRequired) {
    throw new Error("MongoDB cleanup must succeed before reconnecting.");
  }
  if (cache.promise) return cache.promise;
  // readyState=0 may mean a transient outage. Let the driver recover this pool.
  if (cache.connection) return cache.connection;

  const { MONGODB_URI } = getServerEnv();
  const pending = Promise.resolve().then(async () => {
    let connection: Connection | undefined;
    try {
      connection = mongoose.createConnection(MONGODB_URI, {
        dbName: DATABASE_NAME,
        serverSelectionTimeoutMS: 10_000,
        autoCreate: false,
        autoIndex: false,
        bufferCommands: false,
      });
      await connection.asPromise();
      cache.connection = connection;
      // An explicit close/destroy invalidates the cache; 'disconnected' does not.
      connection.once("close", () => {
        if (cache.connection === connection) cache.connection = null;
      });
      return connection;
    } catch {
      if (connection) {
        try {
          await connection.destroy();
        } catch {
          // Keep ownership of a pool whose cleanup failed; do not create another.
          cache.connection = connection;
          cache.cleanupRequired = true;
        }
      }
      throw new Error("Unable to connect to the WeddingPlaner database.");
    } finally {
      cache.promise = null;
    }
  });
  cache.promise = pending;
  return pending;
}

// Application shutdown should use this helper, not close the returned pool directly.
export async function disconnectFromDatabase(): Promise<void> {
  const cache = getCache();
  if (cache.shutdown) return cache.shutdown;
  const pending = Promise.resolve().then(async () => {
    try {
      // Settle initial connection/cleanup before shutting down its pool.
      if (cache.promise) await cache.promise.catch(() => undefined);
      const connection = cache.connection;
      if (connection) {
        try {
          await connection.destroy();
          cache.connection = null;
          cache.cleanupRequired = false;
        } catch {
          cache.connection = connection;
          cache.cleanupRequired = true;
          throw new Error("Unable to close the WeddingPlaner database connection.");
        }
      }
    } finally {
      cache.shutdown = null;
    }
  });
  cache.shutdown = pending;
  return pending;
}
