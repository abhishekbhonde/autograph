import express from "express";
import { nanoid } from "nanoid";
import { createLimiter } from "../../middleware/rateLimiter.js";
import { isBlockedName } from "../../utils/blockedWords.js";
import { validateSignature, ENGINE_VERSION } from "./signatures.validation.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// In-memory store fallback ONLY used when database is offline or not configured
const memoryStore = [
    {
        id: "demo0001",
        name: "Alexander Vance",
        style: "brittany",
        seed: 1234,
        settings: { ink: "#FFFFFF", motionSpeed: "balanced", authorName: "Alexander Vance", authorHandle: "avance" },
        version: 1,
        created_at: new Date().toISOString(),
    },
    {
        id: "demo0002",
        name: "Genevieve Dupré",
        style: "delafield",
        seed: 5678,
        settings: { ink: "#FFFFFF", motionSpeed: "calm", authorName: "Genevieve Dupré", authorHandle: "gdupre" },
        version: 1,
        created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: "demo0003",
        name: "Arthur Pendelton",
        style: "signatura",
        seed: 9999,
        settings: { ink: "#FFFFFF", motionSpeed: "quick", authorName: "Arthur Pendelton", authorHandle: "apendelton" },
        version: 1,
        created_at: new Date(Date.now() - 7200000).toISOString(),
    }
];

const toApi = (row) => ({
    id: row.id,
    name: row.name,
    style: row.style,
    seed: row.seed,
    settings: row.settings,
    version: row.version,
    createdAt: row.created_at,
});

export const signaturesRouter = (pool, options = {}) => {
    const router = express.Router();

    // POST /api/signatures -> create signature
    router.post("/", createLimiter(options.createLimit), async (req, res) => {
        try {
            const { errors, value } = validateSignature(req.body);
            if (errors && errors.length > 0) {
                return res.status(400).json({ message: "Validation failed", errors });
            }

            const { name, style, seed, settings } = value;

            if (isBlockedName(name)) {
                return res.status(400).json({ message: "That name is not allowed" });
            }

            const id = nanoid(8);
            const createdAt = new Date().toISOString();

            // Insert into Database
            if (pool) {
                try {
                    const query = `INSERT INTO signatures (id, name, style, seed, settings, version)
                    VALUES ($1, $2, $3, $4, $5, $6)`;
                    await pool.query(query, [id, name, style, seed, settings, ENGINE_VERSION]);
                    return res.status(201).json({ message: "Signature created successfully", id });
                } catch (dbErr) {
                    console.warn("DB Insert failed, using memoryStore fallback:", dbErr.message);
                }
            }

            // Memory Fallback
            memoryStore.unshift({
                id,
                name,
                style,
                seed,
                settings,
                version: ENGINE_VERSION,
                created_at: createdAt,
            });

            return res.status(201).json({ message: "Signature created successfully", id });
        } catch (error) {
            console.error("Create signature error:", error);
            res.status(500).json({ message: "Error occurred while creating signature" });
        }
    });

    // GET /api/signatures?limit=20 -> Showcase list, newest first
    router.get("/", async (req, res) => {
        try {
            let limit = DEFAULT_LIMIT;
            if (req.query.limit !== undefined) {
                const raw = req.query.limit;
                limit = typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : NaN;
                if (!(limit >= 1 && limit <= MAX_LIMIT)) {
                    limit = DEFAULT_LIMIT;
                }
            }

            // Query Postgres database
            if (pool) {
                try {
                    const query = `SELECT id, name, style, seed, settings, version, created_at
                    FROM signatures
                    ORDER BY created_at DESC, id DESC
                    LIMIT $1`;
                    const result = await pool.query(query, [limit]);
                    if (result && Array.isArray(result.rows)) {
                        return res.status(200).json({
                            items: result.rows.map(toApi),
                            nextCursor: null,
                        });
                    }
                } catch (dbErr) {
                    console.warn("DB Query failed, using memoryStore fallback:", dbErr.message);
                }
            }

            // Memory Fallback ONLY if DB query failed
            return res.status(200).json({
                items: memoryStore.map(toApi),
                nextCursor: null,
            });
        } catch (error) {
            console.error("Fetch signatures error:", error);
            res.status(500).json({ message: "Error occurred while loading signatures" });
        }
    });

    // GET /api/signatures/:id -> get single signature by ID
    router.get("/:id", async (req, res) => {
        try {
            const { id } = req.params;

            if (pool) {
                try {
                    const result = await pool.query(
                        `SELECT id, name, style, seed, settings, version, created_at
                         FROM signatures WHERE id = $1`,
                        [id]
                    );

                    if (result && result.rows.length > 0) {
                        return res.status(200).json(toApi(result.rows[0]));
                    } else if (result && result.rows.length === 0) {
                        return res.status(404).json({ message: "Signature not found" });
                    }
                } catch (dbErr) {
                    console.warn("DB GetById failed, using memoryStore fallback:", dbErr.message);
                }
            }

            // Memory Fallback
            const found = memoryStore.find((item) => item.id === id);
            if (found) {
                return res.status(200).json(toApi(found));
            }

            return res.status(404).json({ message: "Signature not found" });
        } catch (error) {
            console.error("Get signature by ID error:", error);
            res.status(500).json({ message: "Error occurred while loading signature" });
        }
    });

    return router;
};
