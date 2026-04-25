import { BrainCircuit, Sparkles } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PredictionCardData } from '@/lib/types';

function scoreTone(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 70) return 'danger';
  if (score >= 40) return 'warning';
  return 'success';
}

export function InsightsPanel({ predictions, aiStatus }: { predictions: PredictionCardData[]; aiStatus?: { enabled: boolean; model: string } }) {
  return (
    <Card>
      <CardHeader
        overline='Decision intelligence'
        title='AI insights'
        description='Prepared for OpenRouter with safe mock fallback'
        icon={<Sparkles className='h-5 w-5' />}
        action={aiStatus ? <Badge tone={aiStatus.enabled ? 'success' : 'neutral'} withDot>{aiStatus.enabled ? aiStatus.model : 'mock'}</Badge> : null}
      />

      {aiStatus ? (
        <div className='mb-4 flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[color:var(--text-soft)]'>
          <BrainCircuit className='h-3.5 w-3.5 text-[color:var(--brand-secondary)]' />
          <span>AI mode: <strong className='text-[color:var(--text)]'>{aiStatus.enabled ? aiStatus.model : 'Mock fallback'}</strong></span>
        </div>
      ) : null}

      <div className='space-y-3'>
        {predictions.map((item) => {
          const tone = scoreTone(item.delayRiskScore);
          return (
            <div key={item.routeId} className='rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[color:var(--border-strong)]'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <h4 className='text-sm font-semibold'>Route <span className='text-[color:var(--text-soft)]'>{item.routeId}</span></h4>
                <Badge tone={tone} withDot>Delay {item.delayRiskScore}</Badge>
              </div>
              <div className='mt-3 grid gap-3 text-sm md:grid-cols-2'>
                <div className='flex items-baseline justify-between rounded-md border border-[color:var(--border)] bg-[var(--bg-alt)]/40 px-3 py-2'>
                  <span className='text-xs text-[color:var(--muted)]'>Passenger flow</span>
                  <span className='numeric font-semibold'>{item.passengerFlow}</span>
                </div>
                <div className='flex items-baseline justify-between rounded-md border border-[color:var(--border)] bg-[var(--bg-alt)]/40 px-3 py-2'>
                  <span className='text-xs text-[color:var(--muted)]'>Occupancy forecast</span>
                  <span className='numeric font-semibold'>{item.occupancyForecast}%</span>
                </div>
              </div>
              <p className='mt-3 text-xs leading-5 text-[color:var(--text-soft)]'>{item.recommendation}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
