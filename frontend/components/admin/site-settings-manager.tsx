'use client';

import { useState } from 'react';
import { Megaphone, Save, Settings2, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SiteSettings } from '@/lib/types';
import { apiClient } from '@/services/api-client';
import { useApp } from '@/components/providers/app-provider';

export function SiteSettingsManager({ initialSettings }: { initialSettings: SiteSettings | null }) {
  const { token } = useApp();
  const [settings, setSettings] = useState<SiteSettings>(
    initialSettings ?? {
      maintenanceMode: false,
      registrationOpen: true,
      aiDispatchEnabled: true,
      announcements: ['Smart transit mode is active.']
    }
  );
  const [announcementInput, setAnnouncementInput] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    setMessage('');
    try {
      const updated = await apiClient.updateSiteSettings(token, settings);
      setSettings(updated);
      setMessage('Site settings updated successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const addAnnouncement = () => {
    const value = announcementInput.trim();
    if (!value) return;
    if (settings.announcements.length >= 8) {
      setMessage('Maximum 8 announcements allowed.');
      return;
    }
    setSettings({ ...settings, announcements: [...settings.announcements, value] });
    setAnnouncementInput('');
  };

  const toggles: { key: keyof SiteSettings; label: string; description: string }[] = [
    { key: 'maintenanceMode', label: 'Maintenance mode', description: 'Display maintenance banner; restrict non-admin actions.' },
    { key: 'registrationOpen', label: 'User registration', description: 'Allow new accounts to sign up via the public register page.' },
    { key: 'aiDispatchEnabled', label: 'AI dispatch module', description: 'Enable AI-driven deployment recommendations on Staff panel.' }
  ];

  return (
    <Card>
      <CardHeader
        overline='Feature flags'
        title='Site feature controls'
        description='Enterprise-style toggles for global behaviour. Changes apply immediately on save.'
        icon={<Settings2 className='h-5 w-5' />}
      />

      <div className='space-y-2'>
        {toggles.map((tg) => {
          const on = Boolean(settings[tg.key]);
          return (
            <div
              key={tg.key as string}
              className='flex items-start justify-between gap-4 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[color:var(--border-strong)]'
            >
              <div className='min-w-0'>
                <div className='flex items-center gap-2'>
                  <p className='font-semibold'>{tg.label}</p>
                  <Badge tone={on ? 'success' : 'neutral'} withDot>{on ? 'Enabled' : 'Disabled'}</Badge>
                </div>
                <p className='mt-1 text-xs text-[color:var(--text-soft)]'>{tg.description}</p>
              </div>
              <button
                type='button'
                role='switch'
                aria-checked={on}
                aria-label={`Toggle ${tg.label}`}
                onClick={() => setSettings({ ...settings, [tg.key]: !on } as SiteSettings)}
                className='toggle shrink-0'
                data-on={on ? 'true' : 'false'}
              />
            </div>
          );
        })}
      </div>

      <div className='mt-6 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4'>
        <div className='flex items-center gap-2'>
          <Megaphone className='h-4 w-4 text-[color:var(--brand-secondary)]' />
          <p className='text-sm font-semibold'>Announcements</p>
          <span className='ml-auto text-xs text-[color:var(--muted)]'>{settings.announcements.length} / 8</span>
        </div>
        <div className='mt-3 flex gap-2'>
          <input
            className='input-base'
            value={announcementInput}
            onChange={(e: any) => setAnnouncementInput(e.target.value)}
            placeholder='Write a notice for users / staff'
          />
          <Button type='button' onClick={addAnnouncement} variant='secondary'>Add</Button>
        </div>

        {settings.announcements.length ? (
          <div className='mt-3 space-y-2'>
            {settings.announcements.map((item, index) => (
              <div key={`${item}-${index}`} className='flex items-center justify-between gap-3 rounded-md border border-[color:var(--border)] px-3 py-2 text-sm'>
                <span className='truncate'>{item}</span>
                <button
                  onClick={() => setSettings({ ...settings, announcements: settings.announcements.filter((_, i) => i !== index) })}
                  className='inline-flex items-center gap-1 text-xs text-[color:#fda4af] hover:text-[color:var(--danger)]'
                  aria-label='Remove announcement'
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className='mt-3 text-xs text-[color:var(--muted)]'>No active announcements.</p>
        )}
      </div>

      <div className='mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] pt-5'>
        {message ? (
          <span className='inline-flex items-center gap-2 text-xs text-[color:var(--text-soft)]'>
            <span className='dot bg-[color:var(--success)]' /> {message}
          </span>
        ) : <span />}
        <Button onClick={save} loading={saving} leftIcon={<Save className='h-4 w-4' />}>Save settings</Button>
      </div>
    </Card>
  );
}
