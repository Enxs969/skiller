import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Plugin } from '../types';
import { 
  fetchPluginsPaginated, 
  prefetchPluginsNextPage,
  clearPluginsCache,
  PLUGIN_PAGE_SIZE 
} from '../api/registry';

const SEARCH_DEBOUNCE_MS = 500;

export function usePlugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentQueryRef = useRef(searchQuery);
  const loadingRef = useRef(false);

  useEffect(() => {
    loadPlugins(true);
  }, []);

  useEffect(() => {
    currentQueryRef.current = searchQuery;
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      loadPlugins(true);
    }, SEARCH_DEBOUNCE_MS);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const loadPlugins = async (reset: boolean = false) => {
    if (loadingRef.current && !reset) return;
    
    const offset = reset ? 0 : plugins.length;
    
    if (reset) {
    setLoading(true);
      setPlugins([]);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    loadingRef.current = true;

    try {
      const query = currentQueryRef.current.trim() || undefined;
      const result = await fetchPluginsPaginated(offset, PLUGIN_PAGE_SIZE, query);
      
      if (result.items.length === 0 && result.hasMore && !reset) {
        setLoadingMore(false);
        loadingRef.current = false;
        return;
      }

      if (reset) {
        setPlugins(result.items);
      } else {
        setPlugins(prev => [...prev, ...result.items]);
      }
      setTotal(result.total);
      setHasMore(result.hasMore);

      if (result.hasMore) {
        const newOffset = reset ? result.items.length : offset + result.items.length;
        prefetchPluginsNextPage(newOffset, PLUGIN_PAGE_SIZE, query);
      }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plugins');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  };

  const loadMore = useCallback(() => {
    if (!loadingRef.current && !loadingMore && hasMore) {
      loadPlugins(false);
    }
  }, [loadingMore, hasMore, plugins.length, searchQuery]);

  const refresh = useCallback(async () => {
    clearPluginsCache();
    await loadPlugins(true);
  }, [searchQuery]);

  const filteredPlugins = useMemo(() =>
    categoryFilter
      ? plugins.filter(plugin => plugin.category === categoryFilter)
      : plugins,
    [plugins, categoryFilter]
  );

  const categories = useMemo(() =>
    [...new Set(plugins.map(p => p.category).filter(Boolean))],
    [plugins]
  );

  return {
    plugins: filteredPlugins,
    allPlugins: plugins,
    loading,
    loadingMore,
    error,
    refresh,
    loadMore,
    hasMore,
    total,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    categories,
  };
}
