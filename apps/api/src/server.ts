import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { connectMongo, disconnectMongo, pingMongo } from "./db/mongo.js";

async function main() {
  await connectMongo(env.MONGODB_URI);
  console.log("MongoDB connected");

  const app = createApp({ pingDatabase: pingMongo });

  const server = app.listen(env.API_PORT, () => {
    console.log(`API listening on http://localhost:${env.API_PORT} (${env.NODE_ENV})`);
  });

  let shuttingDown = false;
  function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down`);

    const forceExit = setTimeout(() => {
      console.error("Graceful shutdown timed out, forcing exit");
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    server.close(async () => {
      await disconnectMongo();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("Failed to start API:", err instanceof Error ? err.message : err);
  process.exit(1);
});
