'use client';

export function RouteMapPreview({
  from,
  to,
  routeName
}: {
  from: string;
  to: string;
  routeName: string;
}) {
  const safeFrom = from.trim() || 'Current location';
  const safeTo = to.trim() || 'Destination';
  const combinedQuery = encodeURIComponent(`${safeFrom} ${safeTo} Baku`);
  const fromQuery = encodeURIComponent(`${safeFrom} Baku`);
  const toQuery = encodeURIComponent(`${safeTo} Baku`);
  const routePlannerFrom = encodeURIComponent(`${safeFrom}, Baku`);
  const routePlannerTo = encodeURIComponent(`${safeTo}, Baku`);
  const routePlannerLink = `https://2gis.az/baku/routeSearch/rsType/bus/from/${routePlannerFrom}/to/${routePlannerTo}`;
  const directionsHomeLink = 'https://2gis.az/baku/directions';
  const routeLink = `https://2gis.az/baku/search/${combinedQuery}`;
  const fromLink = `https://2gis.az/baku/search/${fromQuery}`;
  const toLink = `https://2gis.az/baku/search/${toQuery}`;

  return (
    <div className='rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
      <p className='text-xs uppercase tracking-[0.2em] soft-text'>2GIS route links</p>
      <p className='mt-2 text-sm'>2GIS marşrut ekranı üçün <span className='font-semibold text-white'>Hardan: {safeFrom}</span> və <span className='font-semibold text-white'>Haraya: {safeTo}</span> ilə link hazırlanır.</p>

      <div className='mt-4 flex flex-wrap gap-2'>
        <a href={routePlannerLink} target='_blank' rel='noreferrer' className='rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--surface-2)]'>
          2GIS-də A→B-ni doldur və aç
        </a>
        <a href={directionsHomeLink} target='_blank' rel='noreferrer' className='rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[color:var(--text-soft)] hover:bg-[var(--surface-2)] hover:text-white'>
          Əgər dolmazsa: directions aç
        </a>
        <a href={routeLink} target='_blank' rel='noreferrer' className='rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[color:var(--text-soft)] hover:bg-[var(--surface-2)] hover:text-white'>
          Əgər açılmazsa: ümumi axtarış
        </a>
        <a href={fromLink} target='_blank' rel='noreferrer' className='rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[color:var(--text-soft)] hover:bg-[var(--surface-2)] hover:text-white'>
          Minəcəyin yeri aç
        </a>
        <a href={toLink} target='_blank' rel='noreferrer' className='rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[color:var(--text-soft)] hover:bg-[var(--surface-2)] hover:text-white'>
          Düşəcəyin yeri aç
        </a>
      </div>

      <p className='mt-3 text-xs soft-text'>Route: {routeName}</p>
    </div>
  );
}
