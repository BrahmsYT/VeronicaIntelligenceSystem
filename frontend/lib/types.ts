export type Locale = 'az' | 'en' | 'tr';
export type Role = 'admin' | 'staff' | 'user';
export type TransportType = 'bus' | 'metro' | 'taxi' | 'rail';
export type ThemePreset = 'light' | 'dark' | 'ocean' | 'neon' | 'lava';

export interface User {
  id: string;
  name: string;
  surname?: string;
  email: string;
  role: Role;
  preferredLanguage?: Locale;
  avatar?: string;
  theme?: ThemePreset;
  preferredTransport?: TransportType;
}

export interface RouteItem {
  id: string;
  code?: string;
  name: string;
  corridor: string;
  occupancy: number;
  delayRisk: 'low' | 'medium' | 'high';
  status: 'on-time' | 'monitoring' | 'delayed';
  trend: number[];
  etaVariance: number;
  transportType?: TransportType;
  origin?: string;
  destination?: string;
  capacity?: number;
  avgDelayMinutes?: number;
  crowded?: boolean;
}

export interface AlertItem {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  createdAt: string;
}

export interface PredictionCardData {
  routeId: string;
  passengerFlow: number;
  occupancyForecast: number;
  delayRiskScore: number;
  recommendation: string;
}

export interface TeamMember {
  id: string;
  name: string;
  surname: string;
  role: string;
  image: string;
  bio: string;
}

export interface SiteSettings {
  maintenanceMode: boolean;
  registrationOpen: boolean;
  aiDispatchEnabled: boolean;
  announcements: string[];
}

export interface StaffRouteOps {
  id: string;
  name: string;
  occupancy: number;
  delayRisk: 'low' | 'medium' | 'high';
  transportType: TransportType;
  crowded: boolean;
  avgDelayMinutes: number;
}

export interface DeploymentPlan {
  routeId: string;
  routeName: string;
  currentOccupancy: number;
  projectedOccupancy: number;
  targetOccupancy: number;
  suggestedDeployments: number;
  estimatedMinutesToEase: number;
  action: string;
  rationale: string;
}

export interface TripForecast {
  routeId: string;
  routeName: string;
  stop: string;
  departureTime: string;
  predictedOccupancy: number;
  crowdLevel: 'low' | 'medium' | 'high';
  estimatedMinutesToEase: number;
  recommendation: string;
  community?: {
    reportsInThisHour: number;
    crowdProbability: number;
    habitualCrowded: boolean;
    recentReports: CrowdFeedReport[];
  };
}

export interface CrowdFeedReport {
  crowded: boolean;
  departureTime: string;
  reportedAt: string;
}

export interface CrowdReportResult {
  saved: boolean;
  reportId: string;
  memory: {
    reportsInThisHour: number;
    crowdProbability: number;
    habitualCrowded: boolean;
    recentReports: CrowdFeedReport[];
  };
}
