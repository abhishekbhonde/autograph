import express from "express";
import pool from "../../config/db.js";

const router = express.Router();

router.post("/signup", async (req, res)=>{
    try{
        const {name, email, password} = req.body;

        const query = `INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3) RETURNING *`;
        const result = await pool.query(query, [name, email, password]);
        res.status(201).json({message: "User signed up successfully", user: result.rows[0]});
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Error occurred while signing up"});
    }
})

router.post("/signin", async(req, res)=>{
    try{
        const {email, password} = req.body;
        const query = `SELECT * FROM users WHERE email = $1 AND password = $2`;
        const result = await pool.query(query, [email, password]);

        if(result.rows.length === 0){
            return res.status(401).json({message: "Invalid email or password"});
        }

        res.status(200).json({message: "User signed in successfully", user: result.rows[0]});
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Error occurred while signing in"});
    }
})

export default router;