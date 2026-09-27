import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import logo from "../../pictures/logo.png";
import { API_URL } from "../../config/api";
import { formatDisplayDate, formatDisplayTime, getPosterUrl } from "../../utils/display";
import "./SeatSelection.css";

function SeatSelection() {
    const { showId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [show, setShow] = useState(location.state?.show || null);
    const [movie, setMovie] = useState(location.state?.movie || null);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadSeats() {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login", { replace: true });
                    return;
                }

                const response = await fetch(
                    `${API_URL}/api/bookings/shows/${showId}/seats`,
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
                    throw new Error(data.message || "Unable to load seats.");
                }

                if (!cancelled) {
                    setShow(data.show || location.state?.show || null);
                    setMovie(data.movie || location.state?.movie || null);
                    setSeats(Array.isArray(data.seats) ? data.seats : []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Unable to load seats.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (showId) loadSeats();

        return () => {
            cancelled = true;
        };
    }, [showId, navigate]);

    const sortedSeats = useMemo(() => {
        // Defensive deduplication by normalized seat label for old databases.
        const unique = new Map();
        [...seats].sort((a, b) => Number(a.id) - Number(b.id)).forEach((seat) => {
            const label = String(seat.seat_number || "").trim().toUpperCase();
            if (label && !unique.has(label)) unique.set(label, seat);
        });
        return [...unique.values()].sort((a, b) =>
            String(a.seat_number).localeCompare(String(b.seat_number), undefined, {
                numeric: true,
                sensitivity: "base"
            })
        );
    }, [seats]);

    const seatRows = useMemo(() => {
        const rows = new Map();
        const hasLetterRows = sortedSeats.some((seat) => /^[A-Za-z]+/.test(String(seat.seat_number || "")));

        if (hasLetterRows) {
            sortedSeats.forEach((seat) => {
                const rowName = String(seat.seat_number || "").match(/^[A-Za-z]+/)?.[0] || "Other";
                if (!rows.has(rowName)) rows.set(rowName, []);
                rows.get(rowName).push(seat);
            });
        } else {
            // Numeric-only seat labels are split into rows of 4 instead of one long line.
            sortedSeats.forEach((seat, index) => {
                const rowName = String.fromCharCode(65 + Math.floor(index / 4));
                if (!rows.has(rowName)) rows.set(rowName, []);
                rows.get(rowName).push(seat);
            });
        }
        return Array.from(rows.entries());
    }, [sortedSeats]);

    const selectedSeatObjects = sortedSeats.filter((seat) =>
        selectedSeats.includes(Number(seat.id))
    );

    const totalAmount = selectedSeatObjects.reduce(
        (sum, seat) => sum + Number(seat.price || 0),
        0
    );

    const toggleSeat = (seat) => {
        if (seat.is_booked || !seat.is_active) return;

        const id = Number(seat.id);
        if (!Number.isInteger(id)) return;
        setSelectedSeats((current) =>
            current.includes(id)
                ? current.filter((selectedId) => selectedId !== id)
                : [...current, id]
        );
    };

    const continueToPayment = () => {
        if (!selectedSeats.length) {
            setError("Please select at least one available seat.");
            return;
        }

        navigate("/payment", {
            state: {
                showId: Number(showId),
                show,
                movie,
                seats: selectedSeatObjects,
                seatIds: selectedSeats,
                totalAmount
            }
        });
    };

    const formatDate = (value) => formatDisplayDate(value);
    const formatTime = (value) => formatDisplayTime(value);
    const poster = getPosterUrl(movie?.poster_url);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    if (loading) {
        return (
            <div className="seat-page">
                <div className="seat-state">
                    <div className="seat-spinner" />
                    <p>Loading seat availability...</p>
                </div>
            </div>
        );
    }

    if (error && seats.length === 0) {
        return (
            <div className="seat-page">
                <header className="seat-navbar">
                    <button className="seat-logo" onClick={() => navigate("/home")} aria-label="Go home">
                        <img src={logo} alt="Movie Ticket Booking" />
                    </button>
                </header>
                <div className="seat-state seat-error">
                    <h2>Unable to load seats</h2>
                    <p>{error}</p>
                    <button className="seat-primary-button" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="seat-page" style={{ "--movie-backdrop": poster ? `url("${poster}")` : "none" }}>
            <header className="seat-navbar">
                <button className="seat-logo" onClick={() => navigate("/home")} aria-label="Go home">
                    <img src={logo} alt="Movie Ticket Booking" />
                </button>
                <nav className="seat-nav-links">
                    <button onClick={() => navigate("/home")}>Home</button>
                    <button onClick={() => navigate("/my-bookings")}>My Bookings</button>
                    <button onClick={handleLogout}>Logout</button>
                </nav>
            </header>

            <main className="seat-container">
                <button className="seat-back-button" onClick={() => navigate(-1)}>← Back</button>

                <section className="seat-heading">
                    <p className="seat-eyebrow">BOOK YOUR TICKETS</p>
                    <h1>Select Your Seats</h1>
                    <p className="seat-subtitle">
                        {movie?.title || show?.movie_title || "Movie"} · {show?.theatre_name || "Theatre"}
                    </p>
                    <div className="seat-show-meta">
                        <span>{show?.screen_name || "Screen"}</span>
                        <span>{formatDate(show?.show_date)}</span>
                        <span>{formatTime(show?.start_time)}</span>
                    </div>
                </section>

                <section className="seat-layout-card">
                    <div className="seat-screen">SCREEN THIS WAY</div>

                    <div className="seat-legend">
                        <span><i className="legend-seat available" /> Available</span>
                        <span><i className="legend-seat selected" /> Selected</span>
                        <span><i className="legend-seat booked" /> Booked</span>
                    </div>

                    {seatRows.length ? (
                        <div className="seat-map">
                            {seatRows.map(([rowName, rowSeats]) => (
                                <div className="seat-row" key={rowName}>
                                    <span className="seat-row-label">{rowName}</span>
                                    <div className="seat-row-items">
                                        {rowSeats.map((seat) => {
                                            const selected = selectedSeats.includes(Number(seat.id));
                                            const booked = Boolean(Number(seat.is_booked));
                                            const inactive = !Number(seat.is_active);

                                            return (
                                                <button
                                                    type="button"
                                                    key={seat.id}
                                                    className={[
                                                        "seat",
                                                        selected ? "selected" : "",
                                                        booked || inactive ? "booked" : ""
                                                    ].filter(Boolean).join(" ")}
                                                    disabled={booked || inactive}
                                                    onClick={() => toggleSeat(seat)}
                                                    title={`${seat.seat_number} · ₹${Number(seat.price || 0).toFixed(2)}${booked ? " · Booked" : ""}`}
                                                    aria-pressed={selected}
                                                >
                                                    {seat.seat_number}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <span className="seat-row-label">{rowName}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="seat-empty">
                            <h3>No seats configured</h3>
                            <p>This screen does not have active seats yet. Please contact the administrator.</p>
                        </div>
                    )}
                </section>

                <section className="seat-bottom-panel">
                    <div className="seat-selection-summary">
                        <span className="summary-label">Selected seats</span>
                        <strong>{selectedSeatObjects.length ? selectedSeatObjects.map((seat) => seat.seat_number).join(", ") : "None"}</strong>
                    </div>
                    <div className="seat-total">
                        <span className="summary-label">Total amount</span>
                        <strong>₹{totalAmount.toFixed(2)}</strong>
                    </div>
                    <button
                        className="seat-primary-button"
                        onClick={continueToPayment}
                        disabled={!selectedSeats.length}
                    >
                        Continue to Payment
                    </button>
                </section>

                {error && <p className="seat-inline-error">{error}</p>}
            </main>
        </div>
    );
}

export default SeatSelection;
