import { BrainCircuit, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PredictionCardData } from '@/lib/types';

export function InsightsPanel({ predictions, aiStatus }: { predictions: PredictionCardData[]; aiStatus?: { enabled: boolean; model: string } }) {
  return (
    <Card>
      <div className='mb-4 flex items-center gap-3'>
        <div className='rounded-2xl p-2' style={{ background: 'color-mix(in srgb, var(--brand-to) 14%, transparent)', color: 'var(--brand-to)' }}><Sparkles className='h-5 w-5' /></div>
        <div>
          <h3 className='text-lg font-semibold'>AI insights</h3>
          <p className='text-sm soft-text'>Prepared for OpenRouter decision intelligence with safe mock fallback</p>
        </div>
      </div>
      {aiStatus ? <div className='mb-4 flex items-center gap-2 rounded-2xl p-3 text-sm panel-strong' style={{ border: '1px solid var(--border)' }}><BrainCircuit className='h-4 w-4' /> AI mode: <strong>{aiStatus.enabled ? aiStatus.model : 'mock fallback'}</strong></div> : null}
      <div className='space-y-4'>
        {predictions.map((item) => (
          <div key={item.routeId} className='rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <h4 className='font-medium'>Route {item.routeId}</h4>
              <span className='text-xs soft-text'>Delay score: {item.delayRiskScore}</span>
            </div>
            <div className='mt-3 grid gap-2 text-sm md:grid-cols-2'>
              <div>Passenger flow: <strong>{item.passengerFlow}</strong></div>
              <div>Occupancy forecast: <strong>{item.occupancyForecast}%</strong></div>
            </div>
            <p className='mt-3 text-sm soft-text'>{item.recommendation}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
