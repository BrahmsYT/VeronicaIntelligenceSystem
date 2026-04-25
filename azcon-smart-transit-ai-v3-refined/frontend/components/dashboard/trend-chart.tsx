'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';

export function TrendChart({ title, data, dataKey }: { title: string; data: Array<Record<string, string | number>>; dataKey: string }) {
  return (
    <Card>
      <div className='mb-5 flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>{title}</h3>
          <p className='text-sm text-slate-400'>Operational trend over recent intervals</p>
        </div>
      </div>
      <div className='h-72'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={data}>
            <defs>
              <linearGradient id='trend' x1='0' x2='0' y1='0' y2='1'>
                <stop offset='5%' stopColor='#60a5fa' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#60a5fa' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke='rgba(148,163,184,0.12)' vertical={false} />
            <XAxis dataKey='name' stroke='#94a3b8' />
            <YAxis stroke='#94a3b8' />
            <Tooltip contentStyle={{ background: '#081223', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
            <Area type='monotone' dataKey={dataKey} stroke='#60a5fa' fill='url(#trend)' strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
