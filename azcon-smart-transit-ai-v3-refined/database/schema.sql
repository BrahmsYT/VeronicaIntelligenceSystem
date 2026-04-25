-- Starter PostgreSQL schema for AZCON Smart Transit AI
-- Use Prisma migrations later or translate this directly for raw SQL deployments.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  preferred_language TEXT NOT NULL DEFAULT 'az',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE routes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  corridor TEXT NOT NULL,
  status TEXT NOT NULL
);
