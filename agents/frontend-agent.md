# Frontend Agent

## Components Built
- **Header** — Sticky nav with logo, "Multi-Agent" badge, 3 tab pills
- **Hero Section** — GPT-4o branding, headline, subtitle
- **Agent Pipeline Visualizer** — 6 animated nodes (idle/active/done states)
- **Job Description Panel** — Title input + textarea + Load Example button
- **Resume Upload Panel** — Drag-drop zone + paste areas + file list
- **Rank Button** — Amber CTA with loading state
- **Summary Cards** — 4 metric cards (total/top/avg/recommended)
- **Job Requirements Panel** — Extracted skills as chips
- **Ranked Candidates List** — Clickable rows with score badges
- **Candidate Detail Modal** — Full breakdown with matched/missing skills
- **History Tab** — Session cards with click-to-expand
- **Analytics Tab** — Stats + CSS score distribution bars + skill cloud

## API Calls Made
- `POST /api/rank` — Submit job + resumes for ranking
- `GET /api/sessions` — Load history tab
- `GET /api/sessions/:id` — Load session detail
- `GET /api/analytics/overview` — Load analytics stats
- `GET /api/analytics/score-distribution` — Load score distribution

## State Management Approach
- Global `appState` object: `{ currentTab, currentResults, isRanking, sessions }`
- DOM manipulation via vanilla JS (no framework)
- Results stored in `window.currentResults` for modal access
- Tab switching hides/shows sections, fetches data on first view
- Agent nodes animated via CSS class toggling with setTimeout delays

## Design Decisions
- Dark theme: `#080b12` background for professional HR tool aesthetic
- Gold/amber accent (#f0a500) for premium feel
- Google Fonts: Syne for headings (geometric), DM Sans for body (clean)
- CSS custom properties for consistent theming
- Staggered fadeUp animations for candidate rows
- Score color coding: green 80+, amber 60-79, red below 60
- Recommendation badges with semantic colors
- No chart library — pure CSS bars for score distribution
