import { useState } from 'react';
import { InstalledItem, CLIENT_LABELS } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { executeInTerminal } from '../utils/terminal';
import { useSettings } from '../hooks/useSettings';
import './InstalledList.css';

interface InstalledListProps {
  installed: InstalledItem[];
  loading: boolean;
  onRemove: (id: string, type: 'plugin' | 'skill') => void;
}

export function InstalledList({ installed, loading, onRemove }: InstalledListProps) {
  const { settings } = useSettings();
  const [uninstallItem, setUninstallItem] = useState<InstalledItem | null>(null);
  const [uninstalling, setUninstalling] = useState(false);

  const handleUninstall = async () => {
    if (!uninstallItem) return;

    setUninstalling(true);
    try {
      const terminal = settings.defaultTerminal || undefined;
      
      if (uninstallItem.type === 'plugin') {
        const command = `npx claude-plugins disable ${uninstallItem.name}`;
        await executeInTerminal(command, terminal);
      } else {
        const skillPath = uninstallItem.skillType === 'personal' 
          ? `~/.claude/skills/${uninstallItem.name}`
          : `./.claude/skills/${uninstallItem.name}`;
        
        const command = `rm -rf ${skillPath} && echo "Skill '${uninstallItem.name}' has been removed from ${skillPath}"`;
        await executeInTerminal(command, terminal);
      }

      onRemove(uninstallItem.id, uninstallItem.type);
    } catch (error) {
      console.error('Uninstall failed:', error);
    } finally {
      setUninstalling(false);
      setUninstallItem(null);
    }
  };

  const getUninstallMessage = (item: InstalledItem) => {
    if (item.type === 'plugin') {
      return `This will disable the plugin "${item.name}" by running:`;
    } else {
      return `This will delete the skill folder:`;
    }
  };

  const getUninstallCommand = (item: InstalledItem) => {
    if (item.type === 'plugin') {
      return `npx claude-plugins disable ${item.name}`;
    } else {
      const skillPath = item.skillType === 'personal' 
        ? `~/.claude/skills/${item.name}`
        : `./.claude/skills/${item.name}`;
      return `rm -rf ${skillPath}`;
    }
  };

  if (loading) {
    return (
      <div className="panel-loading">
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    );
  }

  if (installed.length === 0) {
    return (
      <div className="installed-empty">
        No installed items yet
      </div>
    );
  }

  const plugins = installed.filter(i => i.type === 'plugin');
  const skills = installed.filter(i => i.type === 'skill');

  return (
    <>
      <div className="installed-list">
        {plugins.length > 0 && (
          <div className="installed-section">
            <h3 className="installed-section-title">Plugins ({plugins.length})</h3>
            {plugins.map(item => (
              <InstalledCard 
                key={`${item.type}-${item.id}`} 
                item={item} 
                onUninstall={() => setUninstallItem(item)} 
              />
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div className="installed-section">
            <h3 className="installed-section-title">Skills ({skills.length})</h3>
            {skills.map(item => (
              <InstalledCard 
                key={`${item.type}-${item.id}`} 
                item={item} 
                onUninstall={() => setUninstallItem(item)} 
              />
            ))}
          </div>
        )}
      </div>

      {uninstallItem && (
        <ConfirmDialog
          title={`Uninstall ${uninstallItem.type === 'plugin' ? 'Plugin' : 'Skill'}`}
          message={getUninstallMessage(uninstallItem)}
          detail={
            <div className="uninstall-details">
              <code className="confirm-command">{getUninstallCommand(uninstallItem)}</code>
              <p className="uninstall-warning">
                {uninstallItem.type === 'plugin' 
                  ? 'The plugin will be disabled but can be re-enabled later.'
                  : 'This action cannot be undone. The skill files will be permanently deleted.'}
              </p>
            </div>
          }
          confirmText={uninstalling ? 'Uninstalling...' : 'Uninstall'}
          cancelText="Cancel"
          onConfirm={handleUninstall}
          onCancel={() => setUninstallItem(null)}
          loading={uninstalling}
        />
      )}
    </>
  );
}

function InstalledCard({ item, onUninstall }: { item: InstalledItem; onUninstall: () => void }) {
  const formattedDate = new Date(item.installedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="installed-card">
      <div className="installed-card-info">
        <div className="installed-card-name">{item.name}</div>
        <div className="installed-card-meta">
          <span className={`installed-card-type installed-card-type-${item.type}`}>
            {item.type}
          </span>
          {item.client && (
            <span className="installed-card-client">
              {CLIENT_LABELS[item.client]}
            </span>
          )}
          {item.skillType && (
            <span className="installed-card-skill-type">
              {item.skillType === 'personal' ? 'Global' : 'Local'}
            </span>
          )}
          <span className="installed-card-date">{formattedDate}</span>
        </div>
      </div>
      <button
        className="btn btn-ghost btn-sm installed-card-remove"
        onClick={onUninstall}
        title="Uninstall"
      >
        <RemoveIcon />
      </button>
    </div>
  );
}

function RemoveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l6 6M10 4l-6 6" />
    </svg>
  );
}
