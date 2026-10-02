import express from "express";
import dotenv from "dotenv"
import pool from "./config/db.js"
import userRoutes from "./src/routes/user.routes.js"
dotenv.config();

const app = express();
app.use(express.json());
app.use("/users", userRoutes);

app.get("/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            message: "Database connected successfully",
            time: result.rows[0].now,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database connection failed",
        });
    }
});




app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})