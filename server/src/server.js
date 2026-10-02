import "dotenv/config";
import pool from "./config/db.js";
import { createApp } from "./app.js";

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Copy .env.example to .env and fill it in.");
    process.exit(1);
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
