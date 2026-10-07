"use strict";

/* =========================================================
   TMDB CONFIGURATION
========================================================= */

const TMDB_API_KEY =
    "d6e484259642a002ce16743a60969ce5";

const TMDB_BASE_URL =
    "https://api.themoviedb.org/3";

const IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/w500";

const BACKDROP_BASE_URL =
    "https://image.tmdb.org/t/p/w1280";


/* =========================================================
   LOGIN CHECK
========================================================= */

if (
    localStorage.getItem("movieHubLoggedIn") !== "true"
) {
    window.location.href = "login.html";
}


/* =========================================================
   DOM
========================================================= */

const movieGrid =
    document.getElementById("movieGrid");

const statusMessage =
    document.getElementById("statusMessage");

const resultCount =
    document.getElementById("resultCount");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const languageFilter =
    document.getElementById("languageFilter");

const genreFilter =
    document.getElementById("genreFilter");

const typeFilter =
    document.getElementById("typeFilter");

const loadMoreBtn =
    document.getElementById("loadMoreBtn");


/* MODAL */

const movieModal =
    document.getElementById("movieModal");

const closeModal =
    document.getElementById("closeModal");

const modalPoster =
    document.getElementById("modalPoster");

const modalTitle =
    document.getElementById("modalTitle");

const modalMeta =
    document.getElementById("modalMeta");

const modalGenres =
    document.getElementById("modalGenres");

const modalOverview =
    document.getElementById("modalOverview");

const modalTrailerBtn =
    document.getElementById("modalTrailerBtn");

const modalFavoriteBtn =
    document.getElementById("modalFavoriteBtn");

const modalWatchlistBtn =
    document.getElementById("modalWatchlistBtn");


/* RATING */

const ratingStars =
    document.getElementById("ratingStars");

const ratingValue =
    document.getElementById("ratingValue");

const reviewInput =
    document.getElementById("reviewInput");

const saveReviewBtn =
    document.getElementById("saveReviewBtn");

const deleteReviewBtn =
    document.getElementById("deleteReviewBtn");

const reviewStatus =
    document.getElementById("reviewStatus");


/* LIBRARIES */

const favoritesGrid =
    document.getElementById("favoritesGrid");

const watchlistGrid =
    document.getElementById("watchlistGrid");

const favoriteCount =
    document.getElementById("favoriteCount");

const watchlistCount =
    document.getElementById("watchlistCount");


/* SPIN */

const languageWheel =
    document.getElementById("languageWheel");

const genreWheel =
    document.getElementById("genreWheel");

const spinLanguageBtn =
    document.getElementById("spinLanguageBtn");

const spinGenreBtn =
    document.getElementById("spinGenreBtn");

const languageResult =
    document.getElementById("languageResult");

const genreResult =
    document.getElementById("genreResult");

const recommendationCriteria =
    document.getElementById("recommendationCriteria");

const recommendationCard =
    document.getElementById("recommendationCard");

const spinAgainBtn =
    document.getElementById("spinAgainBtn");


/* NAV */

const logoutBtn =
    document.getElementById("logoutBtn");

const menuBtn =
    document.getElementById("menuBtn");

const navMenu =
    document.getElementById("navMenu");


/* =========================================================
   LANGUAGES
========================================================= */

const LANGUAGES = [

    {
        code: "en",
        name: "English"
    },

    {
        code: "hi",
        name: "Hindi"
    },

    {
        code: "te",
        name: "Telugu"
    },

    {
        code: "ta",
        name: "Tamil"
    },

    {
        code: "ml",
        name: "Malayalam"
    },

    {
        code: "kn",
        name: "Kannada"
    },

    {
        code: "bn",
        name: "Bengali"
    }

];


/* =========================================================
   MOVIE GENRES
========================================================= */

const MOVIE_GENRES = {

    action: 28,

    adventure: 12,

    animation: 16,

    comedy: 35,

    crime: 80,

    documentary: 99,

    drama: 18,

    fantasy: 14,

    horror: 27,

    mystery: 9648,

    romance: 10749,

    scifi: 878,

    thriller: 53

};


/* =========================================================
   TV GENRES
========================================================= */

const TV_GENRES = {

    action: 10759,

    adventure: 10759,

    animation: 16,

    comedy: 35,

    crime: 80,

    documentary: 99,

    drama: 18,

    fantasy: 10765,

    horror: 10765,

    mystery: 9648,

    romance: 10749,

    scifi: 10765,

    thriller: 10765

};


/* =========================================================
   GENRE NAMES
========================================================= */

const GENRE_NAMES = {

    action: "Action",

    adventure: "Adventure",

    animation: "Animation",

    comedy: "Comedy",

    crime: "Crime",

    documentary: "Documentary",

    drama: "Drama",

    fantasy: "Fantasy",

    horror: "Horror",

    mystery: "Mystery",

    romance: "Romance",

    scifi: "Science Fiction",

    thriller: "Thriller"

};


/* =========================================================
   GENRE ID → NAME
========================================================= */

const MOVIE_GENRE_NAMES = {

    28: "Action",

    12: "Adventure",

    16: "Animation",

    35: "Comedy",

    80: "Crime",

    99: "Documentary",

    18: "Drama",

    14: "Fantasy",

    27: "Horror",

    9648: "Mystery",

    10749: "Romance",

    878: "Science Fiction",

    53: "Thriller"

};


const TV_GENRE_NAMES = {

    10759: "Action & Adventure",

    16: "Animation",

    35: "Comedy",

    80: "Crime",

    99: "Documentary",

    18: "Drama",

    9648: "Mystery",

    10765: "Sci-Fi & Fantasy",

    10749: "Romance"

};


/* =========================================================
   STATE
========================================================= */

const state = {

    page: 1,

    filterType: "all",

    language: "all",

    genre: "all",

    searchMode: false,

    searchQuery: "",

    movies: [],

    loading: false,

    currentMovie: null,

    selectedRating: 0,

    spinLanguage: null,

    spinGenre: null,

    languageRotation: 0,

    genreRotation: 0

};


/* =========================================================
   LOCAL STORAGE KEYS
========================================================= */

const STORAGE = {

    favorites: "movieHubFavorites",

    watchlist: "movieHubWatchlist",

    reviews: "movieHubReviews"

};


/* =========================================================
   TMDB REQUEST
========================================================= */

async function tmdbRequest(
    endpoint,
    params = {}
) {

    if (
        !TMDB_API_KEY ||
        TMDB_API_KEY ===
        "PASTE_YOUR_TMDB_V3_API_KEY_HERE"
    ) {

        throw new Error(
            "Please add your TMDB V3 API key in script.js."
        );

    }


    const query =
        new URLSearchParams({

            api_key: TMDB_API_KEY,

            language: "en-US",

            ...params

        });


    const response =
        await fetch(
            `${TMDB_BASE_URL}${endpoint}?${query}`
        );


    if (!response.ok) {

        if (response.status === 401) {

            throw new Error(
                "Invalid TMDB API key."
            );

        }

        if (response.status === 429) {

            throw new Error(
                "TMDB request limit reached."
            );

        }

        throw new Error(
            `TMDB error: ${response.status}`
        );

    }


    return response.json();

}


/* =========================================================
   NORMALIZE MOVIE
========================================================= */

function normalizeMovie(movie) {

    return {

        id: movie.id,

        type: "movie",

        title:
            movie.title ||
            movie.original_title ||
            "Unknown",

        date:
            movie.release_date ||
            "",

        rating:
            Number(
                movie.vote_average || 0
            ),

        popularity:
            Number(
                movie.popularity || 0
            ),

        poster:
            movie.poster_path
                ? IMAGE_BASE_URL +
                  movie.poster_path
                : "",

        backdrop:
            movie.backdrop_path
                ? BACKDROP_BASE_URL +
                  movie.backdrop_path
                : "",

        overview:
            movie.overview ||
            "No overview available.",

        genres:
            movie.genre_ids || [],

        language:
            movie.original_language ||
            ""

    };

}


/* =========================================================
   NORMALIZE TV
========================================================= */

function normalizeTV(show) {

    return {

        id: show.id,

        type: "tv",

        title:
            show.name ||
            show.original_name ||
            "Unknown",

        date:
            show.first_air_date ||
            "",

        rating:
            Number(
                show.vote_average || 0
            ),

        popularity:
            Number(
                show.popularity || 0
            ),

        poster:
            show.poster_path
                ? IMAGE_BASE_URL +
                  show.poster_path
                : "",

        backdrop:
            show.backdrop_path
                ? BACKDROP_BASE_URL +
                  show.backdrop_path
                : "",

        overview:
            show.overview ||
            "No overview available.",

        genres:
            show.genre_ids || [],

        language:
            show.original_language ||
            ""

    };

}


/* =========================================================
   LOAD CONTENT
========================================================= */

async function loadContent(reset = true) {

    if (state.loading) return;


    if (reset) {

        state.page = 1;

        state.movies = [];

        movieGrid.innerHTML = "";

    }


    state.loading = true;

    loadMoreBtn.disabled = true;

    statusMessage.textContent =
        "Loading...";


    try {

        let results = [];


        /* SEARCH */

        if (
            state.searchMode &&
            state.searchQuery
        ) {

            const data =
                await tmdbRequest(
                    "/search/multi",
                    {
                        query:
                            state.searchQuery,

                        page:
                            state.page,

                        include_adult:
                            "false"
                    }
                );


            results =
                data.results

                    .filter(
                        item =>
                            item.media_type ===
                            "movie" ||

                            item.media_type ===
                            "tv"
                    )

                    .map(
                        item =>
                            item.media_type ===
                            "movie"

                                ? normalizeMovie(item)

                                : normalizeTV(item)
                    );


            if (
                state.filterType !==
                "all"
            ) {

                results =
                    results.filter(
                        item =>
                            item.type ===
                            state.filterType
                    );

            }


            if (
                state.language !==
                "all"
            ) {

                results =
                    results.filter(
                        item =>
                            item.language ===
                            state.language
                    );

            }


            if (
                state.genre !==
                "all"
            ) {

                results =
                    results.filter(
                        item => {

                            const genreId =
                                item.type ===
                                "movie"

                                    ? MOVIE_GENRES[
                                        state.genre
                                    ]

                                    : TV_GENRES[
                                        state.genre
                                    ];

                            return item.genres.includes(
                                genreId
                            );

                        }
                    );

            }

        }


        /* BROWSE */

        else {

            results =
                await discoverContent();

        }


        state.movies =
            reset

                ? results

                : [
                    ...state.movies,
                    ...results
                ];


        renderMovies(
            results,
            movieGrid
        );


        resultCount.textContent =
            `${state.movies.length} title(s) loaded`;


        statusMessage.textContent =
            results.length
                ? ""
                : "No results found.";


        loadMoreBtn.style.display =
            results.length
                ? "inline-block"
                : "none";

    }

    catch (error) {

        console.error(error);

        statusMessage.textContent =
            error.message;

    }

    finally {

        state.loading = false;

        loadMoreBtn.disabled = false;

    }

}


/* =========================================================
   DISCOVER CONTENT
========================================================= */

async function discoverContent() {

    const params = {

        page: state.page,

        sort_by:
            "popularity.desc",

        include_adult:
            "false"

    };


    if (
        state.language !==
        "all"
    ) {

        params.with_original_language =
            state.language;

    }


    /* MOVIES ONLY */

    if (
        state.filterType ===
        "movie"
    ) {

        if (
            state.genre !==
            "all"
        ) {

            params.with_genres =
                MOVIE_GENRES[
                    state.genre
                ];

        }


        const data =
            await tmdbRequest(
                "/discover/movie",
                params
            );


        return data.results.map(
            normalizeMovie
        );

    }


    /* TV ONLY */

    if (
        state.filterType ===
        "tv"
    ) {

        if (
            state.genre !==
            "all"
        ) {

            params.with_genres =
                TV_GENRES[
                    state.genre
                ];

        }


        const data =
            await tmdbRequest(
                "/discover/tv",
                params
            );


        return data.results.map(
            normalizeTV
        );

    }


    /* BOTH MOVIES AND TV */

    const movieParams = {
        ...params
    };

    const tvParams = {
        ...params
    };


    if (
        state.genre !==
        "all"
    ) {

        movieParams.with_genres =
            MOVIE_GENRES[
                state.genre
            ];

        tvParams.with_genres =
            TV_GENRES[
                state.genre
            ];

    }


    const [
        movieData,
        tvData
    ] =
        await Promise.all([

            tmdbRequest(
                "/discover/movie",
                movieParams
            ),

            tmdbRequest(
                "/discover/tv",
                tvParams
            )

        ]);


    return [

        ...movieData.results.map(
            normalizeMovie
        ),

        ...tvData.results.map(
            normalizeTV
        )

    ]

        .sort(
            (a, b) =>
                b.popularity -
                a.popularity
        )

        .slice(0, 20);

}


/* =========================================================
   RENDER MOVIES
========================================================= */

function renderMovies(
    movies,
    container
) {

    movies.forEach(
        movie => {

            container.insertAdjacentHTML(
                "beforeend",
                createMovieCard(movie)
            );

        }
    );

}


/* =========================================================
   CREATE MOVIE CARD
========================================================= */

function createMovieCard(movie) {

    const favorite =
        isFavorite(movie);

    const watchlisted =
        isWatchlisted(movie);


    const poster =
        movie.poster

            ? `
                <img
                    src="${escapeHTML(movie.poster)}"
                    alt="${escapeHTML(movie.title)}"
                    loading="lazy"
                >
            `

            : `
                <div class="no-poster">
                    No poster available
                </div>
            `;


    return `

        <article
            class="movie-card"
            data-id="${movie.id}"
            data-type="${movie.type}"
        >

            <div class="poster-wrap">

                ${poster}


                <span class="type-badge">

                    ${
                        movie.type === "movie"
                            ? "MOVIE"
                            : "TV"
                    }

                </span>


                <div class="card-actions">

                    <button
                        class="
                            card-action-btn
                            ${favorite ? "active" : ""}
                        "
                        data-action="favorite"
                        data-id="${movie.id}"
                        data-type="${movie.type}"
                    >

                        ${
                            favorite
                                ? "♥"
                                : "♡"
                        }

                    </button>


                    <button
                        class="
                            card-action-btn
                            ${watchlisted ? "active" : ""}
                        "
                        data-action="watchlist"
                        data-id="${movie.id}"
                        data-type="${movie.type}"
                    >

                        🔖

                    </button>

                </div>

            </div>


            <div class="card-info">

                <h3>
                    ${escapeHTML(movie.title)}
                </h3>


                <div class="card-meta">

                    <span>
                        ${getYear(movie.date)}
                    </span>

                    <span class="card-rating">
                        ★
                        ${
                            movie.rating
                                ? movie.rating.toFixed(1)
                                : "N/A"
                        }
                    </span>

                </div>


                <button
                    class="card-trailer"
                    data-action="trailer"
                    data-id="${movie.id}"
                    data-type="${movie.type}"
                >

                    ▶ Trailer

                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   GET YEAR
========================================================= */

function getYear(date) {

    return date
        ? date.substring(0, 4)
        : "N/A";

}


/* =========================================================
   FIND MOVIE
========================================================= */

function findMovie(
    id,
    type
) {

    const allMovies = [

        ...state.movies,

        ...getStoredList(
            STORAGE.favorites
        ),

        ...getStoredList(
            STORAGE.watchlist
        )

    ];


    return allMovies.find(
        movie =>
            String(movie.id) ===
            String(id) &&

            movie.type ===
            type
    );

}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function getStoredList(key) {

    try {

        return JSON.parse(
            localStorage.getItem(key) ||
            "[]"
        );

    }

    catch {

        return [];

    }

}


function saveStoredList(
    key,
    data
) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}


/* =========================================================
   ITEM KEY
========================================================= */

function itemKey(movie) {

    return `${movie.type}-${movie.id}`;

}


/* =========================================================
   FAVORITES
========================================================= */

function isFavorite(movie) {

    return getStoredList(
        STORAGE.favorites
    ).some(
        item =>
            itemKey(item) ===
            itemKey(movie)
    );

}


function toggleFavorite(movie) {

    let favorites =
        getStoredList(
            STORAGE.favorites
        );


    if (
        isFavorite(movie)
    ) {

        favorites =
            favorites.filter(
                item =>
                    itemKey(item) !==
                    itemKey(movie)
            );

    }

    else {

        favorites.push(movie);

    }


    saveStoredList(
        STORAGE.favorites,
        favorites
    );


    refreshLibraries();

    refreshCards();

    updateModalButtons();

}


/* =========================================================
   WATCHLIST
========================================================= */

function isWatchlisted(movie) {

    return getStoredList(
        STORAGE.watchlist
    ).some(
        item =>
            itemKey(item) ===
            itemKey(movie)
    );

}


function toggleWatchlist(movie) {

    let watchlist =
        getStoredList(
            STORAGE.watchlist
        );


    if (
        isWatchlisted(movie)
    ) {

        watchlist =
            watchlist.filter(
                item =>
                    itemKey(item) !==
                    itemKey(movie)
            );

    }

    else {

        watchlist.push(movie);

    }


    saveStoredList(
        STORAGE.watchlist,
        watchlist
    );


    refreshLibraries();

    refreshCards();

    updateModalButtons();

}


/* =========================================================
   REFRESH CARDS
========================================================= */

function refreshCards() {

    document
        .querySelectorAll(
            ".movie-card"
        )
        .forEach(card => {

            const movie =
                findMovie(
                    card.dataset.id,
                    card.dataset.type
                );


            if (!movie) return;


            const favoriteBtn =
                card.querySelector(
                    '[data-action="favorite"]'
                );


            const watchlistBtn =
                card.querySelector(
                    '[data-action="watchlist"]'
                );


            const favorite =
                isFavorite(movie);


            const watchlisted =
                isWatchlisted(movie);


            if (favoriteBtn) {

                favoriteBtn.classList.toggle(
                    "active",
                    favorite
                );

                favoriteBtn.textContent =
                    favorite
                        ? "♥"
                        : "♡";

            }


            if (watchlistBtn) {

                watchlistBtn.classList.toggle(
                    "active",
                    watchlisted
                );

            }

        });

}


/* =========================================================
   REFRESH LIBRARIES
========================================================= */

function refreshLibraries() {

    const favorites =
        getStoredList(
            STORAGE.favorites
        );

    const watchlist =
        getStoredList(
            STORAGE.watchlist
        );


    favoriteCount.textContent =
        `${favorites.length} saved`;

    watchlistCount.textContent =
        `${watchlist.length} saved`;


    renderLibrary(
        favoritesGrid,
        favorites,
        "No favorite movies or series yet."
    );


    renderLibrary(
        watchlistGrid,
        watchlist,
        "Your watchlist is empty."
    );

}


/* =========================================================
   RENDER LIBRARY
========================================================= */

function renderLibrary(
    container,
    movies,
    emptyMessage
) {

    if (!movies.length) {

        container.innerHTML = `

            <div class="empty-library">

                ${emptyMessage}

            </div>

        `;

        return;

    }


    container.innerHTML =
        movies
            .map(createMovieCard)
            .join("");

}


/* =========================================================
   TRAILER
========================================================= */

async function getTrailer(movie) {

    const endpoint =
        movie.type === "movie"

            ? `/movie/${movie.id}/videos`

            : `/tv/${movie.id}/videos`;


    const data =
        await tmdbRequest(
            endpoint,
            {
                language: "en-US"
            }
        );


    const videos =
        data.results || [];


    const youtubeVideos =
        videos.filter(
            video =>
                video.site ===
                "YouTube"
        );


    const trailer =

        youtubeVideos.find(
            video =>
                video.type ===
                "Trailer" &&
                video.official === true
        )

        ||

        youtubeVideos.find(
            video =>
                video.type ===
                "Trailer"
        )

        ||

        youtubeVideos.find(
            video =>
                video.type ===
                "Teaser"
        )

        ||

        youtubeVideos[0];


    if (!trailer) {

        return null;

    }


    return `
        https://www.youtube.com/watch?v=${trailer.key}
    `;

}


async function openTrailer(movie) {

    if (!movie) return;


    try {

        const url =
            await getTrailer(movie);


        if (!url) {

            alert(
                `No trailer available for "${movie.title}".`
            );

            return;

        }


        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not load the trailer."
        );

    }

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openMovieModal(movie) {

    if (!movie) return;


    state.currentMovie =
        movie;


    modalTitle.textContent =
        movie.title;


    modalPoster.src =
        movie.poster || "";


    modalPoster.alt =
        `${movie.title} Poster`;


    modalMeta.innerHTML = `

        <span>
            ${movie.type === "movie"
                ? "Movie"
                : "TV Series"}
        </span>

        <span>
            • ${getYear(movie.date)}
        </span>

        <span>
            • ★
            ${
                movie.rating
                    ? movie.rating.toFixed(1)
                    : "N/A"
            }
        </span>

        <span>
            • ${movie.language
                ? movie.language.toUpperCase()
                : "N/A"}
        </span>

    `;


    const genreNames =
        movie.genres

            .map(
                id =>
                    movie.type ===
                    "movie"

                        ? MOVIE_GENRE_NAMES[id]

                        : TV_GENRE_NAMES[id]
            )

            .filter(Boolean);


    modalGenres.innerHTML =
        genreNames.length

            ? genreNames
                .map(
                    genre =>
                        `
                            <span class="genre-tag">
                                ${escapeHTML(genre)}
                            </span>
                        `
                )
                .join("")

            : `
                <span class="genre-tag">
                    Genre unavailable
                </span>
            `;


    modalOverview.textContent =
        movie.overview ||
        "No overview available.";


    /* LOAD REVIEW */

    const review =
        getReview(movie);


    state.selectedRating =
        review
            ? review.rating
            : 0;


    reviewInput.value =
        review
            ? review.review
            : "";


    updateRatingUI();


    reviewStatus.textContent =
        "";


    updateModalButtons();


    movieModal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeMovieModal() {

    movieModal.classList.remove(
        "show"
    );

    document.body.style.overflow =
        "";

    state.currentMovie =
        null;

}


/* =========================================================
   UPDATE MODAL BUTTONS
========================================================= */

function updateModalButtons() {

    const movie =
        state.currentMovie;


    if (!movie) return;


    const favorite =
        isFavorite(movie);


    const watchlisted =
        isWatchlisted(movie);


    modalFavoriteBtn.textContent =
        favorite
            ? "♥ Favorited"
            : "♡ Favorite";


    modalWatchlistBtn.textContent =
        watchlisted
            ? "🔖 In Watchlist"
            : "🔖 Watchlist";


    modalFavoriteBtn.classList.toggle(
        "active",
        favorite
    );


    modalWatchlistBtn.classList.toggle(
        "active",
        watchlisted
    );

}


/* =========================================================
   REVIEWS
========================================================= */

function getReviews() {

    try {

        return JSON.parse(
            localStorage.getItem(
                STORAGE.reviews
            ) || "{}"
        );

    }

    catch {

        return {};

    }

}


function getReview(movie) {

    const reviews =
        getReviews();


    return (
        reviews[
            itemKey(movie)
        ] || null
    );

}


function saveReview(
    movie,
    rating,
    review
) {

    const reviews =
        getReviews();


    reviews[
        itemKey(movie)
    ] = {

        rating: rating,

        review:
            review.trim(),

        updatedAt:
            new Date().toISOString()

    };


    localStorage.setItem(
        STORAGE.reviews,
        JSON.stringify(reviews)
    );

}


function clearReview(movie) {

    const reviews =
        getReviews();


    delete reviews[
        itemKey(movie)
    ];


    localStorage.setItem(
        STORAGE.reviews,
        JSON.stringify(reviews)
    );

}


/* =========================================================
   RATING UI
========================================================= */

function updateRatingUI() {

    const stars =
        ratingStars.querySelectorAll(
            "button"
        );


    stars.forEach(
        star => {

            const value =
                Number(
                    star.dataset.rating
                );


            star.classList.toggle(
                "active",
                value <=
                state.selectedRating
            );

        }
    );


    ratingValue.textContent =
        state.selectedRating

            ? `${state.selectedRating}/5`

            : "Not rated";

}


/* =========================================================
   CREATE WHEEL
========================================================= */

function createWheel(
    wheel,
    items
) {

    wheel.innerHTML = "";


    const angle =
        360 / items.length;


    items.forEach(
        (item, index) => {

            const label =
                document.createElement(
                    "span"
                );


            label.className =
                "wheel-label";


            label.textContent =
                item.name ||
                item;


            const rotation =
                index * angle +
                angle / 2;


            label.style.transform =
                `
                    rotate(${rotation}deg)
                    translateY(-83px)
                    rotate(-${rotation}deg)
                `;


            wheel.appendChild(
                label
            );

        }
    );


    const center =
        document.createElement(
            "div"
        );


    center.className =
        "wheel-center";


    center.textContent =
        "🎬";


    wheel.appendChild(
        center
    );

}


/* =========================================================
   SPIN
========================================================= */

function spinWheel(
    wheel,
    items,
    currentRotation
) {

    const index =
        Math.floor(
            Math.random() *
            items.length
        );


    const segment =
        360 / items.length;


    const rotation =
        currentRotation +

        360 * 6 +

        (
            360 -
            (
                index *
                segment +
                segment / 2
            )
        );


    wheel.style.transform =
        `rotate(${rotation}deg)`;


    return {

        index,

        rotation

    };

}


/* =========================================================
   LANGUAGE SPIN
========================================================= */

async function spinLanguage() {

    spinLanguageBtn.disabled =
        true;


    spinGenreBtn.disabled =
        true;


    const result =
        spinWheel(
            languageWheel,
            LANGUAGES,
            state.languageRotation
        );


    state.languageRotation =
        result.rotation;


    state.spinLanguage =
        LANGUAGES[
            result.index
        ];


    languageResult.textContent =
        `Selected language: ${state.spinLanguage.name}`;


    genreResult.textContent =
        "Now spin the genre wheel.";


    await wait(4100);


    spinGenreBtn.disabled =
        false;


    spinLanguageBtn.disabled =
        false;

}


/* =========================================================
   GENRE SPIN
========================================================= */

async function spinGenre() {

    if (!state.spinLanguage)
        return;


    spinGenreBtn.disabled =
        true;


    const genres =
        Object.entries(
            GENRE_NAMES
        ).map(
            ([key, name]) => ({
                key,
                name
            })
        );


    const result =
        spinWheel(
            genreWheel,
            genres,
            state.genreRotation
        );


    state.genreRotation =
        result.rotation;


    state.spinGenre =
        genres[
            result.index
        ];


    genreResult.textContent =
        `Selected genre: ${state.spinGenre.name}`;


    await wait(4100);


    await getWheelRecommendation();


    spinGenreBtn.disabled =
        false;

}


/* =========================================================
   GET RECOMMENDATION
========================================================= */

async function getWheelRecommendation() {

    if (
        !state.spinLanguage ||
        !state.spinGenre
    ) return;


    recommendationCard.innerHTML =
        `
            <p>
                Finding your recommendation...
            </p>
        `;


    try {

        const movieGenre =
            MOVIE_GENRES[
                state.spinGenre.key
            ];


        const tvGenre =
            TV_GENRES[
                state.spinGenre.key
            ];


        const movieParams = {

            with_original_language:
                state.spinLanguage.code,

            with_genres:
                movieGenre,

            sort_by:
                "popularity.desc",

            page:
                Math.floor(
                    Math.random() * 3
                ) + 1,

            include_adult:
                "false"

        };


        const tvParams = {

            with_original_language:
                state.spinLanguage.code,

            with_genres:
                tvGenre,

            sort_by:
                "popularity.desc",

            page:
                Math.floor(
                    Math.random() * 3
                ) + 1,

            include_adult:
                "false"

        };


        const [
            movieData,
            tvData
        ] =
            await Promise.all([

                tmdbRequest(
                    "/discover/movie",
                    movieParams
                ),

                tmdbRequest(
                    "/discover/tv",
                    tvParams
                )

            ]);


        const movies =
            movieData.results
                .map(normalizeMovie);


        const shows =
            tvData.results
                .map(normalizeTV);


        const candidates =
            [
                ...movies,
                ...shows
            ]
            .filter(
                item =>
                    item.poster
            );


        if (!candidates.length) {

            recommendationCard.innerHTML =
                `
                    <p>
                        No matching title found.
                        Spin again!
                    </p>
                `;

            return;

        }


        const movie =
            candidates[
                Math.floor(
                    Math.random() *
                    candidates.length
                )
            ];


        recommendationCriteria.textContent =
            `${state.spinLanguage.name} + ${state.spinGenre.name}`;


        recommendationCard.innerHTML =
            createRecommendationCard(
                movie
            );


        const trailerButton =
            recommendationCard.querySelector(
                "[data-recommendation-trailer]"
            );


        const favoriteButton =
            recommendationCard.querySelector(
                "[data-recommendation-favorite]"
            );


        const watchlistButton =
            recommendationCard.querySelector(
                "[data-recommendation-watchlist]"
            );


        trailerButton.onclick =
            () => openTrailer(movie);


        favoriteButton.onclick =
            () => {

                toggleFavorite(movie);

                recommendationCard.innerHTML =
                    createRecommendationCard(
                        movie
                    );

            };


        watchlistButton.onclick =
            () => {

                toggleWatchlist(movie);

                recommendationCard.innerHTML =
                    createRecommendationCard(
                        movie
                    );

            };

    }

    catch (error) {

        console.error(error);

        recommendationCard.innerHTML =
            `
                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>
            `;

    }

}


/* =========================================================
   RECOMMENDATION CARD
========================================================= */

function createRecommendationCard(
    movie
) {

    const favorite =
        isFavorite(movie);


    const watchlisted =
        isWatchlisted(movie);


    return `

        <div class="recommendation-card">

            <img
                src="${escapeHTML(movie.poster)}"
                alt="${escapeHTML(movie.title)}"
            >


            <div class="recommendation-details">

                <h3>
                    ${escapeHTML(movie.title)}
                </h3>


                <p>

                    ${
                        movie.type ===
                        "movie"

                            ? "Movie"

                            : "TV Series"
                    }

                    ·

                    ${getYear(movie.date)}

                    ·

                    ★
                    ${movie.rating.toFixed(1)}

                </p>


                <p>

                    ${escapeHTML(
                        movie.overview
                    )}

                </p>


                <div class="modal-actions">

                    <button
                        class="trailer-btn"
                        data-recommendation-trailer
                    >
                        ▶ Trailer
                    </button>


                    <button
                        class="
                            library-btn
                            ${favorite ? "active" : ""}
                        "
                        data-recommendation-favorite
                    >

                        ${
                            favorite
                                ? "♥ Favorited"
                                : "♡ Favorite"
                        }

                    </button>


                    <button
                        class="
                            library-btn
                            ${watchlisted ? "active" : ""}
                        "
                        data-recommendation-watchlist
                    >

                        🔖 Watchlist

                    </button>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   RESET SPIN
========================================================= */

function resetSpin() {

    state.spinLanguage =
        null;

    state.spinGenre =
        null;

    state.languageRotation =
        0;

    state.genreRotation =
        0;


    languageWheel.style.transform =
        "rotate(0deg)";


    genreWheel.style.transform =
        "rotate(0deg)";


    languageResult.textContent =
        "Language not selected yet.";


    genreResult.textContent =
        "Spin the language wheel first.";


    recommendationCriteria.textContent =
        "Spin both wheels to get a recommendation.";


    recommendationCard.innerHTML =
        "";


    spinGenreBtn.disabled =
        true;


    spinLanguageBtn.disabled =
        false;

}


/* =========================================================
   CARD EVENTS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const action =
            event.target.closest(
                "[data-action]"
            );


        if (action) {

            event.stopPropagation();


            const movie =
                findMovie(
                    action.dataset.id,
                    action.dataset.type
                );


            if (!movie) return;


            if (
                action.dataset.action ===
                "favorite"
            ) {

                toggleFavorite(movie);

                return;

            }


            if (
                action.dataset.action ===
                "watchlist"
            ) {

                toggleWatchlist(movie);

                return;

            }


            if (
                action.dataset.action ===
                "trailer"
            ) {

                openTrailer(movie);

                return;

            }

        }


        const card =
            event.target.closest(
                ".movie-card"
            );


        if (card) {

            const movie =
                findMovie(
                    card.dataset.id,
                    card.dataset.type
                );


            if (movie) {

                openMovieModal(movie);

            }

        }

    }
);


/* =========================================================
   SEARCH
========================================================= */

searchBtn.addEventListener(
    "click",
    () => {

        const query =
            searchInput.value.trim();


        if (!query) {

            state.searchMode =
                false;

            state.searchQuery =
                "";

        }

        else {

            state.searchMode =
                true;

            state.searchQuery =
                query;

        }


        loadContent(true);

    }
);


searchInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            searchBtn.click();

        }

    }
);


/* =========================================================
   FILTERS
========================================================= */

languageFilter.addEventListener(
    "change",
    () => {

        state.language =
            languageFilter.value;

        state.searchMode =
            false;

        searchInput.value =
            "";

        loadContent(true);

    }
);


genreFilter.addEventListener(
    "change",
    () => {

        state.genre =
            genreFilter.value;

        state.searchMode =
            false;

        searchInput.value =
            "";

        loadContent(true);

    }
);


typeFilter.addEventListener(
    "change",
    () => {

        state.filterType =
            typeFilter.value;

        state.searchMode =
            false;

        searchInput.value =
            "";

        loadContent(true);

    }
);


/* =========================================================
   LOAD MORE
========================================================= */

loadMoreBtn.addEventListener(
    "click",
    () => {

        state.page++;

        loadContent(false);

    }
);


/* =========================================================
   MODAL EVENTS
========================================================= */

closeModal.addEventListener(
    "click",
    closeMovieModal
);


movieModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            movieModal
        ) {

            closeMovieModal();

        }

    }
);


modalTrailerBtn.addEventListener(
    "click",
    () => {

        openTrailer(
            state.currentMovie
        );

    }
);


modalFavoriteBtn.addEventListener(
    "click",
    () => {

        if (
            state.currentMovie
        ) {

            toggleFavorite(
                state.currentMovie
            );

        }

    }
);


modalWatchlistBtn.addEventListener(
    "click",
    () => {

        if (
            state.currentMovie
        ) {

            toggleWatchlist(
                state.currentMovie
            );

        }

    }
);


/* =========================================================
   RATING EVENTS
========================================================= */

ratingStars.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) return;


        state.selectedRating =
            Number(
                button.dataset.rating
            );


        updateRatingUI();

    }
);


/* =========================================================
   SAVE REVIEW
========================================================= */

saveReviewBtn.addEventListener(
    "click",
    () => {

        if (!state.currentMovie)
            return;


        if (
            !state.selectedRating &&
            !reviewInput.value.trim()
        ) {

            reviewStatus.textContent =
                "Please select a rating or write a review.";

            return;

        }


        saveReview(
            state.currentMovie,

            state.selectedRating,

            reviewInput.value
        );


        reviewStatus.textContent =
            "Rating and review saved successfully.";

    }
);


/* =========================================================
   CLEAR REVIEW
========================================================= */

deleteReviewBtn.addEventListener(
    "click",
    () => {

        if (!state.currentMovie)
            return;


        clearReview(
            state.currentMovie
        );


        state.selectedRating =
            0;


        reviewInput.value =
            "";


        updateRatingUI();


        reviewStatus.textContent =
            "Your rating and review were cleared.";

    }
);


/* =========================================================
   SPIN EVENTS
========================================================= */

spinLanguageBtn.addEventListener(
    "click",
    spinLanguage
);


spinGenreBtn.addEventListener(
    "click",
    spinGenre
);


spinAgainBtn.addEventListener(
    "click",
    resetSpin
);


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "movieHubLoggedIn"
        );

        window.location.href =
            "login.html";

    }
);


/* =========================================================
   MOBILE MENU
========================================================= */

menuBtn.addEventListener(
    "click",
    () => {

        navMenu.classList.toggle(
            "open"
        );

    }
);


navMenu.addEventListener(
    "click",
    event => {

        if (
            event.target.tagName ===
            "A"
        ) {

            navMenu.classList.remove(
                "open"
            );

        }

    }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeMovieModal();

        }

    }
);


/* =========================================================
   WAIT
========================================================= */

function wait(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


/* =========================================================
   INITIALIZE WHEELS
========================================================= */

createWheel(
    languageWheel,
    LANGUAGES
);


createWheel(

    genreWheel,

    Object.entries(
        GENRE_NAMES
    ).map(
        ([key, name]) => ({
            key,
            name
        })
    )

);


/* =========================================================
   YEAR
========================================================= */

document.getElementById(
    "currentYear"
).textContent =
    new Date().getFullYear();


/* =========================================================
   INITIAL LOAD
========================================================= */

refreshLibraries();

loadContent(true);