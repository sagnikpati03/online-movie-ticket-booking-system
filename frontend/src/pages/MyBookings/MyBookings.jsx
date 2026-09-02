import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyBookings.css";
import logo from "../../pictures/logo.png";
import { API_URL } from "../../config/api";

function MyBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

    const fetchBookings = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/bookings/my`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "Unable to fetch bookings.");
            }

            setBookings(Array.isArray(data.bookings) ? data.bookings : []);
        } catch (err) {
            console.error("Bookings fetch error:", err);
            setError(err.message || "Unable to load your bookings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    const formatDate = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="bookings-page">
            <nav className="bookings-navbar">
                <Link to="/home" className="bookings-logo">
                    <img src={logo} alt="Movie Ticket Booking" />
                </Link>

                <div className="bookings-nav-links">
                    <Link to="/home">Home</Link>
                    <Link to="/my-bookings" className="active">My Bookings</Link>
                    {user?.role === "admin" && (
                        <Link to="/admin-dashboard">Admin Dashboard</Link>
                    )}
                    <button type="button" onClick={handleLogout}>Logout</button>
                    <div className="bookings-avatar">{initial}</div>
                </div>
            </nav>

            <main className="bookings-content">
                <div className="bookings-heading">
                    <div>
                        <p>YOUR ACCOUNT</p>
                        <h1>My Bookings</h1>
                        <span>View your movie ticket booking history.</span>
                    </div>
                    <Link to="/home" className="browse-link">Browse Movies</Link>
                </div>

                {loading ? (
                    <div className="booking-state">
                        <div>🎟️</div>
                        <h2>Loading bookings...</h2>
                        <p>Please wait while we fetch your booking history.</p>
                    </div>
                ) : error ? (
                    <div className="booking-state">
                        <div>⚠️</div>
                        <h2>Unable to load bookings</h2>
                        <p>{error}</p>
                        <button type="button" onClick={fetchBookings}>Try Again</button>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="booking-state">
                        <div>🎟️</div>
                        <h2>No bookings yet</h2>
                        <p>You haven't booked any movie tickets yet.</p>
                        <Link to="/home">Browse Movies</Link>
                    </div>
                ) : (
                    <div className="booking-list">
                        {bookings.map((booking) => (
                            <article className="booking-card" key={booking.id}>
                                <div className="booking-poster">
                                    {booking.poster_url ? (
                                        <img src={booking.poster_url} alt={booking.movie_title} />
                                    ) : (
                                        <span>🎬</span>
                                    )}
                                </div>

                                <div className="booking-main">
                                    <div className="booking-topline">
                                        <div>
                                            <span className="booking-label">BOOKING CODE</span>
                                            <strong>{booking.booking_code}</strong>
                                        </div>
                                        <span className={`booking-status ${booking.status}`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <h2>{booking.movie_title}</h2>
                                    <p className="booking-theatre">
                                        {booking.theatre_name} • {booking.city}
                                    </p>

                                    <div className="booking-details">
                                        <div>
                                            <span>Date</span>
                                            <strong>{formatDate(booking.show_date)}</strong>
                                        </div>
                                        <div>
                                            <span>Time</span>
                                            <strong>{booking.start_time || "-"}</strong>
                                        </div>
                                        <div>
                                            <span>Seats</span>
                                            <strong>{booking.seat_ids || "-"}</strong>
                                        </div>
                                        <div>
                                            <span>Total</span>
                                            <strong>₹{Number(booking.total_amount || 0).toFixed(2)}</strong>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default MyBookings;
