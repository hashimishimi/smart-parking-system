const SENSOR_API = "http://localhost:3000";
const ALLOCATION_API = "http://localhost:3001";
const ANALYTICS_API = "http://localhost:3003";

async function loadDashboard() {
    try {
        await Promise.all([
            loadParkingSpaces(),
            loadOccupancyAnalytics(),
            loadReservationAnalytics()
        ]);
    } catch (error) {
        console.error("Dashboard loading error:", error);
    }
}


// Load individual parking spaces
async function loadParkingSpaces() {
    const response = await fetch(`${SENSOR_API}/api/spaces`);

    if (!response.ok) {
        throw new Error("Failed to load parking spaces");
    }

    const spaces = await response.json();

    const grid = document.getElementById("parkingGrid");

    grid.innerHTML = "";

    spaces.forEach(space => {

        const div = document.createElement("div");

        const status = Number(space.occupancy_status) === 1
            ? "occupied"
            : "available";

        const statusText = status === "occupied"
            ? "Occupied"
            : "Available";

        div.className = `space ${status}`;

        div.innerHTML = `
            <div>${space.location}</div>
            <small>${statusText}</small>
        `;

        grid.appendChild(div);
    });
}


// Load occupancy statistics
async function loadOccupancyAnalytics() {
    const response = await fetch(
        `${ANALYTICS_API}/api/analytics/occupancy`
    );

    if (!response.ok) {
        throw new Error("Failed to load occupancy analytics");
    }

    const data = await response.json();

    document.getElementById("totalSpaces").textContent =
        data.total_spaces;

    document.getElementById("occupiedSpaces").textContent =
        data.occupied_spaces;

    document.getElementById("availableSpaces").textContent =
        data.available_spaces;
}


// Load reservation statistics
async function loadReservationAnalytics() {
    const response = await fetch(
        `${ANALYTICS_API}/api/analytics/reservations`
    );

    if (!response.ok) {
        throw new Error("Failed to load reservation analytics");
    }

    const data = await response.json();

    document.getElementById("totalReservations").textContent =
        data.total_reservations;

    document.getElementById("activeReservations").textContent =
        data.active_reservations;

    document.getElementById("completedReservations").textContent =
        data.completed_reservations;
}


// Reserve a parking space
async function reserveParking() {

    const userId =
        document.getElementById("userId").value;

    const result =
        document.getElementById("reservationResult");

    if (!userId) {
        result.className = "error";
        result.textContent = "Please enter a User ID.";
        return;
    }

    try {

        const response = await fetch(
            `${ALLOCATION_API}/api/allocate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: Number(userId)
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Parking allocation failed"
            );
        }

        result.className = "success";

        result.innerHTML = `
            <strong>Reservation successful!</strong><br>
            Reservation ID: ${data.reservation_id}<br>
            Parking Space: ${data.location}<br>
            Status: ${data.reservation_status}
        `;

        // Refresh dashboard data
        await loadDashboard();

    } catch (error) {

        console.error("Reservation error:", error);

        result.className = "error";

        result.textContent =
            error.message || "Failed to reserve parking.";
    }
}


// Load dashboard when page opens
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();

    // Refresh every 10 seconds
    setInterval(loadDashboard, 10000);
});