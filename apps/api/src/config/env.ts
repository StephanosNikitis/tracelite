import { parseEnv, type Env } from "./env.schema.js";

function loadEnv(): Env {
  try {
    return parseEnv(process.env);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

export const env = loadEnv();
