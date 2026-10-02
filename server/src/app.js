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

    // Disable restrictive COEP/CORP blocking for cross-origin frontend requests
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginOpenerPolicy: { policy: "unsafe-none" },
    }));

    // Universal CORS configuration supporting production domains, Vercel, Render & custom domains
    app.use(cors({
        origin: (origin, callback) => {
            // Allow server-to-server, curl, or non-browser requests
            if (!origin) return callback(null, true);

            const envOrigins = (options.corsOrigin ?? process.env.CORS_ORIGIN ?? "")
                .split(",")
                .map((o) => o.trim())
                .filter(Boolean);

            // Allow if envOrigins contains wildcard or specific match
            if (envOrigins.length === 0 || envOrigins.includes("*") || envOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Always allow custom domain (abhishekk.xyz), render, vercel, netlify, localhost
            if (
                origin.includes("abhishekk.xyz") ||
                origin.includes("onrender.com") ||
                origin.includes("vercel.app") ||
                origin.includes("netlify.app") ||
                origin.includes("localhost")
            ) {
                return callback(null, true);
            }

            // Fallback: allow all origins to prevent CORS errors on custom user domains
            return callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    }));

    app.use(express.json({ limit: "10kb" }));

    // Health Check Endpoint
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
