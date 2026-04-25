'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
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
        <CardHeader overline='Roster' title='Team spotlight' description={`${sortedTeam.length} members on the public landing.`} />
        {sortedTeam.length === 0 ? (
          <div className='rounded-xl border border-dashed border-[color:var(--border-strong)] bg-[var(--surface)] p-6 text-center text-sm text-[color:var(--text-soft)]'>
            No team members yet. Add one on the right.
          </div>
        ) : (
          <div className='grid gap-3 md:grid-cols-2'>
            {sortedTeam.map((member) => (
              <div key={member.id} className='group rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[color:var(--border-strong)]'>
                <div className='flex items-center gap-3'>
                  <img src={member.image} alt={`${member.name} ${member.surname}`} className='h-12 w-12 rounded-xl object-cover ring-1 ring-[color:var(--border-strong)]' />
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold'>{member.name} {member.surname}</p>
                    <p className='truncate text-xs text-[color:var(--text-soft)]'>{member.role}</p>
                  </div>
                </div>
                <p className='mt-3 line-clamp-3 text-xs leading-5 text-[color:var(--text-soft)]'>{member.bio}</p>
                <button
                  className='mt-4 inline-flex items-center gap-1.5 rounded-md border border-[color:color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[var(--danger-soft)] px-2 py-1 text-[11px] font-semibold text-[color:#fda4af] hover:brightness-110'
                  onClick={() => deleteMember(member.id)}
                >
                  <Trash2 className='h-3 w-3' /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <CardHeader overline='CRUD' title='Add team member' icon={<UserPlus className='h-5 w-5' />} />
        <div className='space-y-3'>
          <input className='input-base' placeholder='First name' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className='input-base' placeholder='Surname' value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} />
          <input className='input-base' placeholder='Role' value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <input className='input-base' placeholder='Image URL' value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <textarea className='input-base min-h-28' placeholder='Bio' value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <Button className='w-full' onClick={createMember} leftIcon={<Plus className='h-4 w-4' />}>Save member</Button>
          {message ? <p className='inline-flex items-center gap-2 text-xs text-[color:var(--text-soft)]'><span className='dot bg-[color:var(--success)]' /> {message}</p> : null}
        </div>
      </Card>
    </div>
  );
}
