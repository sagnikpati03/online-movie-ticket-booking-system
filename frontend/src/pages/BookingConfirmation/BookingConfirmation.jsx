import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import logo from "../../pictures/logo.png";
import { API_URL } from "../../config/api";
import "./BookingConfirmation.css";

function BookingConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingId: routeBookingId } = useParams();

    const [booking, setBooking] = useState(
        location.state?.booking || null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBooking = async () => {
        try {
            setLoading(true);
            setError("");

            const stateBookingId =
                location.state?.booking?.id ||
                location.state?.booking?.bookingId;

            const id = routeBookingId || stateBookingId;

            if (!id) {
                throw new Error(
                    "No booking was provided. Open this page from a completed booking."
                );
            }

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            const response = await fetch(
                `${API_URL}/api/bookings/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load booking."
                );
            }

            setBooking(data.booking);
        } catch (err) {
            console.error("Booking confirmation error:", err);
            setError(
                err.message || "Unable to load booking confirmation."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBooking();
    }, [routeBookingId]);


    const formatDate = (value) => {
        if (!value) return "N/A";

        const date = new Date(`${value}T00:00:00`);

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };


    const formatTime = (value) => {
        if (!value) return "N/A";

        const [hourString, minuteString] =
            String(value).slice(0, 5).split(":");

        let hour = Number(hourString);

        const period = hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${hour}:${minuteString || "00"} ${period}`;
    };


    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };


    if (loading) {
        return (
            <div className="confirmation-page">

                <div className="confirmation-loading">

                    <div className="loading-spinner"></div>

                    <h2>
                        Loading booking confirmation...
                    </h2>

                </div>

            </div>
        );
    }


    if (error || !booking) {
        return (
            <div className="confirmation-page">

                <header className="confirmation-navbar">

                    <div
                        className="confirmation-logo"
                        onClick={() => navigate("/home")}
                    >
                        <img
                            src={logo}
                            alt="Movie Ticket Booking"
                        />
                    </div>

                </header>


                <div className="confirmation-error">

                    <div className="error-icon">
                        !
                    </div>

                    <h2>
                        Booking Not Found
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() => navigate("/my-bookings")}
                    >
                        Go to My Bookings
                    </button>

                </div>

            </div>
        );
    }


    const seats = Array.isArray(booking.seats)
        ? booking.seats
        : [];

    const movieTitle =
        booking.movie_title || "Movie";

    const bookingCode =
        booking.booking_code || booking.id;

    const paymentMethod =
        booking.payment_method
            ? booking.payment_method.toUpperCase()
            : "N/A";


    return (
        <div className="confirmation-page">

            <header className="confirmation-navbar">

                <div
                    className="confirmation-logo"
                    onClick={() => navigate("/home")}
                >
                    <img
                        src={logo}
                        alt="Movie Ticket Booking"
                    />
                </div>


                <nav>

                    <button
                        onClick={() => navigate("/home")}
                    >
                        Home
                    </button>

                    <button
                        onClick={() => navigate("/my-bookings")}
                    >
                        My Bookings
                    </button>

                    <button
                        className="confirmation-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </nav>

            </header>


            <main className="confirmation-container">

                <section className="success-section">

                    <div className="success-icon">
                        ✓
                    </div>

                    <h1>
                        Booking Confirmed!
                    </h1>

                    <p>
                        Your movie tickets have been booked successfully.
                    </p>

                    <div className="booking-number">

                        <span>
                            Booking Code
                        </span>

                        <strong>
                            {bookingCode}
                        </strong>

                    </div>

                </section>


                <section className="ticket-card">

                    <div className="ticket-header">

                        <div>

                            <span className="ticket-label">
                                MOVIE TICKET
                            </span>

                            <h2>
                                {movieTitle}
                            </h2>

                        </div>

                        <img
                            src={logo}
                            alt="Movie Ticket Booking"
                            className="ticket-logo"
                        />

                    </div>


                    <div className="ticket-body">

                        <div className="movie-poster-container">

                            {booking.poster_url ? (
                                <img
                                    src={booking.poster_url}
                                    alt={movieTitle}
                                    className="movie-poster"
                                />
                            ) : (
                                <div className="poster-placeholder">
                                    🎬
                                </div>
                            )}

                        </div>


                        <div className="ticket-details">

                            <div className="detail-item">

                                <span>
                                    Customer
                                </span>

                                <strong>
                                    {booking.customer_name || "Customer"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Theatre
                                </span>

                                <strong>
                                    {booking.theatre_name || "N/A"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Screen
                                </span>

                                <strong>
                                    {booking.screen_name || "N/A"}
                                </strong>

                            </div>


                            <div className="detail-row">

                                <div className="detail-item">

                                    <span>
                                        Date
                                    </span>

                                    <strong>
                                        {formatDate(booking.show_date)}
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Time
                                    </span>

                                    <strong>
                                        {formatTime(booking.start_time)}
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Seats
                                </span>

                                <strong className="seat-value">
                                    {seats.length
                                        ? seats
                                            .map(seat => seat.seat_number)
                                            .join(", ")
                                        : "N/A"}
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div className="ticket-divider">
                        <span></span>
                        <span></span>
                    </div>


                    <div className="payment-summary">

                        <div>

                            <span>
                                Payment
                            </span>

                            <strong>
                                {paymentMethod}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Payment Status
                            </span>

                            <strong>
                                {booking.payment_status
                                    ? booking.payment_status.toUpperCase()
                                    : booking.status?.toUpperCase()}
                            </strong>

                        </div>


                        <div className="total-price">

                            <span>
                                Total Paid
                            </span>

                            <strong>
                                ₹{Number(
                                    booking.total_amount || 0
                                ).toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </section>


                <section className="confirmation-actions">

                    <button
                        className="primary-action"
                        onClick={() =>
                            navigate("/my-bookings")
                        }
                    >
                        View My Bookings
                    </button>

                    <button
                        className="secondary-action"
                        onClick={() => window.print()}
                    >
                        Print Ticket
                    </button>

                    <button
                        className="secondary-action"
                        onClick={() => navigate("/home")}
                    >
                        Back to Home
                    </button>

                </section>


                <p className="confirmation-note">
                    Please keep your booking code for future reference.
                </p>

            </main>

        </div>
    );
}

export default BookingConfirmation;
