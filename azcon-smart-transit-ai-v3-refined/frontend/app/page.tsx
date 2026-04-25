'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, ShieldCheck, Waves } from 'lucide-react';
import { TopNav } from '@/components/layout/top-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/components/providers/app-provider';
import { TransitHeroScene } from '@/components/three/transit-hero-scene';

const features = [
  { title: 'Predictive flow intelligence', text: 'Forecast passenger density, occupancy and route delays before peak overload.', icon: BrainCircuit },
  { title: 'Operator command center', text: 'Give admin teams a unified view of routes, alerts, actions and smart resourcing.', icon: ShieldCheck },
  { title: 'Passenger-first recommendations', text: 'Offer lower-risk, lower-crowding route suggestions with AI-ready hooks.', icon: Waves }
];

export default function HomePage() {
  const { t } = useApp();

  return (
    <div>
      <TopNav />
      <section className='page-shell py-20'>
        <div className='grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className='inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-200'>{t.hero.badge}</span>
            <h1 className='mt-6 text-5xl font-semibold tracking-tight md:text-6xl'><span className='text-gradient'>{t.hero.title}</span></h1>
            <p className='mt-6 max-w-2xl text-lg leading-8 text-slate-300'>{t.hero.subtitle}</p>
            <div className='mt-8 flex flex-wrap gap-4'>
              <Link href='/register'><Button>{t.hero.ctaPrimary} <ArrowRight className='ml-2 h-4 w-4' /></Button></Link>
              <Link href='/dashboard'><Button className='bg-white/10 shadow-none'>{t.hero.ctaSecondary}</Button></Link>
            </div>
          </motion.div>
          <Card className='overflow-hidden p-0'>
            <TransitHeroScene />
          </Card>
        </div>
        <div className='mt-16 grid gap-6 md:grid-cols-3'>
          {features.map(({ title, text, icon: Icon }, idx) => (
            <motion.div key={title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 + 0.2 }}>
              <Card>
                <div className='w-fit rounded-2xl bg-white/5 p-3'><Icon className='h-5 w-5 text-sky-300' /></div>
                <h3 className='mt-4 text-xl font-semibold'>{title}</h3>
                <p className='mt-3 text-slate-300'>{text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
