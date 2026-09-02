import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import logo from "../../pictures/logo.png";
import { API_URL } from "../../config/api";

function Home() {
    const navigate = useNavigate();

    const [searchText, setSearchText] = useState("");
    const [searched, setSearched] = useState(false);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

    const fetchMovies = async (search = "") => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            if (search.trim()) {
                params.set("search", search.trim());
            }

            const query = params.toString();
            const url = query
                ? `${API_URL}/api/movies?${query}`
                : `${API_URL}/api/movies`;

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to fetch movies.");
            }

            setMovies(Array.isArray(data.movies) ? data.movies : []);
        } catch (err) {
            console.error("Movie fetch error:", err);
            setMovies([]);
            setError(
                "Cannot load movies. Make sure the backend and MySQL database are running."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const scrollToMovies = () => {
        document.getElementById("movies-section")?.scrollIntoView({
            behavior: "smooth"
        });
    };

    const handleSearch = async () => {
        const value = searchText.trim();
        setSearched(Boolean(value));
        await fetchMovies(value);
        scrollToMovies();
    };

    const handleViewAll = async () => {
        setSearchText("");
        setSearched(false);
        await fetchMovies();
        scrollToMovies();
    };

    const handleLogout = async () => {
        const token = localStorage.getItem("token");

        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: "POST",
                headers: token
                    ? { Authorization: `Bearer ${token}` }
                    : {}
            });
        } catch (err) {
            console.warn("Logout request failed:", err);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="home-page">
            <nav className="home-navbar">
                <Link to="/home" className="navbar-logo">
                    <img src={logo} alt="Movie Ticket Booking" />
                </Link>

                <div className="navbar-links">
                    <Link to="/home">Home</Link>
                    <Link to="/my-bookings">My Bookings</Link>

                    {user?.role === "admin" && (
                        <Link to="/admin-dashboard">Admin Dashboard</Link>
                    )}

                    <div className="profile-area">
                        <button
                            type="button"
                            className="profile-button"
                            onClick={() => setProfileOpen((open) => !open)}
                            aria-label="Open profile menu"
                            aria-expanded={profileOpen}
                        >
                            {initial}
                        </button>

                        {profileOpen && (
                            <div className="profile-menu">
                                <div className="profile-menu-header">
                                    <div className="profile-avatar-large">{initial}</div>
                                    <div>
                                        <strong>{user?.name || "User"}</strong>
                                        <span>{user?.email || ""}</span>
                                    </div>
                                </div>

                                <div className="profile-role">
                                    {user?.role === "admin" ? "Administrator" : "Customer"}
                                </div>

                                <Link to="/my-bookings" onClick={() => setProfileOpen(false)}>
                                    My Bookings
                                </Link>

                                {user?.role === "admin" && (
                                    <Link
                                        to="/admin-dashboard"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    className="profile-logout"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <section className="hero-section">
                <div className="hero-content">
                    <p className="hero-label">YOUR MOVIE EXPERIENCE STARTS HERE</p>

                    <h1>
                        Book Your Movie
                        <br />
                        <span>Tickets Easily</span>
                    </h1>

                    <p className="hero-description">
                        {user?.name
                            ? `Welcome, ${user.name}. Discover the latest movies, choose your favourite theatre and seats, and book your tickets in just a few clicks.`
                            : "Discover the latest movies, choose your favourite theatre and seats, and book your tickets in just a few clicks."}
                    </p>

                    <button
                        type="button"
                        className="browse-button"
                        onClick={scrollToMovies}
                    >
                        Browse Movies
                    </button>
                </div>

                <div className="hero-decoration">
                    <img src={logo} alt="Movie Ticket Booking" />
                </div>
            </section>

            <section className="search-section">
                <div className="search-box">
                    <input
                        type="search"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setSearched(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                        placeholder="Search for movies..."
                        aria-label="Search for movies"
                    />

                    <button
                        type="button"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        Search
                    </button>
                </div>
            </section>

            <section className="movies-section" id="movies-section">
                <div className="section-header">
                    <div>
                        <p className="section-label">
                            {searched ? "SEARCH RESULTS" : "NOW SHOWING"}
                        </p>
                        <h2>
                            {searched
                                ? `Results for "${searchText}"`
                                : "Popular Movies"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="view-all-button"
                        onClick={handleViewAll}
                    >
                        View All
                    </button>
                </div>

                {error ? (
                    <div className="no-results">
                        <div className="no-results-icon">⚠️</div>
                        <h3>Unable to load movies</h3>
                        <p>{error}</p>
                        <button type="button" onClick={() => fetchMovies()}>
                            Try Again
                        </button>
                    </div>
                ) : loading ? (
                    <div className="no-results">
                        <div className="no-results-icon">🎬</div>
                        <h3>Loading movies...</h3>
                        <p>Please wait while we load the movies.</p>
                    </div>
                ) : movies.length > 0 ? (
                    <div className="movie-grid">
                        {movies.map((movie) => (
                            <div className="movie-card" key={movie.id}>
                                <div className="movie-poster">
                                    {movie.poster_url ? (
                                        <img
                                            src={movie.poster_url}
                                            alt={movie.title}
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        "🎥"
                                    )}
                                </div>

                                <div className="movie-info">
                                    <h3>{movie.title}</h3>
                                    <p>
                                        {movie.genre || "Genre not specified"}
                                        {" • "}
                                        {movie.language || "Language not specified"}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => navigate(`/movie/${movie.id}`)}
                                    >
                                        View Movie
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>
                            {searched ? "No movies found" : "No movies available"}
                        </h3>
                        <p>
                            {searched
                                ? `We couldn't find a movie matching "${searchText}".`
                                : "There are currently no active movies in the database."}
                        </p>
                        {searched && (
                            <button type="button" onClick={handleViewAll}>
                                View All Movies
                            </button>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;
