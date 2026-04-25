# AZCON Smart Transit AI — Refined MVP

This version restores the cleaner original frontend style, keeps the db.json-backed backend/database layer, and retains upgraded 3D transport models.

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

## Notes
- Database is stored in `database/db.json`
- Backend reads/writes directly to `db.json`
- Frontend styling is reverted closer to the original MVP visual language
- 3D vehicle previews are kept and rebuilt as low-poly transport shapes
