import fs from 'fs';
import path from 'path';

function loadEnvFromFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFromFile();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwt: process.env.JWT_SECRET ?? 'azcon-super-secret',
  frontend: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  aiEnabled: (process.env.AI_ENABLED ?? 'false') === 'true',
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  openRouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  openRouterModel: process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini',
  openRouterTimeoutMs: Number(process.env.OPENROUTER_TIMEOUT_MS ?? 15000),
  osmUserAgent: process.env.OSM_USER_AGENT ?? 'azcon-smart-transit/1.0',
  osmContactEmail: process.env.OSM_CONTACT_EMAIL ?? ''
};
