'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  return (
    <Card>
      <h3 className='text-lg font-semibold'>Site feature controls</h3>
      <p className='mt-2 text-sm soft-text'>Developer/Admin panel for global site behaviour.</p>

      <div className='mt-5 space-y-3'>
        <label className='flex items-center justify-between rounded-2xl px-4 py-3' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
          <span>Maintenance mode</span>
          <input type='checkbox' checked={settings.maintenanceMode} onChange={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })} />
        </label>

        <label className='flex items-center justify-between rounded-2xl px-4 py-3' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
          <span>User registration open</span>
          <input type='checkbox' checked={settings.registrationOpen} onChange={() => setSettings({ ...settings, registrationOpen: !settings.registrationOpen })} />
        </label>

        <label className='flex items-center justify-between rounded-2xl px-4 py-3' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
          <span>AI dispatch module enabled</span>
          <input type='checkbox' checked={settings.aiDispatchEnabled} onChange={() => setSettings({ ...settings, aiDispatchEnabled: !settings.aiDispatchEnabled })} />
        </label>
      </div>

      <div className='mt-5 rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
        <p className='text-sm font-medium'>Announcements</p>
        <div className='mt-3 flex gap-2'>
          <input
            className='w-full rounded-xl px-3 py-2 outline-none'
            style={{ border: '1px solid var(--border)', background: 'transparent' }}
            value={announcementInput}
            onChange={(e: any) => setAnnouncementInput(e.target.value)}
            placeholder='Write notice for users/staff'
          />
          <Button type='button' onClick={addAnnouncement}>Add</Button>
        </div>

        <div className='mt-3 space-y-2'>
          {settings.announcements.map((item, index) => (
            <div key={`${item}-${index}`} className='flex items-center justify-between rounded-xl px-3 py-2 text-sm' style={{ border: '1px solid var(--border)' }}>
              <span>{item}</span>
              <button onClick={() => setSettings({ ...settings, announcements: settings.announcements.filter((_, i) => i !== index) })} className='text-rose-300'>Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className='mt-5 flex items-center gap-3'>
        <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</Button>
        {message ? <span className='text-sm soft-text'>{message}</span> : null}
      </div>
    </Card>
  );
}
