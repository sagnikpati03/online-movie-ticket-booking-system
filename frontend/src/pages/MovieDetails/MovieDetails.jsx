import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../pictures/logo.png";
import { API_URL } from "../../config/api";
import "./MovieDetails.css";

function MovieDetails() {
    const { movieId } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const [movieResponse, showsResponse] = await Promise.all([
                    fetch(`${API_URL}/api/movies/${movieId}`),
                    fetch(`${API_URL}/api/movies/${movieId}/shows`)
                ]);

                const movieData = await movieResponse.json();
                const showsData = await showsResponse.json();

                if (!movieResponse.ok) {
                    throw new Error(
                        movieData.message || "Unable to load movie."
                    );
                }

                if (!showsResponse.ok) {
                    throw new Error(
                        showsData.message || "Unable to load shows."
                    );
                }

                setMovie(movieData.movie);
                setShows(
                    Array.isArray(showsData.shows)
                        ? showsData.shows
                        : []
                );
            } catch (err) {
                console.error("Movie details error:", err);
                setError(
                    err.message || "Unable to load movie details."
                );
            } finally {
                setLoading(false);
            }
        };

        if (movieId) {
            fetchMovieDetails();
        }
    }, [movieId]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

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

        const [hourString, minuteString] = String(value)
            .slice(0, 5)
            .split(":");

        let hour = Number(hourString);
        const minute = minuteString || "00";
        const period = hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${hour}:${minute} ${period}`;
    };

    const handleSelectShow = (show) => {
        // The next step in the booking flow is Seat Selection.
        navigate(`/seat-selection/${show.id}`, {
            state: {
                movie,
                show
            }
        });
    };

    if (loading) {
        return (
            <div className="movie-details-page">
                <div className="movie-details-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading movie details...</p>
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="movie-details-page">
                <header className="movie-details-navbar">
                    <div
                        className="movie-details-logo"
                        onClick={() => navigate("/home")}
                    >
                        <img
                            src={logo}
                            alt="Movie Ticket Booking"
                        />
                    </div>
                </header>

                <div className="movie-details-error">
                    <div className="error-icon">!</div>

                    <h2>Movie Not Found</h2>

                    <p>
                        {error || "The requested movie could not be found."}
                    </p>

                    <button onClick={() => navigate("/home")}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const poster =
        movie.poster_url || "";

    return (
        <div className="movie-details-page">

            <header className="movie-details-navbar">

                <div
                    className="movie-details-logo"
                    onClick={() => navigate("/home")}
                >
                    <img
                        src={logo}
                        alt="Movie Ticket Booking"
                    />
                </div>

                <nav>
                    <button onClick={() => navigate("/home")}>
                        Home
                    </button>

                    <button onClick={() => navigate("/my-bookings")}>
                        My Bookings
                    </button>

                    {user?.role === "admin" && (
                        <button
                            onClick={() =>
                                navigate("/admin-dashboard")
                            }
                        >
                            Admin Dashboard
                        </button>
                    )}

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </nav>

            </header>


            <main className="movie-details-container">

                <button
                    className="back-button"
                    onClick={() => navigate("/home")}
                >
                    ← Back to Movies
                </button>


                <section className="movie-details-card">

                    <div className="movie-poster-section">

                        {poster ? (
                            <img
                                src={poster}
                                alt={movie.title}
                                className="movie-poster"
                            />
                        ) : (
                            <div className="movie-poster-placeholder">
                                🎬
                            </div>
                        )}

                    </div>


                    <div className="movie-information">

                        <span className="movie-label">
                            MOVIE DETAILS
                        </span>

                        <h1>
                            {movie.title}
                        </h1>

                        <div className="movie-description">
                            {movie.description ||
                                "No description available for this movie."}
                        </div>


                        <div className="movie-info-grid">

                            <div className="movie-info-item">
                                <span>Genre</span>
                                <strong>
                                    {movie.genre || "N/A"}
                                </strong>
                            </div>

                            <div className="movie-info-item">
                                <span>Language</span>
                                <strong>
                                    {movie.language || "N/A"}
                                </strong>
                            </div>

                            <div className="movie-info-item">
                                <span>Duration</span>
                                <strong>
                                    {movie.duration_minutes
                                        ? `${movie.duration_minutes} min`
                                        : "N/A"}
                                </strong>
                            </div>

                            <div className="movie-info-item">
                                <span>Certificate</span>
                                <strong>
                                    {movie.certificate || "N/A"}
                                </strong>
                            </div>

                            <div className="movie-info-item">
                                <span>Director</span>
                                <strong>
                                    {movie.director || "N/A"}
                                </strong>
                            </div>

                            <div className="movie-info-item">
                                <span>Release Date</span>
                                <strong>
                                    {formatDate(movie.release_date)}
                                </strong>
                            </div>

                        </div>

                    </div>

                </section>


                <section className="show-section">

                    <div className="show-section-heading">
                        <div>
                            <p className="section-label">
                                AVAILABLE SHOWS
                            </p>

                            <h2>
                                Choose a Show
                            </h2>
                        </div>
                    </div>


                    {shows.length === 0 ? (
                        <div className="no-shows">
                            <div>🎟️</div>

                            <h3>
                                No shows available
                            </h3>

                            <p>
                                There are currently no active shows
                                scheduled for this movie.
                            </p>
                        </div>
                    ) : (
                        <div className="show-list">

                            {shows.map((show) => (
                                <article
                                    className="show-card"
                                    key={show.id}
                                >

                                    <div className="show-main">

                                        <h3>
                                            {show.theatre_name}
                                        </h3>

                                        <p>
                                            {show.city}
                                            {" • "}
                                            {show.screen_name}
                                        </p>

                                    </div>


                                    <div className="show-date">

                                        <span>
                                            Date
                                        </span>

                                        <strong>
                                            {formatDate(show.show_date)}
                                        </strong>

                                    </div>


                                    <div className="show-time">

                                        <span>
                                            Time
                                        </span>

                                        <strong>
                                            {formatTime(show.start_time)}
                                        </strong>

                                    </div>


                                    <div className="show-price">

                                        <span>
                                            From
                                        </span>

                                        <strong>
                                            ₹{Number(
                                                show.base_price || 0
                                            ).toFixed(2)}
                                        </strong>

                                    </div>


                                    <button
                                        className="book-ticket-button"
                                        onClick={() =>
                                            handleSelectShow(show)
                                        }
                                    >
                                        Select Seats
                                        <span>→</span>
                                    </button>

                                </article>
                            ))}

                        </div>
                    )}

                </section>

            </main>

        </div>
    );
}

export default MovieDetails;
