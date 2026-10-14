import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { getServerEnv } from "../src/config/env";
import { connectToDatabase, disconnectFromDatabase, DATABASE_NAME } from "../src/lib/db/mongoose";

export async function runMongoCheck(): Promise<number> {
  if (process.env.NODE_ENV && process.env.NODE_ENV !== "development") {
    console.error("MongoDB verification is development-only.");
    return 1;
  }

  const inheritedUri = process.env.MONGODB_URI;
  let attemptedConnection = false;
  let exitCode = 0;
  try {
    const local = parseEnv(await readFile(new URL("../.env.local", import.meta.url), "utf8"));
    if (local.NODE_ENV && local.NODE_ENV !== "development") {
      console.error("MongoDB verification is development-only.");
      return 1;
    }
    const { MONGODB_URI } = getServerEnv(local);
    // Standalone CLI only: explicitly select the local file over inherited values.
    process.env.MONGODB_URI = MONGODB_URI;
    attemptedConnection = true;
    const connection = await connectToDatabase();
    if (!connection.db || connection.db.databaseName !== DATABASE_NAME) {
      throw new Error("Unexpected database selection.");
    }
    await connection.db.command({ ping: 1 });
    console.log(`MongoDB ping succeeded. Selected database: ${DATABASE_NAME}`);
  } catch {
    console.error("MongoDB verification failed. Check .env.local, Atlas access, and network connectivity. Sensitive details are suppressed.");
    exitCode = 1;
  } finally {
    if (attemptedConnection) {
      try {
        await disconnectFromDatabase();
      } catch {
        console.error("MongoDB verification connection cleanup failed.");
        exitCode = 1;
      }
    }
    if (inheritedUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = inheritedUri;
  }
  return exitCode;
}
