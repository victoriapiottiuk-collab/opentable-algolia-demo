
import { useEffect, useState } from "react";
import { searchClient, INDEX_NAME } from "./algolia";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("restaurants_merged");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const numericFilters = [];

        if (minRating) {
          numericFilters.push(`stars_count >= ${minRating}`);
        }

        const facetFilters = [];

        if (city) facetFilters.push(`city:${city}`);
        if (price) facetFilters.push(`price:${price}`);

        const response = await searchClient.searchSingleIndex({
          indexName: sortBy,
          searchParams: {
            query,
            hitsPerPage: 12,
            page,
            facetFilters,
            numericFilters
          }
        });

        if (!cancelled) {
          setRestaurants(response.hits);
          setTotal(response.nbHits);
          setTotalPages(response.nbPages);
          setSearchTime(response.processingTimeMS);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Couldn't load restaurants. Check your Algolia connection.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, city, price, minRating, sortBy, page]);

  const priceLabel = (price) => "$".repeat(Math.max(1, price || 1));

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          OpenTable<span> Reimagined</span>
        </div>
        <span className="header-label">Powered by Algolia</span>
      </header>

      <main className="container">
        <section className="hero">
          <p className="eyebrow">DISCOVER SOMETHING DELICIOUS</p>
          <h1>Find somewhere worth going.</h1>
          <p>Explore 5,000 restaurants by name, cuisine or location.</p>

          <div className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Try Italian, sushi, or a restaurant name..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
            />
            <button onClick={() =>
              document.querySelector(".results")?.scrollIntoView({
                behavior: "smooth"
              })
            }>
              Search
            </button>
          </div>
        </section>

        <section className="results">
          <div className="results-heading">
            <div>

              <h2>Discover restaurants</h2>
              <p>
                {loading
                  ? "Searching..."
                  : `${total.toLocaleString()} restaurants found · ${searchTime} ms Algolia processing`}
              </p>
            </div>
          </div>

          <div className="filter-bar">
            <select value={city} onChange={(e) => {
              setCity(e.target.value);
              setPage(0);
            }}>
              <option value="">All cities</option>
              <option value="New York">New York</option>
              <option value="San Francisco">San Francisco</option>
              <option value="Chicago">Chicago</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="San Diego">San Diego</option>
              <option value="Houston">Houston</option>
              <option value="Orlando">Orlando</option>
            </select>

            <select value={price} onChange={(e) => {
              setPrice(e.target.value);
              setPage(0);
            }}>
              <option value="">Any price</option>
              <option value="2">$30 and under</option>
              <option value="3">$31 to $50</option>
              <option value="4">$50 and over</option>
            </select>

            <select value={minRating} onChange={(e) => {
              setMinRating(e.target.value);
              setPage(0);
            }}>
              <option value="">Any rating</option>
              <option value="3">3+ stars</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>

            <select value={sortBy} onChange={(e) => {
              setSortBy(e.target.value);
              setPage(0);
            }}>
              <option value="restaurants_merged">Recommended</option>
              <option value="restaurants_price_asc">Price: Low to High</option>
              <option value="restaurants_rating_desc">Highest Rated</option>
            </select>


            <button
              type="button"
              className="reset-button"
              onClick={() => {
                setQuery("");
                setCity("");
                setPrice("");
                setMinRating("");
                setSortBy("restaurants_merged");
                setPage(0);

              }}
            >
              Clear filters
            </button>

          </div>


          {error && <div className="empty-state">{error}</div>}

          {!error && !loading && restaurants.length === 0 && (
            <div className="empty-state">
              <h3>No restaurants found</h3>
              <p>Try another restaurant, cuisine or location.</p>
            </div>
          )}

          {!error && (
            <div className="restaurant-grid">
              {restaurants.map((restaurant) => (
                <article className="restaurant-card" key={restaurant.objectID}>
                  <div className="restaurant-info">
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.food_type} · {restaurant.city}</p>
                    <p>
                      <span className="rating">★ {restaurant.stars_count}</span>
                      {" · "}
                      {restaurant.reviews_count} reviews
                    </p>
                    <p>
                      {priceLabel(restaurant.price)}
                      {" · "}
                      {restaurant.price_range}
                    </p>
                    <a
                      href={restaurant.reserve_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on OpenTable →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!error && totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={page === 0 || loading}
                onClick={() => setPage((current) => current - 1)}
              >
                ← Previous
              </button>

              <span>
                Page {page + 1} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                Next →
              </button>
            </div>
          )}

        </section>
      </main>

      <footer>
        Unofficial OpenTable discovery prototype · Powered by Algolia
      </footer>
    </div>
  );
}

export default App;
