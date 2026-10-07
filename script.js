"use strict";

/* ============ SETTINGS ============
   Get a free API key at https://www.themoviedb.org/settings/api
   and paste it between the quotes below. */
const TMDB_API_KEY = "YOUR_TMDB_API_KEY_HERE";

const API = "https://api.themoviedb.org/3";
const IMG_SMALL = "https://image.tmdb.org/t/p/w342";
const IMG_LARGE = "https://image.tmdb.org/t/p/w500";
const PAGES_PER_TYPE = 8;   // 8 pages x 20 titles x 2 types = about 320 titles
const PAGE_SIZE = 24;       // cards shown per "Load more"

/* Inline fallback poster (no file needed, never breaks) */
const FALLBACK = "data:image/svg+xml;utf8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='342' height='513' viewBox='0 0 342 513'>" +
  "<rect width='342' height='513' fill='#123B5D'/>" +
  "<g fill='none' stroke='#D4AF37' stroke-width='6'><rect x='111' y='200' width='120' height='90' rx='10'/>" +
  "<circle cx='171' cy='245' r='22'/></g>" +
  "<text x='171' y='345' text-anchor='middle' font-family='Arial' font-size='22' fill='#E5E7EB'>No poster</text></svg>"
);

/* Category -> genre names that count as a match (TMDB uses different names for TV) */
const GENRE_MATCH = {
  action: ["action"],
  comedy: ["comedy"],
  drama: ["drama"],
  thriller: ["thriller", "crime", "mystery"],
  scifi: ["science fiction", "sci-fi"],
  animation: ["animation"]
};

const state = { items: [], filter: "all", query: "", visible: PAGE_SIZE, filtered: [] };

const $ = (id) => document.getElementById(id);
const grid = $("grid");
const message = $("message");
const countEl = $("count");
const loadMoreBtn = $("loadMore");
const searchInput = $("searchInput");

/* ============ HELPERS ============ */
function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function getJSON(path, params = {}) {
  const url = new URL(API + path);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error("TMDB request failed (" + res.status + ")");
  return res.json();
}

function showMessage(title, text) {
  message.innerHTML = "<h3>" + esc(title) + "</h3><p>" + text + "</p>";
  message.hidden = false;
}

function hideMessage() { message.hidden = true; }

/* ============ DATA LOADING ============ */
async function loadData() {
  if (!TMDB_API_KEY || TMDB_API_KEY.indexOf("YOUR_") === 0) {
    countEl.textContent = "";
    showMessage("API key needed", "Open <code>script.js</code> and paste your free TMDB API key into <code>TMDB_API_KEY</code>.");
    return;
  }

  countEl.textContent = "Loading titles...";
  try {
    const [movieGenres, tvGenres] = await Promise.all([
      getJSON("/genre/movie/list"),
      getJSON("/genre/tv/list")
    ]);
    const genreMap = {};
    movieGenres.genres.concat(tvGenres.genres).forEach((g) => { genreMap[g.id] = g.name; });

    const requests = [];
    for (let p = 1; p <= PAGES_PER_TYPE; p++) {
      requests.push(getJSON("/movie/popular", { page: p }).then((d) => d.results.map((r) => ({ r, type: "movie" }))));
      requests.push(getJSON("/tv/popular", { page: p }).then((d) => d.results.map((r) => ({ r, type: "tv" }))));
    }
    const settled = await Promise.allSettled(requests);
    const raw = settled.filter((s) => s.status === "fulfilled").flatMap((s) => s.value);
    if (!raw.length) throw new Error("No data returned. Check that your API key is correct.");

    const seen = new Set();
    state.items = [];
    raw.forEach(({ r, type }) => {
      const key = type + "-" + r.id;
      if (seen.has(key)) return;
      seen.add(key);
      const date = r.release_date || r.first_air_date || "";
      state.items.push({
        key,
        type,
        title: r.title || r.name || "Untitled",
        year: date ? date.slice(0, 4) : "N/A",
        rating: r.vote_average ? r.vote_average.toFixed(1) : "NR",
        genres: (r.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),
        overview: r.overview || "No description available.",
        poster: r.poster_path ? IMG_SMALL + r.poster_path : FALLBACK,
        posterLarge: r.poster_path ? IMG_LARGE + r.poster_path : FALLBACK
      });
    });

    applyFilters();
  } catch (err) {
    console.error(err);
    countEl.textContent = "";
    showMessage("Could not load titles", esc(err.message) + ". Check your internet connection and API key, then reload.");
  }
}

/* ============ FILTER + SEARCH ============ */
function matchesFilter(item) {
  const f = state.filter;
  if (f === "all") return true;
  if (f === "movie" || f === "tv") return item.type === f;
  const wanted = GENRE_MATCH[f] || [];
  return item.genres.some((g) => wanted.some((w) => g.toLowerCase().indexOf(w) !== -1));
}

function matchesQuery(item) {
  if (!state.query) return true;
  const q = state.query;
  const label = item.type === "tv" ? "series tv" : "movie film";
  return (item.title + " " + item.genres.join(" ") + " " + label).toLowerCase().indexOf(q) !== -1;
}

function applyFilters() {
  state.filtered = state.items.filter((i) => matchesFilter(i) && matchesQuery(i));
  state.visible = PAGE_SIZE;
  render();
}

/* ============ RENDER ============ */
function cardHTML(item) {
  const genre = item.genres.slice(0, 2).join(", ") || "Unrated genre";
  const label = item.type === "tv" ? "Series" : "Movie";
  return (
    '<article class="card" tabindex="0" data-key="' + esc(item.key) + '" aria-label="' + esc(item.title) + '">' +
      '<div class="poster">' +
        '<img src="' + esc(item.poster) + '" alt="Poster of ' + esc(item.title) + '" loading="lazy" decoding="async" width="342" height="513">' +
        '<span class="badge type">' + label + "</span>" +
        '<span class="badge rate">&#9733; ' + esc(item.rating) + "</span>" +
      "</div>" +
      '<div class="card-body">' +
        '<h3 class="card-title">' + esc(item.title) + "</h3>" +
        '<p class="card-meta">' + esc(item.year) + " | " + esc(genre) + "</p>" +
      "</div>" +
    "</article>"
  );
}

function render() {
  const total = state.filtered.length;
  const shown = Math.min(state.visible, total);

  if (!total) {
    grid.innerHTML = "";
    loadMoreBtn.hidden = true;
    countEl.textContent = "0 titles found";
    const q = state.query ? ' for "' + esc(state.query) + '"' : "";
    showMessage("No results" , "Nothing matched" + q + ". Try a different title, genre or category.");
    return;
  }

  hideMessage();
  grid.innerHTML = state.filtered.slice(0, shown).map(cardHTML).join("");
  countEl.textContent = "Showing " + shown + " of " + total + " titles";
  loadMoreBtn.hidden = shown >= total;
}

/* ============ POSTER FALLBACK (error events do not bubble, so use capture) ============ */
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img && img.tagName === "IMG" && !img.dataset.failed) {
    img.dataset.failed = "1";
    img.src = FALLBACK;
  }
}, true);

/* ============ EVENTS ============ */
function setFilter(value) {
  state.filter = value;
  document.querySelectorAll("#filters .chip").forEach((c) => {
    c.classList.toggle("active", c.dataset.filter === value);
  });
  applyFilters();
}

$("filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (chip) setFilter(chip.dataset.filter);
});

let searchTimer;
function runSearch() {
  state.query = searchInput.value.trim().toLowerCase();
  applyFilters();
}
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(runSearch, 200);
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    clearTimeout(searchTimer);
    runSearch();
    $("browse").scrollIntoView({ behavior: "smooth" });
  }
});
$("searchBtn").addEventListener("click", () => {
  runSearch();
  $("browse").scrollIntoView({ behavior: "smooth" });
});

loadMoreBtn.addEventListener("click", () => {
  state.visible += PAGE_SIZE;
  render();
});

/* Navigation: hamburger + nav links that set a filter */
const hamburger = $("hamburger");
const navLinks = $("navLinks");

function closeMenu() {
  navLinks.classList.remove("open");
  hamburger.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
}

hamburger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  hamburger.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", String(open));
});

navLinks.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;
  if (link.dataset.filter) setFilter(link.dataset.filter);
  closeMenu();
});

/* ============ DETAILS MODAL ============ */
const modal = $("modal");
let lastFocus = null;

function openModal(key) {
  const item = state.items.find((i) => i.key === key);
  if (!item) return;
  lastFocus = document.activeElement;
  const poster = $("mPoster");
  delete poster.dataset.failed;
  poster.src = item.posterLarge;
  poster.alt = "Poster of " + item.title;
  $("mTitle").textContent = item.title;
  $("mMeta").textContent = (item.type === "tv" ? "Series" : "Movie") + " | " + item.year + " | Rating " + item.rating + "/10";
  $("mGenres").textContent = item.genres.join(", ");
  $("mOverview").textContent = item.overview;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  $("modalClose").focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}

grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) openModal(card.dataset.key);
});
grid.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".card");
  if (card) { e.preventDefault(); openModal(card.dataset.key); }
});
$("modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

/* ============ START ============ */
$("year").textContent = new Date().getFullYear();
loadData();