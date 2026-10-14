import "server-only";
import { isIP } from "node:net";
import { mongo } from "mongoose";
import { z } from "zod";

const hostname = z.hostname();

function isMongoUri(uri: string): boolean {
  try {
    if (!uri || /\s/.test(uri)) return false;
    // Construction parses options only. Never call connect() during validation.
    const client = new mongo.MongoClient(uri, {
      mongodbLogComponentSeverities: { default: "off" },
    });
    const hosts = client.options.srvHost
      ? [client.options.srvHost]
      : client.options.hosts.map((address) => address.host);
    return hosts.length > 0 && hosts.every((host) =>
      typeof host === "string" && (
        isIP(host) !== 0 ||
        (!/^[\d.]+$/.test(host) && hostname.safeParse(host).success)
      ),
    );
  } catch {
    return false;
  }
}

const serverEnvSchema = z.object({
  MONGODB_URI: z.string().refine(isMongoUri),
});

// Validate only on demand, including during Next.js builds.
export function getServerEnv(source: Record<string, string | undefined> = process.env) {
  const result = serverEnvSchema.safeParse({ MONGODB_URI: source.MONGODB_URI });
  if (!result.success) {
    throw new Error("MONGODB_URI must be a valid MongoDB connection URI.");
  }
  return result.data;
}
