import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PredictionCardData } from '@/lib/types';

export function InsightsPanel({ predictions }: { predictions: PredictionCardData[] }) {
  return (
    <Card>
      <div className='mb-4 flex items-center gap-3'>
        <div className='rounded-2xl bg-sky-500/10 p-2 text-sky-300'><Sparkles className='h-5 w-5' /></div>
        <div>
          <h3 className='text-lg font-semibold'>Mock AI insights</h3>
          <p className='text-sm text-slate-400'>Prepared for future OpenRouter decision intelligence</p>
        </div>
      </div>
      <div className='space-y-4'>
        {predictions.map((item) => (
          <div key={item.routeId} className='rounded-2xl border border-white/10 bg-white/5 p-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <h4 className='font-medium'>Route {item.routeId}</h4>
              <span className='text-xs text-slate-400'>Delay score: {item.delayRiskScore}</span>
            </div>
            <p className='mt-3 text-sm text-slate-300'>{item.recommendation}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
