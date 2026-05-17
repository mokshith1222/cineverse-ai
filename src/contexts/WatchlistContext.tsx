import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export type ItemType = 'movie' | 'anime' | 'tv';

export interface WatchlistItem {
  id?: string;
  user_id: string;
  item_id: string;
  title: string;
  poster_url: string;
  item_type: ItemType;
  created_at?: string;
}

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  loading: boolean;
  addToWatchlist: (item: Omit<WatchlistItem, 'user_id'>) => Promise<void>;
  removeFromWatchlist: (itemId: string, itemType: ItemType) => Promise<void>;
  isInWatchlist: (itemId: string, itemType: ItemType) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error: any) {
      console.error('Error fetching watchlist:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (item: Omit<WatchlistItem, 'user_id'>) => {
    if (!user) {
      showToast('Please login to add to watchlist', 'info');
      return;
    }

    try {
      const newItem = { ...item, user_id: user.id };
      const { error } = await supabase.from('watchlist').insert([newItem]);

      if (error) {
        if (error.code === '23505') {
          showToast('Item already in watchlist', 'info');
          return;
        }
        throw error;
      }

      setWatchlist((prev) => [newItem as WatchlistItem, ...prev]);
      showToast(`${item.title} added to watchlist`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to add to watchlist', 'error');
    }
  };

  const removeFromWatchlist = async (itemId: string, itemType: ItemType) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType);

      if (error) throw error;

      setWatchlist((prev) => prev.filter((i) => !(i.item_id === itemId && i.item_type === itemType)));
      showToast('Removed from watchlist', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to remove from watchlist', 'error');
    }
  };

  const isInWatchlist = (itemId: string, itemType: ItemType) => {
    return watchlist.some((i) => i.item_id === itemId && i.item_type === itemType);
  };

  return (
    <WatchlistContext.Provider
      value={{ watchlist, loading, addToWatchlist, removeFromWatchlist, isInWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
