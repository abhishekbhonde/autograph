import express from "express";
import cors from "cors";
import helmet from "helmet";
import { signaturesRouter } from "./modules/signatures/signatures.route.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Builds the Express app. The database pool is passed in (not imported)
// so tests can give it a different database.
export const createApp = (pool, options = {}) => {
    const app = express();

    // Behind a proxy (Render, Fly.io...) this makes req.ip the visitor's real IP.
    // Without it, every visitor shares one IP and one rate limit.
    const proxyHops = Number(process.env.TRUST_PROXY);
    if (proxyHops > 0) app.set("trust proxy", proxyHops);

    const allowedOrigins = (options.corsOrigin ?? process.env.CORS_ORIGIN ?? "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

    app.use(helmet());
    app.use(cors({ origin: allowedOrigins }));
    app.use(express.json({ limit: "10kb" }));

    app.get("/api/health", (req, res) => res.json({ ok: true }));
    app.use("/api/signatures", signaturesRouter(pool, options));

    // Add your auth routes here, for example:
    // app.use("/api/auth", authRouter);

    app.use(notFound);
    app.use(errorHandler);

    return app;
};
