// Runs every .sql file in /migrations in order.
// Every file uses IF NOT EXISTS, so running this twice is safe.
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../src/config/db.js";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../migrations");

try {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
    for (const file of files) {
        await pool.query(fs.readFileSync(path.join(dir, file), "utf8"));
        console.log("applied", file);
    }
} catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}
