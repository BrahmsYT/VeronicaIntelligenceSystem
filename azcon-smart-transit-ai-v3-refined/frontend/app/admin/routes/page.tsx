'use client';

import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { RouteManager } from '@/components/admin/route-manager';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';

export default function AdminRoutesPage() {
  const { token } = useApp();
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    apiClient.getRoutes(token).then(setRoutes);
  }, [token]);

  return <ProtectedShell admin><RouteManager routes={routes} /></ProtectedShell>;
}
