const SENSOR_API =
    window.__CONFIG__.SENSOR_API_URL;

const ALLOCATION_API =
    window.__CONFIG__.ALLOCATION_API_URL;

const ANALYTICS_API =
    window.__CONFIG__.ANALYTICS_API_URL;

const NOTIFICATION_API =
    window.__CONFIG__.NOTIFICATION_API_URL;


async function getJson(url, options = {}) {

    const response =
        await fetch(url, options);

    const data =
        await response.json();

    if (!response.ok) {

        throw new Error(
            data.error ||
            `Request failed: ${response.status}`
        );
    }

    return data;
}


async function loadData() {

    try {

        const spaces =
            await getJson(
                `${SENSOR_API}/api/spaces`
            );

        const analytics =
            await getJson(
                `${ANALYTICS_API}/api/analytics/reservations`
            );


        const occupied =
            spaces.filter(
                space => space.occupancy_status === true
            ).length;


        document.getElementById("total")
            .textContent = spaces.length;


        document.getElementById("occupied")
            .textContent = occupied;


        document.getElementById("available")
            .textContent =
            spaces.length - occupied;


        document.getElementById("reservations")
            .textContent =
            analytics.length;


        document.getElementById("spaces")
            .innerHTML = spaces.map(space => `

                <div
                    class="space ${
                        space.occupancy_status
                            ? "occupied"
                            : "available"
                    }"
                >

                    <strong>
                        ${space.location}
                    </strong>

                    <div>
                        ${
                            space.occupancy_status
                                ? "Occupied"
                                : "Available"
                        }
                    </div>

                </div>

            `).join("");


        document.getElementById("analytics")
            .innerHTML =
            analytics.length

                ? analytics.map(
                    reservation => `

                        <p>
                            Reservation
                            #${reservation.reservation_id}:
                            User ${reservation.user_id},
                            Space ${reservation.parking_space_id},
                            ${reservation.reservation_status}
                        </p>

                    `
                ).join("")

                : "<p>No reservations yet.</p>";


        document.getElementById("status")
            .textContent =
            "System online";


    } catch (error) {

        console.error(error);

        document.getElementById("status")
            .textContent =
            "API unavailable";
    }
}


async function reserveSpace() {

    const userId =
        Number(
            document.getElementById("userId").value
        );

    const message =
        document.getElementById("message");


    try {

        const result =
            await getJson(
                `${ALLOCATION_API}/api/allocate`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        user_id: userId
                    })
                }
            );


        message.textContent =
            `Reserved ${result.space.location}
             (reservation #${result.reservation.reservation_id}).`;


        if (NOTIFICATION_API) {

            await getJson(
                `${NOTIFICATION_API}/api/notify`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        user_id: userId,

                        message:
                            `Parking space ${result.space.location}
                             reserved successfully.`
                    })
                }
            );
        }


        await loadData();


    } catch (error) {

        message.textContent =
            error.message;
    }
}


loadData();

setInterval(
    loadData,
    10000
);