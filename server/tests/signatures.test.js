import "dotenv/config";
import { describe, it, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import request from "supertest";
import pg from "pg";
import { createApp } from "../src/app.js";

const GOOD = {
    name: "Alex Morgan",
    style: "scripts",
    seed: 3,
    settings: { pen: 1.3, ps: 0.7, slant: 6, shake: 0.6, rise: 4, sp: 1, flo: true, ink: "#14213d" },
};
const withSettings = (changes) => ({ ...GOOD, settings: { ...GOOD.settings, ...changes } });

// ---------------------------------------------------------------------------
// Part 1: no database needed. Bad requests are rejected before any query runs,
// so this pool throws if it is ever used.
// ---------------------------------------------------------------------------
describe("validation (no database needed)", () => {
    const pool = { query: async () => { throw new Error("database should not be called"); } };
    const app = createApp(pool, { corsOrigin: "http://localhost:5173", createLimit: { max: 1000 } });
    const post = (body) => request(app).post("/api/signatures").send(body);

    it("rejects a name that is too long", async () => {
        const res = await post({ ...GOOD, name: "x".repeat(41) });
        assert.equal(res.status, 400);
        assert.match(res.body.errors[0], /name must be 1 to 40/);
    });

    it("rejects pen: 99", async () => {
        const res = await post(withSettings({ pen: 99 }));
        assert.equal(res.status, 400);
        assert.match(res.body.errors[0], /settings\.pen/);
    });

    it("rejects an unknown style", async () => {
        const res = await post({ ...GOOD, style: "comic" });
        assert.equal(res.status, 400);
        assert.match(res.body.errors[0], /style must be one of/);
    });

    it("rejects numbers sent as strings", async () => {
        assert.equal((await post({ ...GOOD, seed: "3" })).status, 400);
    });

    it("rejects unknown fields", async () => {
        assert.equal((await post({ ...GOOD, version: 99 })).status, 400);
        assert.equal((await post(withSettings({ evil: 1 }))).status, 400);
    });

    it("rejects unsafe characters in the name", async () => {
        assert.equal((await post({ ...GOOD, name: "<script>" })).status, 400);
    });

    it("rejects a blocked name", async () => {
        const res = await post({ ...GOOD, name: "F u c k" });
        assert.equal(res.status, 400);
        assert.equal(res.body.message, "That name is not allowed");
    });

    it("reports every problem at once", async () => {
        const res = await post({ ...GOOD, style: "x", seed: -1 });
        assert.equal(res.body.errors.length, 2);
    });

    it("returns JSON (not HTML) for broken JSON", async () => {
        const res = await request(app).post("/api/signatures").set("Content-Type", "application/json").send("{bad");
        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Request body is not valid JSON");
    });

    it("rejects a body over 10kb", async () => {
        assert.equal((await post({ ...GOOD, pad: "x".repeat(20000) })).status, 413);
    });

    it("rejects bad list parameters", async () => {
        for (const q of ["limit=0", "limit=51", "limit=abc", "limit=1.5", "limit=1&limit=2", "cursor=garbage"]) {
            const res = await request(app).get(`/api/signatures?${q}`);
            assert.equal(res.status, 400, q);
        }
    });

    it("returns 404 for an id that cannot exist and for unknown routes", async () => {
        assert.equal((await request(app).get("/api/signatures/abc")).status, 404);
        assert.equal((await request(app).get("/nope")).status, 404);
    });

    it("health check works and CORS only allows the frontend origin", async () => {
        const ok = await request(app).get("/api/health").set("Origin", "http://localhost:5173");
        assert.equal(ok.body.ok, true);
        assert.equal(ok.headers["access-control-allow-origin"], "http://localhost:5173");
        const other = await request(app).get("/api/health").set("Origin", "http://evil.example");
        assert.equal(other.headers["access-control-allow-origin"], undefined);
    });
});

// ---------------------------------------------------------------------------
// Part 2: needs a real test database (TEST_DATABASE_URL in .env).
// Skipped automatically if it is not set.
// ---------------------------------------------------------------------------
describe("with a database", { skip: !process.env.TEST_DATABASE_URL && "TEST_DATABASE_URL not set" }, () => {
    let pool, app;

    before(async () => {
        // Safety: this suite empties the table, so never point it at your real data
        assert.notEqual(
            process.env.TEST_DATABASE_URL,
            process.env.DATABASE_URL,
            "TEST_DATABASE_URL must be a different database from DATABASE_URL"
        );
        pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
        await pool.query(fs.readFileSync(new URL("../migrations/001_create_signatures.sql", import.meta.url), "utf8"));
        app = createApp(pool, { createLimit: { max: 1000 } });
    });

    beforeEach(() => pool.query("TRUNCATE signatures"));
    after(() => pool.end());

    it("creates a signature and reads it back", async () => {
        const created = await request(app).post("/api/signatures").send(GOOD);
        assert.equal(created.status, 201);
        assert.equal(created.body.id.length, 8);

        const found = await request(app).get(`/api/signatures/${created.body.id}`);
        assert.equal(found.status, 200);
        assert.equal(found.body.name, "Alex Morgan");
        assert.equal(found.body.version, 1);
        assert.deepEqual(found.body.settings, GOOD.settings);
    });

    it("trims the name before saving", async () => {
        const res = await request(app).post("/api/signatures").send({ ...GOOD, name: "  Priya  " });
        const found = await request(app).get(`/api/signatures/${res.body.id}`);
        assert.equal(found.body.name, "Priya");
    });

    it("returns 404 for an id that looks valid but does not exist", async () => {
        assert.equal((await request(app).get("/api/signatures/AAAAAAAA")).status, 404);
    });

    it("does not save anything when validation fails", async () => {
        await request(app).post("/api/signatures").send(withSettings({ pen: 99 }));
        const { rows } = await pool.query("SELECT count(*)::int AS n FROM signatures");
        assert.equal(rows[0].n, 0);
    });

    it("blocks the 4th create within the window (limit set to 3)", async () => {
        const limited = createApp(pool, { createLimit: { max: 3 } });
        for (let i = 0; i < 3; i++) {
            assert.equal((await request(limited).post("/api/signatures").send(GOOD)).status, 201);
        }
        const res = await request(limited).post("/api/signatures").send(GOOD);
        assert.equal(res.status, 429);
    });

    it("pages through every row exactly once, newest first (53 rows, with ties and microsecond gaps)", async () => {
        // 20 rows with the SAME timestamp (tests the id tie-break)
        await pool.query(`INSERT INTO signatures (id, name, style, seed, settings, created_at)
            SELECT 'tie' || lpad(i::text, 5, '0'), 'Tie ' || i, 'scripts', 1, '{}'::jsonb, TIMESTAMPTZ '2026-01-01 10:00:00+00'
            FROM generate_series(1, 20) AS i`);
        // 20 rows only MICROSECONDS apart (tests that the cursor keeps full precision)
        await pool.query(`INSERT INTO signatures (id, name, style, seed, settings, created_at)
            SELECT 'mic' || lpad(i::text, 5, '0'), 'Micro ' || i, 'scripts', 1, '{}'::jsonb,
                   TIMESTAMPTZ '2026-01-01 11:00:00+00' + (i || ' microseconds')::interval
            FROM generate_series(1, 20) AS i`);
        // 13 ordinary rows
        await pool.query(`INSERT INTO signatures (id, name, style, seed, settings, created_at)
            SELECT 'sec' || lpad(i::text, 5, '0'), 'Sec ' || i, 'scripts', 1, '{}'::jsonb,
                   TIMESTAMPTZ '2026-01-02 00:00:00+00' + (i || ' seconds')::interval
            FROM generate_series(1, 13) AS i`);

        const seen = [];
        let cursor = null;
        let pages = 0;
        do {
            const url = `/api/signatures?limit=10${cursor ? `&cursor=${cursor}` : ""}`;
            const res = await request(app).get(url);
            assert.equal(res.status, 200);
            seen.push(...res.body.items.map((item) => item.id));
            cursor = res.body.nextCursor;
            pages++;
            assert.ok(pages <= 10, "too many pages, possible infinite loop");
        } while (cursor);

        const expected = (await pool.query("SELECT id FROM signatures ORDER BY created_at DESC, id DESC")).rows.map((r) => r.id);
        assert.equal(seen.length, 53);
        assert.equal(new Set(seen).size, 53, "duplicate rows across pages");
        assert.deepEqual(seen, expected, "rows are out of order or some were skipped");
        assert.equal(pages, 6);
    });

    it("returns an empty list with no cursor when there are no rows", async () => {
        const res = await request(app).get("/api/signatures");
        assert.deepEqual(res.body, { items: [], nextCursor: null });
    });

    it("the last page has no nextCursor when the rows fit exactly", async () => {
        for (let i = 0; i < 3; i++) await request(app).post("/api/signatures").send(GOOD);
        const res = await request(app).get("/api/signatures?limit=3");
        assert.equal(res.body.items.length, 3);
        assert.equal(res.body.nextCursor, null);
    });
});
