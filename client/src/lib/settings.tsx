import { createContext, useContext, type ReactNode } from 'react';
import type { SiteSettings } from '../types';
import { useFetch } from './useFetch';

export const DEFAULT_CONTACT: SiteSettings['contact'] = {
  phone: '+44 7454 720895',
  whatsapp: '447454720895',
  email: 'pulciniluciana@gmail.com',
  addressLines: ['210/212 Southwark Park Road', 'London', 'SE16 3RX'],
  instagram: 'luciana_soul',
};

interface SettingsState {
  settings: SiteSettings | null;
  contact: SiteSettings['contact'];
  loading: boolean;
}

const SettingsContext = createContext<SettingsState>({ settings: null, contact: DEFAULT_CONTACT, loading: true });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data, loading } = useFetch<SiteSettings>('/settings');
  const contact = { ...DEFAULT_CONTACT, ...(data?.contact ?? {}) };
  return <SettingsContext.Provider value={{ settings: data, contact, loading }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);

export function instagramUrl(handle: string) {
  return `https://www.instagram.com/${handle.replace(/^@/, '')}/`;
}
