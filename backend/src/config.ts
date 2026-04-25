export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwt: process.env.JWT_SECRET ?? 'azcon-super-secret',
  frontend: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  aiEnabled: (process.env.AI_ENABLED ?? 'false') === 'true',
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  openRouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  openRouterModel: process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini',
  openRouterTimeoutMs: Number(process.env.OPENROUTER_TIMEOUT_MS ?? 15000)
};
