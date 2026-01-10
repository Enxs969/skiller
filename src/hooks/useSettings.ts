import { useState, useEffect, useCallback } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types';

const SETTINGS_KEY = 'skiller-settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      let savedSettings: AppSettings | null = null;
      
      if (window.__TAURI__) {
        const { load } = await import('@tauri-apps/plugin-store');
        const store = await load('settings.json');
        const stored = await store.get<AppSettings>('settings');
        savedSettings = stored ?? null;
      } else {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
          savedSettings = JSON.parse(saved);
        }
      }

      if (savedSettings) {
        const mergedSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
        setSettings(mergedSettings);
        await applySettings(mergedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySettings = async (settings: AppSettings) => {
    if (!window.__TAURI__) return;
    
    const { invoke } = await import('@tauri-apps/api/core');
    
    if (settings.globalShortcut) {
      try {
        await invoke('register_shortcut', { shortcut: settings.globalShortcut });
      } catch (e) {
        console.error('Failed to register saved shortcut:', e);
      }
    }
    
    try {
      await invoke('set_dock_visible', { visible: settings.showInDock });
    } catch (e) {
      console.error('Failed to set dock visibility:', e);
    }
  };

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    try {
      if (window.__TAURI__) {
        const { load } = await import('@tauri-apps/plugin-store');
        const store = await load('settings.json');
        await store.set('settings', newSettings);
        await store.save();
      } else {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  return { settings, updateSettings, loading };
}
