import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

export function KpiGrid({ items }: { items: Array<{ label: string; value: string; change: string }> }) {
  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {items.map((item, index) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
          <Card>
            <p className='text-sm text-slate-400'>{item.label}</p>
            <h3 className='mt-3 text-3xl font-semibold'>{item.value}</h3>
            <p className='mt-2 text-sm text-emerald-300'>{item.change}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
