const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

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
        service: "Sensor Service",
        status: "running"
    });
});

app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            service: "Sensor Service",
            database: "connected"
        });
    } catch (error) {
        res.status(500).json({
            service: "Sensor Service",
            database: "unavailable"
        });
    }
});

app.get("/api/spaces", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                parking_space_id,
                location,
                occupancy_status,
                last_updated
            FROM parking_spaces
            ORDER BY parking_space_id
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch parking spaces"
        });
    }
});

app.post("/api/sensor", async (req, res) => {

    const {
        sensor_id,
        parking_space_id,
        occupancy_status
    } = req.body;

    if (
        sensor_id === undefined ||
        parking_space_id === undefined ||
        occupancy_status === undefined
    ) {
        return res.status(400).json({
            error: "sensor_id, parking_space_id and occupancy_status are required"
        });
    }

    try {

        const result = await pool.query(`
            UPDATE parking_spaces
            SET
                occupancy_status = $1,
                last_updated = CURRENT_TIMESTAMP
            WHERE parking_space_id = $2
            RETURNING *
        `, [
            Boolean(occupancy_status),
            parking_space_id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Parking space not found"
            });
        }

        res.json({
            message: "Sensor data processed",
            sensor_id,
            space: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to update parking space"
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sensor Service listening on port ${PORT}`);
});