'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPinned, Sparkles, ThumbsDown, ThumbsUp, Users } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CrowdFeedReport, RouteItem, TripForecast } from '@/lib/types';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';
import { RouteMapPreview } from '@/components/dashboard/route-map-preview';

export function TripPlanner({ routes }: { routes: RouteItem[] }) {
  const { token } = useApp();
  const [mode, setMode] = useState<'route' | 'journey'>('journey');
  const [routeId, setRouteId] = useState(routes[0]?.id ?? '');
  const [stop, setStop] = useState(routes[0]?.origin ?? 'Central stop');
  const [dropoffStop, setDropoffStop] = useState(routes[0]?.destination ?? '');
  const [origin, setOrigin] = useState(routes[0]?.origin ?? '28 MAY m/st');
  const [destination, setDestination] = useState(routes[0]?.destination ?? 'NƏFTÇİLƏR m/st');
  const [activeSearchField, setActiveSearchField] = useState<'origin' | 'destination' | null>(null);
  const [forecast, setForecast] = useState<TripForecast | null>(null);
  const [crowdFeed, setCrowdFeed] = useState<CrowdFeedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [error, setError] = useState('');

  const searchKey = (value: string) =>
    String(value || '')
      .toLowerCase()
      .replace(/[əƏ]/g, 'e')
      .replace(/[ıİ]/g, 'i')
      .replace(/[öÖ]/g, 'o')
      .replace(/[üÜ]/g, 'u')
      .replace(/[şŞ]/g, 's')
      .replace(/[çÇ]/g, 'c')
      .replace(/[ğĞ]/g, 'g')
      .replace(/\s+/g, ' ')
      .trim();

  const selectedRoute = useMemo(() => routes.find((route) => route.id === routeId), [routeId, routes]);
  const stationOptions = useMemo(() => {
    if (!selectedRoute) return [];
    const source = Array.isArray(selectedRoute.stops) && selectedRoute.stops.length ? selectedRoute.stops : [selectedRoute.origin, selectedRoute.destination];
    return source
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .filter((value, idx, arr) => arr.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase()) === idx);
  }, [selectedRoute]);

  const dropoffOptions = useMemo(() => {
    if (!stationOptions.length) return [];
    const currentBoardingIdx = stationOptions.findIndex((item) => item.toLowerCase() === stop.trim().toLowerCase());
    if (currentBoardingIdx >= 0) {
      const forward = stationOptions.slice(currentBoardingIdx + 1).filter((item) => item.toLowerCase() !== stop.trim().toLowerCase());
      if (forward.length) return forward;
    }
    return stationOptions.filter((item) => item.toLowerCase() !== stop.trim().toLowerCase());
  }, [stationOptions, stop]);

  const allStations = useMemo(() => {
    const source = routes.flatMap((route) => [route.origin, route.destination, ...(Array.isArray(route.stops) ? route.stops : [])]);
    return source
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .filter((value, idx, arr) => arr.findIndex((candidate) => searchKey(candidate) === searchKey(value)) === idx);
  }, [routes]);

  const getStationSuggestions = (query: string) => {
    const normalizedQuery = searchKey(query);
    if (!normalizedQuery) return [];
    return allStations
      .filter((station) => {
        const key = searchKey(station);
        return key.startsWith(normalizedQuery) || key.split(' ').some((token) => token.startsWith(normalizedQuery));
      })
      .slice(0, 8);
  };

  const originSuggestions = useMemo(() => getStationSuggestions(origin), [origin, allStations]);
  const destinationSuggestions = useMemo(() => getStationSuggestions(destination), [destination, allStations]);

  useEffect(() => {
    if (mode !== 'route' || !selectedRoute) return;
    if (!stationOptions.length) {
      if (selectedRoute.origin && stop !== selectedRoute.origin) setStop(selectedRoute.origin);
      return;
    }

    const hasCurrentStop = stationOptions.some((item) => item.toLowerCase() === stop.trim().toLowerCase());
    if (!hasCurrentStop) setStop(stationOptions[0]);
  }, [mode, selectedRoute, stationOptions, stop]);

  useEffect(() => {
    if (mode !== 'route') return;
    if (!dropoffOptions.length) {
      setDropoffStop('');
      return;
    }
    const hasCurrentDropoff = dropoffOptions.some((item) => item.toLowerCase() === dropoffStop.trim().toLowerCase());
    if (!hasCurrentDropoff) setDropoffStop(dropoffOptions[0]);
  }, [mode, dropoffOptions, dropoffStop]);

  const getCurrentSchedule = () => {
    const now = new Date();
    return {
      date: now.toISOString().slice(0, 10),
      departureTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    };
  };

  const runForecast = async () => {
    if (!token) return;
    if (mode === 'route' && (!routeId || !stop)) return;
    if (mode === 'journey' && (!origin.trim() || !destination.trim())) return;

    setLoading(true);
    setError('');
    setFeedbackMessage('');
    try {
      const schedule = getCurrentSchedule();
      const payload = mode === 'route' ? { routeId, stop, ...schedule } : { origin, destination, ...schedule };
      const result = await apiClient.getTripForecast(token, payload);
      setForecast(result);

      const crowdRouteId = mode === 'route' ? routeId : result.routeId;
      const crowdStop = mode === 'route' ? stop : (result.journey?.origin || origin);
      if (crowdRouteId && crowdStop) {
        const feed = await apiClient.getCrowdFeed(token, { routeId: crowdRouteId, stop: crowdStop, limit: 6 });
        setCrowdFeed(feed.reports);
      } else {
        setCrowdFeed([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate forecast');
    } finally {
      setLoading(false);
    }
  };

  const sendCrowdFeedback = async (crowded: boolean) => {
    const effectiveRouteId = mode === 'route' ? routeId : forecast?.routeId;
    const effectiveStop = mode === 'route' ? stop : (forecast?.journey?.origin || origin);
    if (!token || !effectiveRouteId || !effectiveStop) return;

    setFeedbackLoading(true);
    setFeedbackMessage('');
    try {
      const schedule = getCurrentSchedule();
      const result = await apiClient.submitCrowdReport(token, { routeId: effectiveRouteId, stop: effectiveStop, departureTime: schedule.departureTime, crowded });
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
      <CardHeader
        overline='Passenger'
        title='Trip planner'
        description='Choose direct route or origin-destination mode. AI compares 1-bus vs transfer options by crowding.'
        icon={<MapPinned className='h-5 w-5' />}
      />

      <div className='mb-4 flex flex-wrap gap-2'>
        <Button size='sm' variant={mode === 'journey' ? 'primary' : 'secondary'} onClick={() => setMode('journey')}>Hardan → Hara (AI)</Button>
        <Button size='sm' variant={mode === 'route' ? 'primary' : 'secondary'} onClick={() => setMode('route')}>Marşrut seçimi</Button>
      </div>

      {mode === 'route' ? (
        <div className='grid gap-3 md:grid-cols-3'>
          <div className='space-y-1'>
            <p className='text-overline'>Bus / Route</p>
            <select className='input-base' value={routeId} onChange={(e: any) => setRouteId(e.target.value)}>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>{route.code ? `${route.code} · ${route.name}` : route.name}</option>
              ))}
            </select>
          </div>

          <div className='space-y-1'>
            <p className='text-overline'>Boarding station (minəcəyin)</p>
            <select className='input-base' value={stop} onChange={(e: any) => setStop(e.target.value)} disabled={!routeId}>
              {stationOptions.length ? (
                stationOptions.map((station) => (
                  <option key={station} value={station}>{station}</option>
                ))
              ) : (
                <option value=''>No stations found</option>
              )}
            </select>
          </div>

          <div className='space-y-1'>
            <p className='text-overline'>Drop-off station (düşəcəyin)</p>
            <select className='input-base' value={dropoffStop} onChange={(e: any) => setDropoffStop(e.target.value)} disabled={!routeId || !stop || !dropoffOptions.length}>
              {dropoffOptions.length ? (
                dropoffOptions.map((station) => (
                  <option key={station} value={station}>{station}</option>
                ))
              ) : (
                <option value=''>No drop-off stations</option>
              )}
            </select>
          </div>
        </div>
      ) : (
        <div className='grid gap-3 md:grid-cols-2'>
          <div className='relative'>
            <input
              className='input-base'
              value={origin}
              onChange={(e: any) => setOrigin(e.target.value)}
              onFocus={() => setActiveSearchField('origin')}
              onBlur={() => setTimeout(() => setActiveSearchField((current) => (current === 'origin' ? null : current)), 120)}
              placeholder='Hardan (məs: Gənclik Mall)'
            />
            {activeSearchField === 'origin' && origin.trim() && originSuggestions.length ? (
              <div className='relative z-40 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[color:var(--border-strong)] bg-[color:color-mix(in_srgb,var(--bg-alt)_96%,black)] p-1 shadow-[var(--shadow-glow)]'>
                {originSuggestions.map((station) => (
                  <button
                    key={station}
                    type='button'
                    className='block w-full rounded-md bg-[var(--surface)] px-2 py-1.5 text-left text-sm text-[color:var(--text-soft)] hover:bg-[var(--surface-2)] hover:text-[color:var(--text)]'
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setOrigin(station);
                      setActiveSearchField(null);
                    }}
                  >
                    {station}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className='relative'>
            <input
              className='input-base'
              value={destination}
              onChange={(e: any) => setDestination(e.target.value)}
              onFocus={() => setActiveSearchField('destination')}
              onBlur={() => setTimeout(() => setActiveSearchField((current) => (current === 'destination' ? null : current)), 120)}
              placeholder='Hara (məs: TM 28 Mall)'
            />
            {activeSearchField === 'destination' && destination.trim() && destinationSuggestions.length ? (
              <div className='relative z-40 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[color:var(--border-strong)] bg-[color:color-mix(in_srgb,var(--bg-alt)_96%,black)] p-1 shadow-[var(--shadow-glow)]'>
                {destinationSuggestions.map((station) => (
                  <button
                    key={station}
                    type='button'
                    className='block w-full rounded-md bg-[var(--surface)] px-2 py-1.5 text-left text-sm text-[color:var(--text-soft)] hover:bg-[var(--surface-2)] hover:text-[color:var(--text)]'
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setDestination(station);
                      setActiveSearchField(null);
                    }}
                  >
                    {station}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {mode === 'route' && selectedRoute && stop && dropoffStop ? (
        <div className='mt-4'>
          <RouteMapPreview
            key={`${selectedRoute.id}:${stop}:${dropoffStop}`}
            from={stop}
            to={dropoffStop || selectedRoute.destination || selectedRoute.corridor || 'Destination'}
            routeName={selectedRoute.name}
          />
        </div>
      ) : null}

      <div className='mt-4'>
        <Button onClick={runForecast} loading={loading} leftIcon={<Sparkles className='h-4 w-4' />}>{mode === 'route' ? 'Analyze trip crowding' : 'AI marşrut analizi et'}</Button>
      </div>

      {error ? <p className='mt-3 text-sm text-[color:#fda4af]'>{error}</p> : null}

      {forecast ? (
        <div className='mt-6 grid gap-3 md:grid-cols-3'>
          {[
            { label: 'Predicted occupancy', value: `${forecast.predictedOccupancy}%` },
            { label: 'Crowd level', value: forecast.crowdLevel, capitalize: true },
            { label: 'Estimated easing', value: `${forecast.estimatedMinutesToEase} min` }
          ].map((s) => (
            <div key={s.label} className='rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4'>
              <p className='text-overline'>{s.label}</p>
              <p className={`numeric mt-2 text-2xl font-semibold tracking-tight ${s.capitalize ? 'capitalize' : ''}`}>{s.value}</p>
            </div>
          ))}

          <div className='md:col-span-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4'>
            <p className='text-overline'>AI insight</p>
            <p className='mt-2 text-sm leading-6'>{forecast.recommendation}</p>
            {mode === 'route' && selectedRoute ? <p className='mt-2 text-xs text-[color:var(--muted)]'>Route: {selectedRoute.name} · Boarding stop: {stop} · Date: {forecast.date} · Time: {forecast.departureTime} (now)</p> : null}
            {mode === 'journey' && forecast.journey ? <p className='mt-2 text-xs text-[color:var(--muted)]'>Journey: {forecast.journey.origin} → {forecast.journey.destination} · Date: {forecast.date} · Time: {forecast.departureTime} (now)</p> : null}
            {forecast.context?.note ? <p className='mt-2 text-xs text-[color:var(--text-soft)]'>{forecast.context.note}</p> : null}
          </div>

          {forecast.alternatives?.length ? (
            <div className='md:col-span-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4'>
              <p className='text-overline'>Alternative options</p>
              <div className='mt-3 grid gap-3 md:grid-cols-2'>
                {forecast.alternatives.map((option) => (
                  <div
                    key={option.id}
                    className={`rounded-lg border p-3 ${forecast.recommendedOptionId === option.id ? 'border-[color:var(--brand-secondary)] bg-[var(--surface-2)]' : 'border-[color:var(--border)] bg-[var(--bg-alt)]/30'}`}
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <p className='text-sm font-semibold'>{option.title}</p>
                      {forecast.recommendedOptionId === option.id ? <Badge tone='success' withDot>Recommended</Badge> : null}
                    </div>
                    <p className='mt-1 text-xs text-[color:var(--text-soft)]'>{option.summary}</p>
                    <div className='mt-3 grid grid-cols-3 gap-2'>
                      <div className='rounded-md border border-[color:var(--border)] px-2 py-1.5'>
                        <p className='text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]'>Transfers</p>
                        <p className='numeric mt-1 text-sm font-semibold'>{option.transferCount}</p>
                      </div>
                      <div className='rounded-md border border-[color:var(--border)] px-2 py-1.5'>
                        <p className='text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]'>Occupancy</p>
                        <p className='numeric mt-1 text-sm font-semibold'>{option.totalPredictedOccupancy}%</p>
                      </div>
                      <div className='rounded-md border border-[color:var(--border)] px-2 py-1.5'>
                        <p className='text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]'>Ease</p>
                        <p className='numeric mt-1 text-sm font-semibold'>{option.totalEstimatedMinutesToEase}m</p>
                      </div>
                    </div>
                    {option.interchange ? <p className='mt-2 text-xs text-[color:var(--muted)]'>Interchange: {option.interchange}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className='md:col-span-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-overline'>Community feedback</p>
                <p className='mt-2 text-sm font-medium'>Bu stansiya indi doludur?</p>
              </div>
              <Badge tone='neutral' withDot><Users className='h-3 w-3' /> Live</Badge>
            </div>
            <div className='mt-3 flex flex-wrap gap-2'>
              <Button variant='destructive' size='sm' loading={feedbackLoading} onClick={() => sendCrowdFeedback(true)} leftIcon={<ThumbsUp className='h-3.5 w-3.5' />}>Bəli, doludur</Button>
              <Button variant='outline' size='sm' loading={feedbackLoading} onClick={() => sendCrowdFeedback(false)} leftIcon={<ThumbsDown className='h-3.5 w-3.5' />}>Xeyr, normaldır</Button>
            </div>
            {feedbackMessage ? <p className='mt-2 text-xs text-[color:var(--muted)]'>{feedbackMessage}</p> : null}

            {forecast.community ? (
              <div className='mt-4 grid gap-3 md:grid-cols-3'>
                {[
                  { label: 'Reports in this hour', value: forecast.community.reportsInThisHour },
                  { label: 'Crowd probability', value: `${forecast.community.crowdProbability}%` },
                  { label: 'Habitually crowded', value: forecast.community.habitualCrowded ? 'Yes' : 'No' }
                ].map((s) => (
                  <div key={s.label} className='rounded-md border border-[color:var(--border)] bg-[var(--bg-alt)]/40 px-3 py-2'>
                    <p className='text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted)]'>{s.label}</p>
                    <p className='numeric mt-1 text-base font-semibold'>{s.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className='md:col-span-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4'>
            <p className='text-overline'>Community feed</p>
            {crowdFeed.length === 0 ? (
              <p className='mt-3 text-sm text-[color:var(--text-soft)]'>Hələ report yoxdur. İlk feedback-i sən ver.</p>
            ) : (
              <div className='mt-3 space-y-2'>
                {crowdFeed.map((item, index) => (
                  <div key={`${item.reportedAt}-${index}`} className='flex items-center justify-between rounded-md border border-[color:var(--border)] px-3 py-2 text-sm'>
                    <Badge tone={item.crowded ? 'danger' : 'success'} withDot>{item.crowded ? 'Crowded' : 'Normal'}</Badge>
                    <span className='text-xs text-[color:var(--muted)]'>{item.departureTime} · {new Date(item.reportedAt).toLocaleString()}</span>
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
