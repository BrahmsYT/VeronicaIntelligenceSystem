# AZCON Smart Transit AI — Upgraded MVP

This rebuild continues from the last refined ZIP and adds the missing pieces the project needed:

- cleaner frontend preserved from the earlier MVP direction
- improved low-poly 3D transport previews instead of plain placeholder boxes
- light / dark / ocean / neon / lava modes
- `db.json` storage in `database/db.json`
- admin CRUD for routes and team members
- public landing team cards powered by admin data
- OpenRouter-ready AI service layer with mock fallback

## Run

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## OpenRouter integration

Set these values in `backend/.env`:

```env
AI_ENABLED=true
OPENROUTER_API_KEY=your_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4o-mini
```

When `AI_ENABLED=false`, the backend returns safe mock AI responses.

## Real map preview (Mapbox)

To enable real route maps in Trip Planner, add these values to `backend/.env`:

```env
MAPBOX_ACCESS_TOKEN=your_mapbox_token
MAPBOX_STYLE=mapbox/dark-v11
```

The frontend calls backend proxy endpoint `GET /api/maps/route-preview`.
Backend performs Mapbox geocoding + directions and returns:

- route distance and duration
- route geometry
- static map image URL

## Database

Main MVP data file:

- `database/db.json`

Canonical structure uses a single database path only (`database/db.json`) to avoid duplicate data drift.

## Real-data next step

To work with real AZCON-related data, keep this flow:

1. seed `db.json` from official route and operations data
2. add CSV/JSON import scripts for occupancy and delay logs
3. later replace the repository layer with PostgreSQL or another real DB

## Security notes

This is still an MVP. Before production, upgrade these areas:

- replace plain password storage with hashing
- move auth to httpOnly cookies
- add rate limiting and helmet
- add audit logging for admin changes
- add dependency audit in CI
