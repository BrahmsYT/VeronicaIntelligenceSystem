import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setCookie(name: string, value: string, days?: number) {
  const doc = (globalThis as any)?.document;
  if (!doc) return;

  if (typeof days === 'number') {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    doc.cookie = `${name}=${value}; expires=${expires}; path=/`;
    return;
  }

  doc.cookie = `${name}=${value}; path=/`;
}

export function removeCookie(name: string) {
  const doc = (globalThis as any)?.document;
  if (!doc) return;
  doc.cookie = `${name}=; Max-Age=0; path=/`;
}
