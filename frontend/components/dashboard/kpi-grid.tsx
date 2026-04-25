import { motion } from 'framer-motion';
import { StatTile, StatTrend } from '@/components/ui/stat-tile';

function inferTrend(change: string): StatTrend {
  if (!change) return 'flat';
  if (/-|down|drop|decrease/i.test(change)) return 'down';
  if (/\+|up|gain|increase|↑/.test(change)) return 'up';
  return 'flat';
}

const accents: Array<'brand' | 'info' | 'success' | 'warning'> = ['brand', 'info', 'success', 'warning'];

export function KpiGrid({ items }: { items: Array<{ label: string; value: string; change: string }> }) {
  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {items.map((item, index) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
          <StatTile
            label={item.label}
            value={item.value}
            helper={item.change}
            trend={inferTrend(item.change)}
            accent={accents[index % accents.length]}
          />
        </motion.div>
      ))}
    </div>
  );
}
