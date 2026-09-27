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


INSERT INTO users (
    name,
    email
)

VALUES (
    'Test User',
    'testuser@smartparking.com'
)

ON CONFLICT (email)
DO NOTHING;


INSERT INTO parking_spaces (
    parking_space_id,
    location,
    occupancy_status
)

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

ON CONFLICT (parking_space_id)
DO NOTHING;