const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env")
});

const app = express();
const PORT = 3003;

app.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "smart_parking"
});

// Health check
app.get("/", (req, res) => {
  res.json({
    service: "Analytics Service",
    status: "running"
  });
});

// Parking occupancy analytics
app.get("/api/analytics/occupancy", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total_spaces,
        SUM(CASE WHEN occupancy_status = 1 THEN 1 ELSE 0 END) AS occupied_spaces,
        SUM(CASE WHEN occupancy_status = 0 THEN 1 ELSE 0 END) AS available_spaces
      FROM ParkingSpaces
    `);

    const data = rows[0];

    res.json({
      total_spaces: data.total_spaces,
      occupied_spaces: data.occupied_spaces,
      available_spaces: data.available_spaces
    });

  } catch (error) {
    console.error("Occupancy analytics error:", error);
    res.status(500).json({
      error: "Failed to retrieve occupancy analytics"
    });
  }
});

// Reservation analytics
app.get("/api/analytics/reservations", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total_reservations,
        SUM(CASE WHEN reservation_status = 'Reserved' THEN 1 ELSE 0 END) AS active_reservations,
        SUM(CASE WHEN reservation_status = 'Completed' THEN 1 ELSE 0 END) AS completed_reservations
      FROM Reservations
    `);

    const data = rows[0];

    res.json({
      total_reservations: data.total_reservations,
      active_reservations: data.active_reservations,
      completed_reservations: data.completed_reservations
    });

  } catch (error) {
    console.error("Reservation analytics error:", error);
    res.status(500).json({
      error: "Failed to retrieve reservation analytics"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Analytics Service running on port ${PORT}`);
});