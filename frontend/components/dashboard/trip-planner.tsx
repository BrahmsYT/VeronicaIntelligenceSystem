'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CrowdFeedReport, RouteItem, TripForecast } from '@/lib/types';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';

export function TripPlanner({ routes }: { routes: RouteItem[] }) {
  const { token } = useApp();
  const [routeId, setRouteId] = useState(routes[0]?.id ?? '');
  const [stop, setStop] = useState(routes[0]?.origin ?? 'Central stop');
  const [departureTime, setDepartureTime] = useState('08:30');
  const [forecast, setForecast] = useState<TripForecast | null>(null);
  const [crowdFeed, setCrowdFeed] = useState<CrowdFeedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [error, setError] = useState('');

  const selectedRoute = useMemo(() => routes.find((route) => route.id === routeId), [routeId, routes]);

  const runForecast = async () => {
    if (!token || !routeId) return;
    setLoading(true);
    setError('');
    setFeedbackMessage('');
    try {
      const result = await apiClient.getTripForecast(token, { routeId, stop, departureTime });
      setForecast(result);
      const feed = await apiClient.getCrowdFeed(token, { routeId, stop, limit: 6 });
      setCrowdFeed(feed.reports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate forecast');
    } finally {
      setLoading(false);
    }
  };

  const sendCrowdFeedback = async (crowded: boolean) => {
    if (!token || !routeId) return;
    setFeedbackLoading(true);
    setFeedbackMessage('');
    try {
      const result = await apiClient.submitCrowdReport(token, { routeId, stop, departureTime, crowded });
      setFeedbackMessage(crowded ? 'Sənin “dolu” feedback-in yadda saxlanıldı.' : 'Sənin “normal” feedback-in yadda saxlanıldı.');
      setForecast((prev) =>
        prev
          ? {
              ...prev,
              community: result.memory
            }
          : prev
      );
      setCrowdFeed(result.memory.recentReports);
    } catch (err) {
      setFeedbackMessage(err instanceof Error ? err.message : 'Feedback göndərilə bilmədi');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <Card>
      <h3 className='text-xl font-semibold'>Trip planner (User)</h3>
      <p className='mt-2 text-sm soft-text'>Select route, stop and time. AI estimates crowding and when it may decrease.</p>

      <div className='mt-4 grid gap-3 md:grid-cols-3'>
        <select className='rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} value={routeId} onChange={(e: any) => { setRouteId(e.target.value); const next = routes.find((route) => route.id === e.target.value); if (next?.origin) setStop(next.origin); }}>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>{route.name}</option>
          ))}
        </select>

        <input className='rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} value={stop} onChange={(e: any) => setStop(e.target.value)} placeholder='Stop / station name' />
        <input type='time' className='rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} value={departureTime} onChange={(e: any) => setDepartureTime(e.target.value)} />
      </div>

      <div className='mt-4'>
        <Button onClick={runForecast} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze trip crowding'}</Button>
      </div>

      {error ? <p className='mt-3 text-sm text-rose-300'>{error}</p> : null}

      {forecast ? (
        <div className='mt-5 grid gap-3 md:grid-cols-3'>
          <div className='rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            <p className='text-xs soft-text'>Predicted occupancy</p>
            <p className='mt-1 text-2xl font-semibold'>{forecast.predictedOccupancy}%</p>
          </div>
          <div className='rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            <p className='text-xs soft-text'>Crowd level</p>
            <p className='mt-1 text-2xl font-semibold capitalize'>{forecast.crowdLevel}</p>
          </div>
          <div className='rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            <p className='text-xs soft-text'>Estimated easing</p>
            <p className='mt-1 text-2xl font-semibold'>{forecast.estimatedMinutesToEase} min</p>
          </div>

          <div className='md:col-span-3 rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            <p className='text-xs uppercase tracking-[0.2em] soft-text'>AI insight</p>
            <p className='mt-2 text-sm'>{forecast.recommendation}</p>
            {selectedRoute ? <p className='mt-2 text-xs soft-text'>Route: {selectedRoute.name} · Stop: {stop} · Time: {departureTime}</p> : null}
          </div>

          <div className='md:col-span-3 rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            <p className='text-sm font-medium'>Bu stansiya indi doludur?</p>
            <div className='mt-3 flex flex-wrap gap-2'>
              <Button disabled={feedbackLoading} onClick={() => sendCrowdFeedback(true)}>Bəli, doludur</Button>
              <Button disabled={feedbackLoading} onClick={() => sendCrowdFeedback(false)} className='bg-transparent text-white' style={{ border: '1px solid var(--border)' }}>Xeyr, normaldır</Button>
            </div>
            {feedbackMessage ? <p className='mt-2 text-xs soft-text'>{feedbackMessage}</p> : null}

            {forecast.community ? (
              <div className='mt-4 grid gap-3 md:grid-cols-3'>
                <div className='rounded-xl p-3' style={{ border: '1px solid var(--border)' }}>
                  <p className='text-xs soft-text'>Bu saatda report sayı</p>
                  <p className='mt-1 text-lg font-semibold'>{forecast.community.reportsInThisHour}</p>
                </div>
                <div className='rounded-xl p-3' style={{ border: '1px solid var(--border)' }}>
                  <p className='text-xs soft-text'>Doluluq ehtimalı</p>
                  <p className='mt-1 text-lg font-semibold'>{forecast.community.crowdProbability}%</p>
                </div>
                <div className='rounded-xl p-3' style={{ border: '1px solid var(--border)' }}>
                  <p className='text-xs soft-text'>Mütəmadi sıxlıq</p>
                  <p className='mt-1 text-lg font-semibold'>{forecast.community.habitualCrowded ? 'Bəli' : 'Xeyr'}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className='md:col-span-3 rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            <p className='text-xs uppercase tracking-[0.2em] soft-text'>Community feed</p>
            {crowdFeed.length === 0 ? <p className='mt-2 text-sm soft-text'>Hələ report yoxdur. İlk feedback-i sən ver.</p> : (
              <div className='mt-2 space-y-2'>
                {crowdFeed.map((item, index) => (
                  <div key={`${item.reportedAt}-${index}`} className='flex items-center justify-between rounded-xl px-3 py-2 text-sm' style={{ border: '1px solid var(--border)' }}>
                    <span>{item.crowded ? '🔴 Dolu' : '🟢 Normal'}</span>
                    <span className='soft-text'>{item.departureTime} · {new Date(item.reportedAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
