const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false
});

app.get("/", (req, res) => {
    res.json({
        service: "Analytics Service",
        status: "running"
    });
});

app.get("/health", async (req, res) => {

    try {

        await pool.query("SELECT 1");

        res.json({
            service: "Analytics Service",
            database: "connected"
        });

    } catch (error) {

        res.status(500).json({
            service: "Analytics Service",
            database: "unavailable"
        });
    }
});

app.get("/api/analytics/occupancy", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                COUNT(*) AS total_spaces,
                COUNT(*) FILTER (
                    WHERE occupancy_status = TRUE
                ) AS occupied_spaces,
                COUNT(*) FILTER (
                    WHERE occupancy_status = FALSE
                ) AS available_spaces
            FROM parking_spaces
        `);

        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to calculate occupancy"
        });
    }
});

app.get("/api/analytics/reservations", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                reservation_id,
                user_id,
                parking_space_id,
                reservation_status,
                entry_time,
                exit_time
            FROM reservations
            ORDER BY reservation_id DESC
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch reservations"
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Analytics Service listening on port ${PORT}`);
});