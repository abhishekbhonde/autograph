import "dotenv/config";
import pool from "./config/db.js";
import { createApp } from "./app.js";

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Copy .env.example to .env and fill it in.");
    process.exit(1);
}

// Ensure Database constraints are updated on startup
if (pool) {
    pool.query(`
        ALTER TABLE signatures DROP CONSTRAINT IF EXISTS signatures_style_valid;
        ALTER TABLE signatures DROP CONSTRAINT IF EXISTS signatures_name_len;
        ALTER TABLE signatures ADD CONSTRAINT signatures_name_len CHECK (char_length(name) BETWEEN 1 AND 80);
    `).then(() => console.log("Database constraints verified.")).catch((err) => console.warn("Auto DB migration notice:", err.message));
}

const port = process.env.PORT || 3000;
const server = createApp(pool).listen(port, () => {
    console.log(`API listening on port ${port}`);
});

// Finish current requests, then close the database connections
const shutdown = () => {
    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
