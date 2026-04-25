'use client';

function hashToUnit(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000;
}

function pointFromLabel(label: string, salt: string) {
  const x = 12 + hashToUnit(`${salt}:${label}:x`) * 76;
  const y = 12 + hashToUnit(`${salt}:${label}:y`) * 76;
  return { x, y };
}

export function RouteMapPreview({
  from,
  to,
  routeName,
  routeId
}: {
  from: string;
  to: string;
  routeName: string;
  routeId: string;
}) {
  const safeFrom = from.trim() || 'Current location';
  const safeTo = to.trim() || 'Destination';

  const start = pointFromLabel(safeFrom, routeId || routeName || 'route');
  const end = pointFromLabel(safeTo, routeName || routeId || 'route');
  const control = {
    x: (start.x + end.x) / 2 + (start.y > end.y ? -9 : 9),
    y: (start.y + end.y) / 2 - (start.x > end.x ? 8 : -8)
  };

  return (
    <div className='rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
      <p className='text-xs uppercase tracking-[0.2em] soft-text'>Route map preview</p>
      <p className='mt-2 text-sm'>Sən <span className='font-semibold text-white'>{safeFrom}</span> nöqtəsindən <span className='font-semibold text-white'>{safeTo}</span> istiqamətinə gedirsən.</p>

      <div className='mt-3 overflow-hidden rounded-xl' style={{ border: '1px solid var(--border)', background: 'linear-gradient(180deg,#0b1324,#111827)' }}>
        <svg viewBox='0 0 100 100' className='h-48 w-full'>
          <defs>
            <pattern id='map-grid' width='10' height='10' patternUnits='userSpaceOnUse'>
              <path d='M 10 0 L 0 0 0 10' fill='none' stroke='rgba(148,163,184,0.18)' strokeWidth='0.4' />
            </pattern>
            <linearGradient id='route-line' x1='0' y1='0' x2='1' y2='1'>
              <stop offset='0%' stopColor='#38bdf8' />
              <stop offset='100%' stopColor='#22d3ee' />
            </linearGradient>
            <marker id='route-arrow' markerWidth='8' markerHeight='8' refX='4' refY='4' orient='auto'>
              <path d='M 0 0 L 8 4 L 0 8 z' fill='#67e8f9' />
            </marker>
          </defs>

          <rect width='100' height='100' fill='url(#map-grid)' />

          <path
            d={`M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`}
            fill='none'
            stroke='url(#route-line)'
            strokeWidth='2.3'
            strokeLinecap='round'
            markerEnd='url(#route-arrow)'
          />

          <circle cx={start.x} cy={start.y} r='3.3' fill='#22c55e' />
          <circle cx={end.x} cy={end.y} r='3.3' fill='#f97316' />

          <text x={start.x + 2.8} y={start.y - 3.2} fontSize='3.2' fill='#86efac'>Start</text>
          <text x={end.x + 2.8} y={end.y - 3.2} fontSize='3.2' fill='#fdba74'>Destination</text>
        </svg>
      </div>

      <p className='mt-3 text-xs soft-text'>Route: {routeName}</p>
    </div>
  );
}
