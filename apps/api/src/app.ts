import express from "express";

export interface AppDeps {
  pingDatabase: () => Promise<boolean>;
}

export function createApp(deps: AppDeps) {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/v1/health", (_req, res) => {
    res.json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) });
  });

  app.get("/api/v1/ready", async (_req, res) => {
    const databaseUp = await deps.pingDatabase().catch(() => false);
    res.status(databaseUp ? 200 : 503).json({
      status: databaseUp ? "ready" : "not_ready",
      checks: { database: databaseUp ? "up" : "down" },
    });
  });

  return app;
}
