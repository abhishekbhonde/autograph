import express from "express";
import { nanoid } from "nanoid";
import { createLimiter } from "../../middleware/rateLimiter.js";
import { isBlockedName } from "../../utils/blockedWords.js";
import { validateSignature, ENGINE_VERSION, ID_PATTERN } from "./signatures.validation.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const UNIQUE_VIOLATION = "23505";

// What we send to the frontend (a database row, renamed to camelCase)
const toApi = (row) => ({
    id: row.id,
    name: row.name,
    style: row.style,
    seed: row.seed,
    settings: row.settings,
    version: row.version,
    createdAt: row.created_at,
});

// The cursor says "continue after this row". It holds the row's created_at
// as TEXT from Postgres (not a JS Date), because Postgres keeps microseconds
// and a JS Date only keeps milliseconds. Using a Date would skip or repeat rows.
const encodeCursor = (row) =>
    Buffer.from(JSON.stringify({ t: row.created_at_raw, id: row.id })).toString("base64url");

const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?[+-]\d{2}(:?\d{2})?$/;

const decodeCursor = (cursor) => {
    try {
        const { t, id } = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
        if (typeof t !== "string" || !TIMESTAMP_PATTERN.test(t)) return null;
        if (typeof id !== "string" || !ID_PATTERN.test(id)) return null;
        return { t, id };
    } catch {
        return null;
    }
};

// pool is passed in so tests can use a different database.
// options.createLimit lets tests use a smaller limit.
export const signaturesRouter = (pool, options = {}) => {
    const router = express.Router();

    // POST /api/signatures  -> create
    router.post("/", createLimiter(options.createLimit), async (req, res) => {
        try {
            const { errors, value } = validateSignature(req.body);
            if (errors.length > 0) {
                return res.status(400).json({ message: "Validation failed", errors });
            }

            const { name, style, seed, settings } = value;

            if (isBlockedName(name)) {
                return res.status(400).json({ message: "That name is not allowed" });
            }

            const query = `INSERT INTO signatures (id, name, style, seed, settings, version)
            VALUES ($1, $2, $3, $4, $5, $6)`;

            // An 8-character id can (very rarely) collide, so try a few times
            for (let attempt = 0; attempt < 3; attempt++) {
                const id = nanoid(8);
                try {
                    await pool.query(query, [id, name, style, seed, settings, ENGINE_VERSION]);
                    return res.status(201).json({ message: "Signature created successfully", id });
                } catch (error) {
                    if (error.code !== UNIQUE_VIOLATION) throw error;
                }
            }
            throw new Error("Could not generate a unique id");
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error occurred while creating signature" });
        }
    });

    // GET /api/signatures?limit=20&cursor=...  -> Hall of Fame, newest first
    router.get("/", async (req, res) => {
        try {
            let limit = DEFAULT_LIMIT;
            if (req.query.limit !== undefined) {
                const raw = req.query.limit;
                limit = typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : NaN;
                if (!(limit >= 1 && limit <= MAX_LIMIT)) {
                    return res.status(400).json({ message: `limit must be a whole number from 1 to ${MAX_LIMIT}` });
                }
            }

            let cursor = null;
            if (req.query.cursor !== undefined) {
                cursor = typeof req.query.cursor === "string" ? decodeCursor(req.query.cursor) : null;
                if (!cursor) {
                    return res.status(400).json({ message: "Invalid cursor" });
                }
            }

            // Ask for one extra row. If it comes back, there is another page.
            const query = `SELECT id, name, style, seed, settings, version, created_at,
                                  created_at::text AS created_at_raw
            FROM signatures
            WHERE ($1::timestamptz IS NULL OR (created_at, id) < ($1::timestamptz, $2::text))
            ORDER BY created_at DESC, id DESC
            LIMIT $3`;
            const result = await pool.query(query, [cursor?.t ?? null, cursor?.id ?? null, limit + 1]);

            const hasMore = result.rows.length > limit;
            const rows = hasMore ? result.rows.slice(0, limit) : result.rows;

            res.status(200).json({
                items: rows.map(toApi),
                nextCursor: hasMore ? encodeCursor(rows[rows.length - 1]) : null,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error occurred while loading signatures" });
        }
    });

    // GET /api/signatures/:id  -> one signature
    router.get("/:id", async (req, res) => {
        try {
            const { id } = req.params;

            // Wrong-looking ids can't exist, so skip the database
            if (!ID_PATTERN.test(id)) {
                return res.status(404).json({ message: "Signature not found" });
            }

            const result = await pool.query(
                `SELECT id, name, style, seed, settings, version, created_at
                 FROM signatures WHERE id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Signature not found" });
            }

            res.status(200).json(toApi(result.rows[0]));
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error occurred while loading signature" });
        }
    });

    return router;
};
