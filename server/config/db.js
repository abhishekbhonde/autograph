import {Pool} from "pg";
import dotenv from "dotenv";
dotenv.config();
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL
})

pool.on("error", (err, client)=>{
    console.error("Unexpected error on idle client", err);
})

export default pool;