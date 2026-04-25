import { env } from '../config';
import { readDb } from '../db';

function buildMockRecommendation(userContext: Record<string, unknown>) {
  const preferred = typeof userContext.preferredTransport === 'string' ? userContext.preferredTransport : 'metro';
  return {
    recommendation:
      preferred === 'bus'
        ? 'Peak crowding is elevated on bus corridors. Shift demand to metro or rail for faster throughput.'
        : 'Prefer metro and suburban rail during peak demand, then use taxi for final-mile transfers.',
    actions: ['rebalance vehicles', 'broadcast rider alerts', 'prioritize lower-delay corridors'],
    source: 'mock'
  };
}

export async function getGroundedTripNarrative(payload: {
  origin: string;
  destination: string;
  departureTime: string;
  date?: string;
  recommendedSummary: string;
  contextNote: string;
  directVsTransferNote: string;
  alternatives: Array<{
    id: string;
    transferCount: number;
    summary: string;
    crowdLevel: 'low' | 'medium' | 'high';
    totalPredictedOccupancy: number;
    totalEstimatedMinutesToEase: number;
  }>;
}) {
  const fallback = `AI analysis for ${payload.origin} -> ${payload.destination}: ${payload.recommendedSummary} ${payload.directVsTransferNote} ${payload.contextNote}`;

  if (!env.aiEnabled || !env.openRouterApiKey) {
    return { recommendation: fallback, source: 'disabled' as const };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.openRouterTimeoutMs);

  try {
    const response = await fetch(`${env.openRouterBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.frontend,
        'X-Title': 'AZCON Smart Transit AI'
      },
      body: JSON.stringify({
        model: env.openRouterModel,
        messages: [
          {
            role: 'system',
            content:
              'You are a transit assistant. Only rewrite provided facts into clear English. Do not invent stops, routes, or numbers. Return JSON: {"recommendation":"..."}.'
          },
          {
            role: 'user',
            content: JSON.stringify({
              task: 'Rewrite the recommendation in concise English only, using provided facts.',
              strictRules: ['Do not add any new route IDs or stop names', 'Do not change numbers', 'Do not use any language other than English'],
              data: payload
            })
          }
        ],
        temperature: 0,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter request failed: ${text}`);
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('OpenRouter response content is empty');
    }

    const normalized = content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(normalized);
    const recommendation = typeof parsed?.recommendation === 'string' ? parsed.recommendation.trim() : '';
    if (!recommendation) {
      throw new Error('OpenRouter recommendation is missing');
    }

    return { recommendation, source: 'openrouter' as const };
  } catch {
    return { recommendation: fallback, source: 'fallback' as const };
  } finally {
    clearTimeout(timeout);
  }
}

async function askOpenRouter(prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.openRouterTimeoutMs);

  try {
    const response = await fetch(`${env.openRouterBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': env.frontend,
      'X-Title': 'AZCON Smart Transit AI'
    },
    body: JSON.stringify({
      model: env.openRouterModel,
      messages: [
        {
          role: 'system',
          content:
            'You are an AI transit operations assistant. Return concise JSON only with recommendation, actions array, and confidence.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    }),
    signal: controller.signal
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter request failed: ${text}`);
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('OpenRouter response content is empty');
    }

    const normalized = content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(normalized);
  } finally {
    clearTimeout(timeout);
  }
}

export async function getPassengerFlowPrediction(routeId: string) {
  const db = readDb();
  const route = db.routes.find((item: any) => item.id === routeId);
  if (!route) throw new Error('Route not found');

  return {
    routeId,
    passengerFlow: Math.round(route.capacity * (0.62 + route.occupancy / 160)),
    confidence: 0.89,
    model: env.aiEnabled ? env.openRouterModel : 'mock'
  };
}

export async function getOccupancyForecast(routeId: string) {
  const db = readDb();
  const route = db.routes.find((item: any) => item.id === routeId);
  if (!route) throw new Error('Route not found');

  return {
    routeId,
    occupancyForecast: Math.min(98, route.occupancy + (route.crowded ? 6 : 3)),
    horizonMinutes: 45,
    model: env.aiEnabled ? env.openRouterModel : 'mock'
  };
}

export async function getDelayRiskAssessment(routeId: string) {
  const db = readDb();
  const route = db.routes.find((item: any) => item.id === routeId);
  if (!route) throw new Error('Route not found');

  return {
    routeId,
    delayRisk: route.delayRisk,
    avgDelayMinutes: route.avgDelayMinutes,
    factors: route.crowded ? ['crowding', 'dispatch lag'] : ['network conditions'],
    model: env.aiEnabled ? env.openRouterModel : 'mock'
  };
}

export async function getSmartRecommendation(userContext: Record<string, unknown>) {
  if (!env.aiEnabled || !env.openRouterApiKey) {
    return buildMockRecommendation(userContext);
  }

  const db = readDb();
  const context = {
    routes: db.routes.map((route: any) => ({
      name: route.name,
      type: route.transportType,
      occupancy: route.occupancy,
      delayRisk: route.delayRisk,
      avgDelayMinutes: route.avgDelayMinutes
    })),
    alerts: db.alerts,
    userContext
  };

  try {
    const ai = await askOpenRouter(`Transit context: ${JSON.stringify(context)}. Return the best rider recommendation as JSON.`);
    return {
      recommendation: typeof ai?.recommendation === 'string' ? ai.recommendation : 'Use metro/rail alternatives for peak-hour corridors where crowding is elevated.',
      actions: Array.isArray(ai?.actions) ? ai.actions : ['monitor occupancy', 'broadcast rider guidance'],
      confidence: typeof ai?.confidence === 'number' ? ai.confidence : 0.75,
      source: 'openrouter'
    };
  } catch {
    return {
      ...buildMockRecommendation(userContext),
      source: 'fallback'
    };
  }
}
