'use client';
import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { InsightsPanel } from '@/components/dashboard/insights-panel';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';
export default function RecommendationsPage() { const { token } = useApp(); const [data, setData] = useState<any[]>([]); useEffect(() => { if (token) apiClient.getRecommendations(token).then(setData); }, [token]); return <ProtectedShell><InsightsPanel predictions={data} /></ProtectedShell>; }
