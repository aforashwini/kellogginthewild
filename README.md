# Kellogg In the Wild

A single-page world map showing where Kellogg classmates live. Click a city to
see everyone there, with links to their LinkedIn and email.

## What it does

- Loads a published Google Sheet (columns: `Name`, `City`, `LinkedIn URL`,
  `Email`) as CSV and parses it with [PapaParse](https://www.papaparse.com/).
- Groups people by city and drops one purple count badge per city on a
  [Leaflet](https://leafletjs.com/) map using free OpenStreetMap tiles.
- Clicking a badge opens a panel (side panel on desktop, bottom sheet on
  mobile) listing every classmate in that city.
- A header shows live totals of classmates and cities, plus a search box that
  filters by name or city and a **Refresh** button.
- Re-fetches the sheet every 5 minutes (and on Refresh) with a cache-busting
  query parameter, updating markers in place.

City coordinates come from a built-in lookup in `app.js` — there is no
geocoding. People in cities not in the lookup are skipped silently.

## Run locally

It's a static site with no build step. Any static file server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly via `file://` also works, since all data is
fetched over HTTPS.

## Deploy

Push the repo to any static host:

- **GitHub Pages** — enable Pages for the branch; the root is the site.
- **Netlify / Vercel** — no build command, publish directory is the repo root.

## Files

- `index.html` — markup and CDN includes (Leaflet, PapaParse).
- `styles.css` — clean white look with Kellogg purple (`#4A1F60`) accents.
- `app.js` — data loading, markers, panel, search, and live refresh.

## Data source

The sheet is read from its CSV export endpoint:

```
https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv
```

To point at a different sheet, update `SHEET_ID` near the top of `app.js`. The
sheet must be published / shared so it can be fetched without authentication.
