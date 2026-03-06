

## Paper Statistics Viewer

### Overview
A single-page data visualization app that displays a journal article's metadata and statistical history from a local JSON file.

### Data Structure
Each `{paper_id}.json` in `src/data/` will follow this shape:
```json
{
  "meta": {
    "title": "...",
    "authors": ["..."],
    "journal": "...",
    "published_date": "2024-01-15",
    "doi": "...",
    "abstract": "..."
  },
  "metrics": {
    "views": [{ "date": "2024-01", "value": 120 }, ...],
    "citations": [{ "date": "2024-01", "value": 3 }, ...],
    "downloads": [{ "date": "2024-01", "value": 45 }, ...]
  }
}
```

### Pages & Routing
- **`/:paper_id`** — Main paper stats page. Reads `paper_id` from the URL, fetches the corresponding JSON, and renders the dashboard.
- **`/`** — Simple landing/index page with instructions or a search input.

### Layout & Components
1. **Paper Meta Card** — Static display of title, authors, journal, date, DOI, and abstract in a clean card layout at the top.
2. **Metrics Dashboard** — Below the meta card, a grid of charts:
   - **Views** → Line chart (trend over time)
   - **Citations** → Bar chart (discrete accumulation)
   - **Downloads** → Line chart
   - Each chart in its own card with a title and the Recharts visualization.
3. **Page shell** — Clean centered container with responsive padding.

### Data Flow
1. Route param `paper_id` extracted via `useParams()`.
2. A custom hook (`usePaperData`) dynamically imports `src/data/{paper_id}.json` using Vite's `import()` or `fetch()` against the public folder.
3. Loading and error states handled gracefully.
4. Data passed to meta card and chart components as props.

### Sample Data
A sample JSON file will be included so the page works immediately for demo/testing.

