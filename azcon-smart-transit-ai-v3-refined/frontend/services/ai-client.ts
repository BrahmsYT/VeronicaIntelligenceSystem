import { PredictionCardData } from '@/lib/types';

export async function getPassengerFlowPrediction(routeId: string): Promise<{ routeId: string; passengerFlow: number; horizon: string }> {
  return Promise.resolve({ routeId, passengerFlow: 1240, horizon: 'next_2_hours' });
}

export async function getOccupancyForecast(routeId: string): Promise<{ routeId: string; occupancyForecast: number; peakWindow: string }> {
  return Promise.resolve({ routeId, occupancyForecast: 83, peakWindow: '18:00-19:00' });
}

export async function getDelayRiskAssessment(routeId: string): Promise<{ routeId: string; delayRiskScore: number; category: string }> {
  return Promise.resolve({ routeId, delayRiskScore: 67, category: 'medium' });
}

export async function getSmartRecommendation(userContext: { preferredMode: string; destination: string }): Promise<PredictionCardData> {
  return Promise.resolve({
    routeId: 'R-102',
    passengerFlow: 950,
    occupancyForecast: 71,
    delayRiskScore: 34,
    recommendation: `Prefer Green Corridor express toward ${userContext.destination}; low crowding expected.`
  });
}
