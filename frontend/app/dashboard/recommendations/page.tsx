'use client';
import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { InsightsPanel } from '@/components/dashboard/insights-panel';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';
import { Card } from '@/components/ui/card';
export default function RecommendationsPage() { const { token, user } = useApp(); const [data, setData] = useState<any[]>([]); const [smart, setSmart] = useState<any>(null); useEffect(() => { if (token) { apiClient.getRecommendations(token).then(setData); apiClient.getSmartRecommendation(token, { preferredTransport: user?.preferredTransport ?? 'metro', audience: 'user' }).then(setSmart).catch(() => undefined); } }, [token, user]); return <ProtectedShell><div className='space-y-6'><InsightsPanel predictions={data} />{smart ? <Card><h2 className='text-2xl font-semibold'>Route guidance</h2><p className='mt-3 soft-text'>{smart.recommendation}</p><p className='mt-3 text-xs soft-text'>Source: {smart.source}</p></Card> : null}</div></ProtectedShell>; }
