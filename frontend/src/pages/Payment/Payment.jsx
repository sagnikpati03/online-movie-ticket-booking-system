import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../pictures/logo.png";
import { API_URL } from "../../config/api";
import { formatDisplayDate, formatDisplayTime, getPosterUrl } from "../../utils/display";
import "./Payment.css";

function Payment() {
    const location = useLocation();
    const navigate = useNavigate();

    const booking = location.state || {};
    const show = booking.show || {};
    const movie = booking.movie || {};
    const rawSeats = Array.isArray(booking.seats) ? booking.seats : [];
    const seats = [...new Map(rawSeats.map((seat) => [
        String(seat.seat_number || seat.id).trim().toUpperCase(), seat
    ])).values()];
    const seatIds = [...new Set(seats.map((seat) => Number(seat.id)).filter(Number.isInteger))];

    const [paymentMethod, setPaymentMethod] = useState("upi");
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    const amount = seats.reduce((sum, seat) => sum + Number(seat.price || 0), 0);

    const formatDate = (value) => formatDisplayDate(value);
    const formatTime = (value) => formatDisplayTime(value);
    const poster = getPosterUrl(movie.poster_url);

    const handlePayment = async (event) => {
        event.preventDefault();
        setError("");

        if (!booking.showId || seatIds.length === 0) {
            setError("Your seat selection is missing. Please select your seats again.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        try {
            setProcessing(true);

            const response = await fetch(`${API_URL}/api/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    showId: Number(booking.showId),
                    seatIds,
                    paymentMethod
                })
            });

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "Payment or booking failed. Please try again.");
            }

            const createdBooking = data.booking;
            if (!createdBooking?.id) {
                throw new Error("The booking was created, but no booking ID was returned.");
            }

            navigate(`/booking-confirmation/${createdBooking.id}`, {
                replace: true,
                state: { booking: createdBooking }
            });
        } catch (err) {
            setError(err.message || "Unable to complete booking.");
        } finally {
            setProcessing(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    if (!booking.showId || seatIds.length === 0) {
        return (
            <div className="payment-page">
                <header className="payment-navbar">
                    <button className="payment-logo" onClick={() => navigate("/home")} aria-label="Go home">
                        <img src={logo} alt="Movie Ticket Booking" />
                    </button>
                </header>
                <main className="payment-empty">
                    <h2>No booking to pay for</h2>
                    <p>Please choose a movie show and select your seats first.</p>
                    <button className="payment-primary-button" onClick={() => navigate("/home")}>Browse Movies</button>
                </main>
            </div>
        );
    }

    return (
        <div className="payment-page" style={{ "--movie-backdrop": poster ? `url("${poster}")` : "none" }}>
            <header className="payment-navbar">
                <button className="payment-logo" onClick={() => navigate("/home")} aria-label="Go home">
                    <img src={logo} alt="Movie Ticket Booking" />
                </button>
                <nav className="payment-nav-links">
                    <button onClick={() => navigate("/home")}>Home</button>
                    <button onClick={() => navigate("/my-bookings")}>My Bookings</button>
                    <button onClick={handleLogout}>Logout</button>
                </nav>
            </header>

            <main className="payment-container">
                <button className="payment-back-button" onClick={() => navigate(-1)}>← Back to Seats</button>

                <div className="payment-heading">
                    <p className="payment-eyebrow">SECURE CHECKOUT</p>
                    <h1>Payment</h1>
                    <p>Review your booking and choose a payment method.</p>
                </div>

                <div className="payment-layout">
                    <section className="payment-method-card">
                        <h2>Choose payment method</h2>

                        <form onSubmit={handlePayment}>
                            <div className="payment-method-options">
                                <label className={`payment-method-option ${paymentMethod === "upi" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="upi"
                                        checked={paymentMethod === "upi"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="payment-method-icon">↗</span>
                                    <span className="payment-method-copy">
                                        <strong>UPI</strong>
                                        <small>Pay using a UPI app (demo)</small>
                                    </span>
                                </label>

                                <label className={`payment-method-option ${paymentMethod === "card" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={paymentMethod === "card"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="payment-method-icon">▰</span>
                                    <span className="payment-method-copy">
                                        <strong>Credit / Debit Card</strong>
                                        <small>Card payment simulation</small>
                                    </span>
                                </label>

                                <label className={`payment-method-option ${paymentMethod === "netbanking" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="netbanking"
                                        checked={paymentMethod === "netbanking"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="payment-method-icon">▦</span>
                                    <span className="payment-method-copy">
                                        <strong>Net Banking</strong>
                                        <small>Bank payment simulation</small>
                                    </span>
                                </label>
                            </div>

                            <div className="payment-demo-notice">
                                <strong>Demo payment</strong>
                                <span>This is a demo payment</span>
                            </div>

                            {error && <p className="payment-error">{error}</p>}

                            <button className="payment-primary-button payment-submit" type="submit" disabled={processing}>
                                {processing ? "Processing..." : `Pay ₹${amount.toFixed(2)} & Confirm Booking`}
                            </button>
                        </form>
                    </section>

                    <aside className="payment-summary-card">
                        <h2>Booking summary</h2>

                        <div className="payment-movie-summary">
                            {poster ? (
                                <img src={poster} alt={movie.title || "Movie poster"} />
                            ) : (
                                <div className="payment-poster-placeholder">🎬</div>
                            )}
                            <div>
                                <strong>{movie.title || show.movie_title || "Movie"}</strong>
                                <span>{show.theatre_name || "Theatre"}</span>
                                <span>{show.screen_name || "Screen"}</span>
                            </div>
                        </div>

                        <div className="payment-summary-line">
                            <span>Date</span>
                            <strong>{formatDate(show.show_date)}</strong>
                        </div>
                        <div className="payment-summary-line">
                            <span>Show time</span>
                            <strong>{formatTime(show.start_time)}</strong>
                        </div>
                        <div className="payment-summary-line">
                            <span>Seats ({seats.length})</span>
                            <strong>{seats.map((seat) => seat.seat_number).join(", ") || "—"}</strong>
                        </div>

                        <div className="payment-summary-seats">
                            {seats.map((seat) => (
                                <div className="payment-summary-line" key={seat.id}>
                                    <span>{seat.seat_number} · {seat.seat_type || "Regular"}</span>
                                    <strong>₹{Number(seat.price || 0).toFixed(2)}</strong>
                                </div>
                            ))}
                        </div>

                        <div className="payment-total-line">
                            <span>Total</span>
                            <strong>₹{amount.toFixed(2)}</strong>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default Payment;
