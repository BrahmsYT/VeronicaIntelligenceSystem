'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, ShieldCheck, Waves } from 'lucide-react';
import { TopNav } from '@/components/layout/top-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/components/providers/app-provider';
import { TransitHeroScene } from '@/components/three/transit-hero-scene';
import { apiClient } from '@/services/api-client';

const features = [
  { title: 'Predictive flow intelligence', text: 'Forecast passenger density, occupancy and route delays before peak overload.', icon: BrainCircuit },
  { title: 'Operator command center', text: 'Give admin teams a unified view of routes, alerts, actions and smart resourcing.', icon: ShieldCheck },
  { title: 'Passenger-first recommendations', text: 'Offer lower-risk, lower-crowding route suggestions with AI-ready hooks.', icon: Waves }
];

export default function HomePage() {
  const { t } = useApp();
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => { apiClient.getPublicOverview().then(setOverview).catch(() => undefined); }, []);

  return (
    <div>
      <TopNav />
      <section className='page-shell py-20'>
        <div className='grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className='inline-flex rounded-full px-4 py-2 text-sm' style={{ border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--brand-to)' }}>{t.hero.badge}</span>
            <h1 className='mt-6 text-5xl font-semibold tracking-tight md:text-6xl'><span className='text-gradient'>{t.hero.title}</span></h1>
            <p className='mt-6 max-w-2xl text-lg leading-8 soft-text'>{t.hero.subtitle}</p>
            <div className='mt-8 flex flex-wrap gap-4'>
              <Link href='/register'><Button>{t.hero.ctaPrimary} <ArrowRight className='ml-2 h-4 w-4' /></Button></Link>
              <Link href='/dashboard'><Button className='bg-white/10 shadow-none'>{t.hero.ctaSecondary}</Button></Link>
            </div>
            {overview ? <div className='mt-8 grid gap-4 md:grid-cols-3'>{[
              { label: 'Managed entities', value: overview.analytics?.overview?.managedEntities },
              { label: 'Employees', value: `${overview.analytics?.overview?.employees}+` },
              { label: 'Live routes', value: overview.routes?.length }
            ].map((item) => <div key={item.label} className='rounded-3xl p-4 panel-strong' style={{ border: '1px solid var(--border)' }}><p className='text-sm soft-text'>{item.label}</p><p className='mt-2 text-2xl font-semibold'>{item.value}</p></div>)}</div> : null}
          </motion.div>
          <Card className='overflow-hidden p-0'><TransitHeroScene /></Card>
        </div>
        <div className='mt-16 grid gap-6 md:grid-cols-3'>
          {features.map(({ title, text, icon: Icon }, idx) => (
            <motion.div key={title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 + 0.2 }}>
              <Card>
                <div className='w-fit rounded-2xl p-3' style={{ background: 'var(--panel-strong)' }}><Icon className='h-5 w-5' style={{ color: 'var(--brand-to)' }} /></div>
                <h3 className='mt-4 text-xl font-semibold'>{title}</h3>
                <p className='mt-3 soft-text'>{text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
        {overview?.team?.length ? <div className='mt-16'><div className='mb-6'><h2 className='text-3xl font-semibold'>Core transit AI team</h2><p className='mt-2 soft-text'>Managed from admin CRUD and shown here on the main experience.</p></div><div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>{overview.team.map((member: any) => <Card key={member.id}><div className='flex items-center gap-4'><img src={member.image} alt={member.name} className='h-16 w-16 rounded-2xl object-cover' /><div><h3 className='text-lg font-semibold'>{member.name} {member.surname}</h3><p className='text-sm soft-text'>{member.role}</p></div></div><p className='mt-4 soft-text'>{member.bio}</p></Card>)}</div></div> : null}
      </section>
    </div>
  );
}
