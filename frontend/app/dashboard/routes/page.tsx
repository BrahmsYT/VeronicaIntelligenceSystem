'use client';
import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { RoutesTable } from '@/components/dashboard/routes-table';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';
export default function RoutesPage() { const { token } = useApp(); const [routes, setRoutes] = useState<any[]>([]); useEffect(() => { if (token) apiClient.getRoutes(token).then(setRoutes); }, [token]); return <ProtectedShell><RoutesTable routes={routes} /></ProtectedShell>; }
