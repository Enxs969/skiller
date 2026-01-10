import { useState, useEffect } from "react";
import { Panel } from "./components/Panel";
import { Settings } from "./components/Settings";
import { useSettings } from "./hooks/useSettings";
import { Theme } from "./types";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSettings, loading: settingsLoading } = useSettings();

  useEffect(() => {
    const applyTheme = (theme: Theme, animate = true) => {
      const root = document.documentElement;
      
      if (animate) {
        root.classList.add('theme-transition');
      }
      
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      } else {
        root.classList.toggle('dark', theme === 'dark');
      }
      
      if (animate) {
        setTimeout(() => {
          root.classList.remove('theme-transition');
        }, 100);
      }
    };

    applyTheme(settings.theme);

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        document.documentElement.classList.add('theme-transition');
        document.documentElement.classList.toggle('dark', e.matches);
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
        }, 100);
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  if (settingsLoading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="app">
      {showSettings ? (
        <Settings
          settings={settings}
          onUpdate={updateSettings}
          onBack={() => setShowSettings(false)}
        />
      ) : (
        <Panel onOpenSettings={() => setShowSettings(true)} />
      )}
    </div>
  );
}

export default App;
