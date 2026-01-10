import { TabType } from '../types';
import './TabBar.css';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  installedCount: number;
}

export function TabBar({ activeTab, onTabChange, installedCount }: TabBarProps) {
  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'plugins', label: 'Plugins' },
    { id: 'skills', label: 'Skills' },
    { id: 'installed', label: 'Installed', count: installedCount },
  ];

  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  return (
    <nav className="tab-bar">
      <div className="tab-bar-inner">
        <div 
          className="tab-indicator" 
          style={{ 
            left: `calc(${activeIndex * 100 / tabs.length}% + 3px)`,
            width: `calc(${100 / tabs.length}% - 6px)`
          }} 
        />
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="tab-badge">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
