# Database starter

Recommended production path:
1. PostgreSQL
2. Prisma ORM for schema + migrations
3. Redis later for short-lived prediction cache
4. Background jobs later for AI prediction refresh

Current MVP backend uses in-memory mock data for speed, but the folder and schema are ready for a real database transition.

Canonical MVP data source:

- `database/db.json`
