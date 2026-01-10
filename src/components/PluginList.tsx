import { useState, useEffect, useRef, useCallback } from 'react';
import { Plugin, InstalledItem } from '../types';
import { Card } from './Card';
import { ConfirmDialog } from './ConfirmDialog';
import { executeInTerminal } from '../utils/terminal';
import { useSettings } from '../hooks/useSettings';

interface PluginListProps {
  plugins: Plugin[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  isInstalled: (id: string, type: 'plugin' | 'skill') => boolean;
  onInstalled: (item: InstalledItem) => void;
  onRefresh: () => void;
  onLoadMore: () => void;
}

export function PluginList({ 
  plugins, 
  loading, 
  loadingMore,
  error, 
  hasMore,
  total,
  isInstalled, 
  onInstalled, 
  onRefresh,
  onLoadMore 
}: PluginListProps) {
  const { settings } = useSettings();
  const [confirmPlugin, setConfirmPlugin] = useState<Plugin | null>(null);
  const [installing, setInstalling] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    }, { threshold: 0.1 });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, loadingMore, hasMore, onLoadMore]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleInstall = async (plugin: Plugin) => {
    setInstalling(true);
    try {
      await executeInTerminal(plugin.installCommand, settings.defaultTerminal || undefined);
      onInstalled({
        id: plugin.id,
        type: 'plugin',
        name: plugin.name,
        installedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setInstalling(false);
      setConfirmPlugin(null);
    }
  };

  if (loading && plugins.length === 0) {
    return (
      <div className="panel-loading">
        <div className="spinner" />
        <span>Loading plugins...</span>
      </div>
    );
  }

  if (error && plugins.length === 0) {
    return (
      <div className="panel-error">
        <div className="panel-error-message">{error}</div>
        <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
          Retry
        </button>
      </div>
    );
  }

  const filteredPlugins = plugins.filter(plugin => !isInstalled(plugin.id, 'plugin'));

  if (!loading && filteredPlugins.length === 0 && plugins.length === 0) {
    return (
      <div className="panel-empty">
        <div className="panel-empty-icon">📦</div>
        <div>No plugins found</div>
      </div>
    );
  }

  if (!loading && filteredPlugins.length === 0 && plugins.length > 0) {
    return (
      <div className="panel-empty">
        <div className="panel-empty-icon">✅</div>
        <div>All plugins are installed</div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="panel-error-offline">
          <span>⚠️</span>
          {error}
        </div>
      )}
      
      {total > 0 && (
        <div className="list-stats">
          Showing {filteredPlugins.length} of {total.toLocaleString()} plugins
        </div>
      )}
      
      <div className="card-list">
        {filteredPlugins.map((plugin, index) => (
          <div 
            key={plugin.id}
            ref={index === filteredPlugins.length - 1 ? lastItemRef : null}
          >
            <Card
            name={plugin.name}
            description={plugin.description}
            downloads={plugin.downloads}
            stars={plugin.stars}
            tags={plugin.tags}
            isInstalled={false}
            actions={
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setConfirmPlugin(plugin)}
              >
                Install
              </button>
            }
          />
          </div>
        ))}
      </div>

      {loadingMore && (
        <div className="loading-more">
          <div className="spinner spinner-sm" />
          <span>Loading more...</span>
        </div>
      )}

      {!hasMore && plugins.length > 0 && (
        <div className="end-of-list">
          — End of list —
        </div>
      )}

      {confirmPlugin && (
        <ConfirmDialog
          title="Install Plugin"
          message={`Are you sure you want to install "${confirmPlugin.name}"?`}
          detail={
            <code className="confirm-command">{confirmPlugin.installCommand}</code>
          }
          copyCommand={confirmPlugin.installCommand}
          confirmText={installing ? 'Installing...' : 'Install'}
          onConfirm={() => handleInstall(confirmPlugin)}
          onCancel={() => setConfirmPlugin(null)}
          loading={installing}
        />
      )}
    </>
  );
}
