const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3001;

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
        service: "Parking Allocation Service",
        status: "running"
    });
});

app.post("/api/allocate", async (req, res) => {

    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({
            error: "user_id is required"
        });
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const user = await client.query(
            "SELECT user_id FROM users WHERE user_id = $1",
            [user_id]
        );

        if (user.rowCount === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "User not found"
            });
        }

        const space = await client.query(`
            SELECT
                parking_space_id,
                location
            FROM parking_spaces
            WHERE occupancy_status = FALSE
            ORDER BY parking_space_id
            LIMIT 1
            FOR UPDATE SKIP LOCKED
        `);

        if (space.rowCount === 0) {

            await client.query("ROLLBACK");

            return res.status(409).json({
                error: "No parking spaces available"
            });
        }

        const selected = space.rows[0];

        const reservation = await client.query(`
            INSERT INTO reservations
                (
                    user_id,
                    parking_space_id,
                    reservation_status
                )
            VALUES
                (
                    $1,
                    $2,
                    'Reserved'
                )
            RETURNING *
        `, [
            user_id,
            selected.parking_space_id
        ]);

        await client.query(`
            UPDATE parking_spaces
            SET
                occupancy_status = TRUE,
                last_updated = CURRENT_TIMESTAMP
            WHERE parking_space_id = $1
        `, [
            selected.parking_space_id
        ]);

        await client.query("COMMIT");

        res.json({
            message: "Parking space allocated successfully",
            space: selected,
            reservation: reservation.rows[0]
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            error: "Allocation failed"
        });

    } finally {

        client.release();
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Parking Allocation Service listening on port ${PORT}`);
});