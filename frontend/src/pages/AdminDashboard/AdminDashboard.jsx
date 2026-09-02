import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import logo from "../../pictures/logo.png";
import { API_URL } from "../../config/api";

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

    const loadDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [statsResponse, bookingsResponse] = await Promise.all([
                fetch(`${API_URL}/api/admin/dashboard`, { headers }),
                fetch(`${API_URL}/api/bookings/all`, { headers })
            ]);

            const statsData = await statsResponse.json();
            const bookingsData = await bookingsResponse.json();

            if (statsResponse.status === 401 || bookingsResponse.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            if (statsResponse.status === 403 || bookingsResponse.status === 403) {
                navigate("/home", { replace: true });
                return;
            }

            if (!statsResponse.ok) {
                throw new Error(statsData.message || "Unable to load dashboard.");
            }

            if (!bookingsResponse.ok) {
                throw new Error(bookingsData.message || "Unable to load bookings.");
            }

            setStats(statsData.stats || {});
            setBookings(Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []);
        } catch (err) {
            console.error("Admin dashboard error:", err);
            setError(err.message || "Unable to load admin dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <div className="admin-page">
            <nav className="admin-navbar">
                <Link to="/home" className="admin-logo">
                    <img src={logo} alt="Movie Ticket Booking" />
                </Link>

                <div className="admin-nav-links">
                    <Link to="/home">Home</Link>
                    <Link to="/my-bookings">My Bookings</Link>
                    <Link to="/admin-dashboard" className="active">Admin Dashboard</Link>
                    <button type="button" onClick={logout}>Logout</button>
                    <div className="admin-avatar" title={user?.name || "Admin"}>{initial}</div>
                </div>
            </nav>

            <main className="admin-content">
                <div className="admin-heading">
                    <div>
                        <p>ADMINISTRATION</p>
                        <h1>Dashboard</h1>
                        <span>Welcome back, {user?.name || "Admin"}. Manage your movie booking system.</span>
                    </div>
                    <Link to="/home" className="admin-home-button">Go to Home</Link>
                </div>

                {error ? (
                    <div className="admin-state">
                        <div>⚠️</div>
                        <h2>Unable to load dashboard</h2>
                        <p>{error}</p>
                        <button type="button" onClick={loadDashboard}>Try Again</button>
                    </div>
                ) : loading ? (
                    <div className="admin-state">
                        <div>📊</div>
                        <h2>Loading dashboard...</h2>
                        <p>Please wait while we fetch the latest information.</p>
                    </div>
                ) : (
                    <>
                        <section className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div><span>Total Users</span><strong>{stats?.total_users ?? 0}</strong></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🎬</div>
                                <div><span>Active Movies</span><strong>{stats?.total_movies ?? 0}</strong></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🎟️</div>
                                <div><span>Total Bookings</span><strong>{stats?.total_bookings ?? 0}</strong></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">₹</div>
                                <div><span>Confirmed Revenue</span><strong>₹{Number(stats?.total_revenue || 0).toFixed(2)}</strong></div>
                            </div>
                        </section>

                        <section className="admin-bookings-section">
                            <div className="admin-section-header">
                                <div>
                                    <p>BOOKING MANAGEMENT</p>
                                    <h2>Recent Bookings</h2>
                                </div>
                                <Link to="/my-bookings">My Bookings</Link>
                            </div>

                            {bookings.length === 0 ? (
                                <div className="admin-empty">
                                    <div>🎟️</div>
                                    <h3>No bookings yet</h3>
                                    <p>Bookings will appear here when customers make reservations.</p>
                                </div>
                            ) : (
                                <div className="admin-table-wrap">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Booking</th>
                                                <th>Customer</th>
                                                <th>Movie</th>
                                                <th>Theatre</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.slice(0, 10).map((booking) => (
                                                <tr key={booking.id}>
                                                    <td><strong>{booking.booking_code}</strong></td>
                                                    <td>
                                                        <strong>{booking.customer_name}</strong>
                                                        <small>{booking.customer_email}</small>
                                                    </td>
                                                    <td>{booking.movie_title}</td>
                                                    <td>{booking.theatre_name}<small>{booking.city}</small></td>
                                                    <td>₹{Number(booking.total_amount || 0).toFixed(2)}</td>
                                                    <td><span className={`admin-status ${booking.status}`}>{booking.status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
