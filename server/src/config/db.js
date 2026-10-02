import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Without this, an idle-connection error would crash the whole server
pool.on("error", (error) => {
    console.error("Unexpected database error:", error.message);
});

export default pool;
