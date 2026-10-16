# OpenTable Reimagined — Algolia Restaurant Discovery

An unofficial restaurant discovery prototype developed for an Algolia Solutions Engineer technical assessment.

**Live demo:** https://opentable-algolia-demo-five.vercel.app/

**Source code:** https://github.com/victoriapiottiuk-collab/opentable-algolia-demo

## Overview

This application demonstrates how Algolia can power fast, relevant restaurant discovery for two types of users:

- **Known-item search:** Finding a particular restaurant by name, including partial matches and misspellings.
- **Exploratory discovery:** Finding restaurants through cuisine, location, price, ratings and sorting.

The application searches a dataset of 5,000 restaurants and provides a responsive React interface.

## Features

- Instant, typo-tolerant restaurant search
- Cuisine-related synonyms configured in Algolia
- City, price and minimum-rating filters
- Sorting by recommended results, price ascending and highest rating
- Paginated results with 12 restaurants per page
- Restaurant ratings, review counts and price information
- Links to the provided OpenTable reservation pages
- Display of Algolia search processing time

## Tech Stack

- **Frontend:** React, Vite, JavaScript and CSS
- **Search:** Algolia Search API
- **Hosting:** Vercel
- **Version control:** GitHub

## Data Preparation

Two source datasets were merged using `objectID`:

- `restaurants_list.json` — restaurant names, locations, addresses, price categories and geographical coordinates.
- `restaurants_info.csv` — cuisine, ratings, review counts, dining styles and price ranges.

The merge produced 5,000 records, with checks for matching identifiers and duplicate records.

The resulting dataset was uploaded to the Algolia primary index `restaurants_merged`.

## Algolia Configuration

**Searchable attributes**, ordered by priority:

1. `name`
2. `food_type`
3. `city`
4. `neighborhood`

**Filtering:** Algolia facets for city and price, alongside numeric filters for minimum star ratings. Other available facets include cuisine, neighbourhood and dining style.

**Ranking:** Algolia's textual relevance criteria are followed by a confidence-adjusted `weighted_rating` and review count. The weighted rating combines each restaurant's average rating, review volume, and the dataset average (4.29 stars), using a 100-review smoothing factor. This avoids over-promoting restaurants with very few reviews.

**Sorting replicas:** `restaurants_price_asc` sorts by price ascending, while `restaurants_rating_desc` sorts by raw star rating descending.

**Sorting replicas:**

- `restaurants_merged` — Recommended
- `restaurants_price_asc` — Price: Low to High
- `restaurants_rating_desc` — Highest Rated

Typo tolerance, cuisine synonyms and price-related Query Rules were configured in Algolia. Geographic search is supported by the indexed `_geoloc` coordinates, although it is not exposed in the current frontend.

## Relevance and Performance

Testing covered exact restaurant names, partial searches, typos, cuisine searches, price intent, combined filters and geographic search.

Initial Algolia processing-time observations:

| Search | Processing time |
|---|---|
| Italian | 8 ms |
| cheap Italian | 11 ms |

These are individual search-processing measurements, not end-to-end website latency benchmarks.

The frontend uses a 250 ms debounce to limit unnecessary requests during typing.

## Running Locally

Install dependencies:

```bash
npm install
```

Create a `.env.local` file containing:

```env
VITE_ALGOLIA_APP_ID=your_app_id
VITE_ALGOLIA_SEARCH_KEY=your_search_only_key
VITE_ALGOLIA_INDEX=restaurants_merged
```

Start the development server:

```bash
npm run dev
```

Only a restricted search-only API key should be used in the frontend.

## Limitations and Future Improvements

This demonstration focuses on restaurant discovery rather than booking. Real-time table availability is not included in the dataset, and reservation links open OpenTable externally.

Potential improvements include confidence-adjusted restaurant ratings, map-based discovery, more advanced cuisine filtering and improved imagery.

## Disclaimer

This is an independent technical assessment prototype and is not affiliated with or endorsed by OpenTable.