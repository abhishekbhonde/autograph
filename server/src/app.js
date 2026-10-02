import express from "express";
import cors from "cors";
import helmet from "helmet";
import { signaturesRouter } from "./modules/signatures/signatures.route.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export const createApp = (pool, options = {}) => {
    const app = express();

    // Behind a proxy (Render, Fly.io...) this makes req.ip the visitor's real IP.
    const proxyHops = Number(process.env.TRUST_PROXY);
    if (proxyHops > 0) app.set("trust proxy", proxyHops);

    const allowedOrigins = (options.corsOrigin ?? process.env.CORS_ORIGIN ?? "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

    app.use(helmet());
    app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : "*" }));
    app.use(express.json({ limit: "10kb" }));

    // Comprehensive Health Check Endpoint for Render / Uptime monitors
    const healthHandler = async (req, res) => {
        let dbStatus = "ok";
        try {
            if (pool) {
                await pool.query("SELECT 1");
            }
        } catch {
            dbStatus = "memory_fallback";
        }

        res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            environment: process.env.NODE_ENV || "development",
            database: dbStatus,
        });
    };

    app.get("/health", healthHandler);
    app.get("/api/health", healthHandler);

    app.use("/api/signatures", signaturesRouter(pool, options));

    app.use(notFound);
    app.use(errorHandler);

    return app;
};
