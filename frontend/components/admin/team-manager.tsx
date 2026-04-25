'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TeamMember } from '@/lib/types';
import { apiClient } from '@/services/api-client';
import { useApp } from '@/components/providers/app-provider';

export function TeamManager({ team }: { team: TeamMember[] }) {
  const { token } = useApp();
  const [form, setForm] = useState({ name: '', surname: '', role: '', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', bio: '' });
  const [message, setMessage] = useState('');
  const sortedTeam = useMemo(() => [...team].sort((a, b) => a.name.localeCompare(b.name)), [team]);

  const createMember = async () => {
    if (!token) return;
    await apiClient.createTeamMember(token, form);
    setMessage('Team member saved to db.json. Refresh to view the latest card set.');
    setForm({ name: '', surname: '', role: '', image: form.image, bio: '' });
  };

  const deleteMember = async (id: string) => {
    if (!token) return;
    await apiClient.deleteTeamMember(token, id);
    setMessage('Team member deleted. Refresh to sync the workspace.');
  };

  return (
    <div className='grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
      <Card>
        <h3 className='text-lg font-semibold'>Team spotlight</h3>
        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          {sortedTeam.map((member) => (
            <div key={member.id} className='rounded-3xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
              <div className='flex items-center gap-3'>
                <img src={member.image} alt={`${member.name} ${member.surname}`} className='h-14 w-14 rounded-2xl object-cover' />
                <div>
                  <p className='font-medium'>{member.name} {member.surname}</p>
                  <p className='text-sm soft-text'>{member.role}</p>
                </div>
              </div>
              <p className='mt-3 text-sm soft-text'>{member.bio}</p>
              <button className='mt-4 rounded-xl px-3 py-2 text-xs text-rose-300' style={{ border: '1px solid rgba(244,63,94,.24)' }} onClick={() => deleteMember(member.id)}>Delete</button>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className='text-lg font-semibold'>Add team member</h3>
        <div className='mt-4 space-y-4'>
          <input className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} placeholder='First name' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} placeholder='Surname' value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} />
          <input className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} placeholder='Role' value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <input className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} placeholder='Image URL' value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <textarea className='min-h-28 w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} placeholder='Bio' value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <Button className='w-full' onClick={createMember}>Save member</Button>
          {message ? <p className='text-sm text-emerald-300'>{message}</p> : null}
        </div>
      </Card>
    </div>
  );
}
