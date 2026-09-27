const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
    origin: [
        "https://parksense-dashboard.onrender.com",
        "http://localhost:3004"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL
        ? { rejectUnauthorized: false }
        : false
});

async function initDatabase() {
    const client = await pool.connect();

    try {
        console.log("Initialising database...");

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL
            );

            CREATE TABLE IF NOT EXISTS parking_spaces (
                parking_space_id INTEGER PRIMARY KEY,
                location VARCHAR(100) NOT NULL,
                occupancy_status BOOLEAN NOT NULL DEFAULT FALSE,
                last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS reservations (
                reservation_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(user_id),
                parking_space_id INTEGER NOT NULL REFERENCES parking_spaces(parking_space_id),
                reservation_status VARCHAR(30) NOT NULL,
                entry_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                exit_time TIMESTAMP NULL
            );
        `);

        await client.query(`
            INSERT INTO users (name, email)
            VALUES ('Test User', 'testuser@smartparking.com')
            ON CONFLICT (email) DO NOTHING;
        `);

        await client.query(`
            INSERT INTO parking_spaces
                (parking_space_id, location, occupancy_status)
            VALUES
                (1, 'A01', FALSE),
                (2, 'A02', FALSE),
                (3, 'A03', FALSE),
                (4, 'A04', FALSE),
                (5, 'A05', FALSE),
                (6, 'B01', FALSE),
                (7, 'B02', FALSE),
                (8, 'B03', FALSE),
                (9, 'B04', FALSE),
                (10, 'B05', FALSE)
            ON CONFLICT (parking_space_id) DO NOTHING;
        `);

        console.log("Database initialisation complete.");
    } finally {
        client.release();
    }
}

/* Health check */
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
            status: "healthy"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            service: "Sensor Service",
            status: "unhealthy"
        });
    }
});

/* Get all parking spaces */
app.get("/api/spaces", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                parking_space_id,
                location,
                occupancy_status,
                last_updated
            FROM parking_spaces
            ORDER BY parking_space_id;
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching parking spaces:", error);

        res.status(500).json({
            error: "Failed to fetch parking spaces"
        });
    }
});

/* Update parking space occupancy from sensor data */
app.post("/api/sensor", async (req, res) => {
    try {
        const {
            parking_space_id,
            occupancy_status,
            occupied
        } = req.body;

        if (parking_space_id === undefined) {
            return res.status(400).json({
                error: "parking_space_id is required"
            });
        }

        const finalOccupancy =
            occupancy_status !== undefined
                ? Boolean(occupancy_status)
                : Boolean(occupied);

        const result = await pool.query(
            `
            UPDATE parking_spaces
            SET
                occupancy_status = $1,
                last_updated = CURRENT_TIMESTAMP
            WHERE parking_space_id = $2
            RETURNING *;
            `,
            [finalOccupancy, parking_space_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Parking space not found"
            });
        }

        res.json({
            message: "Sensor data updated successfully",
            space: result.rows[0]
        });
    } catch (error) {
        console.error("Error processing sensor data:", error);

        res.status(500).json({
            error: "Failed to process sensor data"
        });
    }
});

/* Start service only after database is ready */
async function startServer() {
    try {
        await initDatabase();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Sensor Service listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to initialise database:", error);
        process.exit(1);
    }
}

startServer();