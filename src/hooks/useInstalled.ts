import { useState, useEffect, useCallback } from 'react';
import { InstalledItem } from '../types';

const INSTALLED_KEY = 'skiller-installed';

export function useInstalled() {
  const [installed, setInstalled] = useState<InstalledItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstalled();
  }, []);

  const loadInstalled = async () => {
    try {
      if (window.__TAURI__) {
        const { load } = await import('@tauri-apps/plugin-store');
        const store = await load('installed.json');
        const saved = await store.get<InstalledItem[]>('installed');
        if (saved) {
          setInstalled(saved);
        }
      } else {
        const saved = localStorage.getItem(INSTALLED_KEY);
        if (saved) {
          setInstalled(JSON.parse(saved));
        }
      }
    } catch (error) {
      console.error('Failed to load installed items:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveInstalled = async (items: InstalledItem[]) => {
    try {
      if (window.__TAURI__) {
        const { load } = await import('@tauri-apps/plugin-store');
        const store = await load('installed.json');
        await store.set('installed', items);
        await store.save();
      } else {
        localStorage.setItem(INSTALLED_KEY, JSON.stringify(items));
      }
    } catch (error) {
      console.error('Failed to save installed items:', error);
    }
  };

  const addInstalled = useCallback(async (item: InstalledItem) => {
    const exists = installed.some(i => i.id === item.id && i.type === item.type);
    if (exists) return;

    const newInstalled = [...installed, item];
    setInstalled(newInstalled);
    await saveInstalled(newInstalled);
  }, [installed]);

  const removeInstalled = useCallback(async (id: string, type: 'plugin' | 'skill') => {
    const newInstalled = installed.filter(i => !(i.id === id && i.type === type));
    setInstalled(newInstalled);
    await saveInstalled(newInstalled);
  }, [installed]);

  const isInstalled = useCallback((id: string, type: 'plugin' | 'skill') => {
    return installed.some(i => i.id === id && i.type === type);
  }, [installed]);

  const getInstalledByName = useCallback((name: string) => {
    return installed.find(i => i.name.toLowerCase() === name.toLowerCase());
  }, [installed]);

  return {
    installed,
    loading,
    addInstalled,
    removeInstalled,
    isInstalled,
    getInstalledByName,
    refresh: loadInstalled,
  };
}
