'use client';

import { Activity } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function TrendChart({ title, data, dataKey }: { title: string; data: Array<Record<string, string | number>>; dataKey: string }) {
  return (
    <Card>
      <CardHeader
        overline='Live operations'
        title={title}
        description='Operational trend over recent intervals'
        icon={<Activity className='h-5 w-5' />}
        action={<Badge tone='info' withDot>Realtime</Badge>}
      />
      <div className='h-72 -mx-2'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id='trend' x1='0' x2='0' y1='0' y2='1'>
                <stop offset='0%' stopColor='var(--brand-secondary)' stopOpacity={0.55} />
                <stop offset='100%' stopColor='var(--brand-secondary)' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke='var(--border)' vertical={false} strokeDasharray='3 6' />
            <XAxis dataKey='name' stroke='var(--muted)' tickLine={false} axisLine={false} fontSize={11} />
            <YAxis stroke='var(--muted)' tickLine={false} axisLine={false} fontSize={11} width={36} />
            <Tooltip
              cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
              contentStyle={{ background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-md)', color: 'var(--text)', fontSize: 12 }}
              labelStyle={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}
            />
            <Area type='monotone' dataKey={dataKey} stroke='var(--brand-secondary)' fill='url(#trend)' strokeWidth={2.4} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--brand-secondary)' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
