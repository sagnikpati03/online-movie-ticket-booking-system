CREATE DATABASE IF NOT EXISTS movie_ticket_booking;

USE movie_ticket_booking;


-- 1. USERS

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- 2. MOVIES

CREATE TABLE movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    genre VARCHAR(50),
    language VARCHAR(50),
    duration_minutes INT NOT NULL,
    release_date DATE,
    certificate VARCHAR(10),
    director VARCHAR(100),
    `cast` TEXT,
    poster_url VARCHAR(255),
    trailer_url VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_movie_duration
        CHECK (duration_minutes > 0)
) ENGINE=InnoDB;


-- 3. THEATRES

CREATE TABLE theatres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(50) NOT NULL,
    contact VARCHAR(20)
) ENGINE=InnoDB;


-- 4. SCREENS

CREATE TABLE screens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    theatre_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    seat_capacity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_screens_theatre
        FOREIGN KEY (theatre_id)
        REFERENCES theatres(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_screen_capacity
        CHECK (seat_capacity >= 0),

    UNIQUE KEY unique_screen_name (theatre_id, name)
) ENGINE=InnoDB;

-- 5. SEATS

CREATE TABLE seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    screen_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_type ENUM('regular', 'premium', 'vip') DEFAULT 'regular',
    price_multiplier DECIMAL(3,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_seats_screen
        FOREIGN KEY (screen_id)
        REFERENCES screens(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT unique_seat
        UNIQUE (screen_id, seat_number),

    CONSTRAINT chk_seat_multiplier
        CHECK (price_multiplier > 0)
) ENGINE=InnoDB;

-- 6. SHOWS

CREATE TABLE shows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    theatre_id INT NOT NULL,
    screen_id INT NOT NULL,
    show_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_shows_movie
        FOREIGN KEY (movie_id)
        REFERENCES movies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_shows_theatre
        FOREIGN KEY (theatre_id)
        REFERENCES theatres(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_shows_screen
        FOREIGN KEY (screen_id)
        REFERENCES screens(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_show_price
        CHECK (base_price >= 0),

    CONSTRAINT chk_show_time
        CHECK (end_time > start_time)
) ENGINE=InnoDB;

-- 7. BOOKINGS

CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_code VARCHAR(20) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    show_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled')
        DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bookings_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_bookings_show
        FOREIGN KEY (show_id)
        REFERENCES shows(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_booking_amount
        CHECK (total_amount >= 0)
) ENGINE=InnoDB;



-- 8. BOOKING SEATS

CREATE TABLE booking_seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    seat_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_booking_seats_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_seats_seat
        FOREIGN KEY (seat_id)
        REFERENCES seats(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT unique_booking_seat
        UNIQUE (booking_id, seat_id),

    CONSTRAINT chk_booking_seat_price
        CHECK (price >= 0)
) ENGINE=InnoDB;



-- 9. PAYMENTS

CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    payment_method ENUM('upi', 'card', 'netbanking') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('success', 'failed', 'pending')
        DEFAULT 'pending',
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT unique_payment_booking
        UNIQUE (booking_id),

    CONSTRAINT chk_payment_amount
        CHECK (amount >= 0)
) ENGINE=InnoDB;