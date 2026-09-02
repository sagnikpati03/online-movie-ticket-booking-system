import { useState } from "react";
import { Link } from "react-router";
import "./Home.css";

const movies = [
    {
        id: 1,
        title: "Movie !",
        genre: "Action",
        language: "English",
    },
    {
        id: 2,
        title: "Movie 2",
        genre: "Sci-Fi",
        language: "English",
    },
    {
        id: 3,
        title: "Movie 3",
        genre: "Sci-Fi",
        language: "English",
    },
    {
        id: 4,
        title: "Movie 4",
        genre: "Action",
        language: "Hindi",
    },
];

function Home() {
    const [searchText, setSearchText] = useState("");
    const [searched, setSearched] = useState(false);

    const filteredMovies = movies.filter((movie) =>
        movie.title
            .toLowerCase()
            .includes(searchText.toLowerCase().trim())
    );

    const handleSearch = () => {
        setSearched(true);

        document
            .getElementById("movies-section")
            ?.scrollIntoView({
                behavior: "smooth",
            });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleBrowseMovies = () => {
        document
            .getElementById("movies-section")
            ?.scrollIntoView({
                behavior: "smooth",
            });
    };

    const handleViewAll = () => {
        setSearchText("");
        setSearched(false);

        document
            .getElementById("movies-section")
            ?.scrollIntoView({
                behavior: "smooth",
            });
    };

    return (
        <div className="home-page">

            {/* =========================
                NAVBAR
            ========================= */}

            <nav className="home-navbar">

                <div className="navbar-logo">
                    🎬 MovieBook
                </div>

                <div className="navbar-links">

                    <Link to="/home">
                        Home
                    </Link>

                    <Link to="/my-bookings">
                        My Bookings
                    </Link>

                    <Link to="/login">
                        Logout
                    </Link>

                </div>

            </nav>


            {/* =========================
                HERO
            ========================= */}

            <section className="hero-section">

                <div className="hero-content">

                    <p className="hero-label">
                        YOUR MOVIE EXPERIENCE STARTS HERE
                    </p>

                    <h1>
                        Book Your Movie
                        <br />
                        <span>Tickets Easily</span>
                    </h1>

                    <p className="hero-description">
                        Discover the latest movies, choose your
                        favourite theatre and seats, and book
                        your tickets in just a few clicks.
                    </p>

                    <button
                        type="button"
                        className="browse-button"
                        onClick={handleBrowseMovies}
                    >
                        Browse Movies
                    </button>

                </div>


                <div className="hero-decoration">
                    🎬
                </div>

            </section>


            {/* =========================
                SEARCH
            ========================= */}

            <section className="search-section">

                <div className="search-box">

                    <input
                        type="search"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setSearched(false);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for movies..."
                        aria-label="Search for movies"
                    />

                    <button
                        type="button"
                        onClick={handleSearch}
                    >
                        Search
                    </button>

                </div>

            </section>


            {/* =========================
                MOVIES
            ========================= */}

            <section
                className="movies-section"
                id="movies-section"
            >

                <div className="section-header">

                    <div>

                        <p className="section-label">
                            {searched && searchText.trim()
                                ? "SEARCH RESULTS"
                                : "NOW SHOWING"}
                        </p>

                        <h2>
                            {searched && searchText.trim()
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


                {/* =========================
                    MOVIE RESULTS
                ========================= */}

                {filteredMovies.length > 0 ? (

                    <div className="movie-grid">

                        {filteredMovies.map((movie) => (

                            <div
                                className="movie-card"
                                key={movie.id}
                            >

                                <div className="movie-poster">
                                    🎥
                                </div>


                                <div className="movie-info">

                                    <h3>
                                        {movie.title}
                                    </h3>

                                    <p>
                                        {movie.genre}
                                        {" • "}
                                        {movie.language}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            console.log(
                                                `Book ${movie.title}`
                                            )
                                        }
                                    >
                                        Book Now
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                ) : (

                    <div className="no-results">

                        <div className="no-results-icon">
                            🔍
                        </div>

                        <h3>
                            No movies found
                        </h3>

                        <p>
                            We couldn't find a movie matching
                            "{searchText}".
                        </p>

                        <button
                            type="button"
                            onClick={handleViewAll}
                        >
                            View All Movies
                        </button>

                    </div>

                )}

            </section>

        </div>
    );
}

export default Home;