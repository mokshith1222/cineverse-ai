import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export type OTTStatus = 'Watching' | 'Completed' | 'Plan to Watch' | 'Dropped';

export interface OTTShow {
  id: string;
  user_id: string;
  title: string;
  platform: string;
  poster_url: string;
  status: OTTStatus;
  progress: number;
  total_episodes: number;
  genre: string[];
  created_at?: string;
}

interface OTTTrackerContextType {
  shows: OTTShow[];
  loading: boolean;
  addShow: (show: Omit<OTTShow, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateShow: (id: string, updates: Partial<OTTShow>) => Promise<void>;
  removeShow: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const OTTTrackerContext = createContext<OTTTrackerContextType | undefined>(undefined);

export const OTTTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shows, setShows] = useState<OTTShow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchShows = useCallback(async () => {
    if (!user) {
      setShows([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ott_tracker')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShows(data || []);
    } catch (err: any) {
      console.error('Error fetching OTT tracker:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  const addShow = async (showData: Omit<OTTShow, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) {
      showToast('Please log in to add shows to your tracker', 'info');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ott_tracker')
        .insert([{ ...showData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setShows((prev) => [data, ...prev]);
      showToast(`Added "${showData.title}" to tracker`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add show', 'error');
    }
  };

  const updateShow = async (id: string, updates: Partial<OTTShow>) => {
    try {
      const { error } = await supabase
        .from('ott_tracker')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setShows((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    } catch (err: any) {
      showToast(err.message || 'Failed to update show', 'error');
    }
  };

  const removeShow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ott_tracker')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setShows((prev) => prev.filter((s) => s.id !== id));
      showToast('Removed show from tracker', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove show', 'error');
    }
  };

  return (
    <OTTTrackerContext.Provider value={{ shows, loading, addShow, updateShow, removeShow, refresh: fetchShows }}>
      {children}
    </OTTTrackerContext.Provider>
  );
};

export const useOTTTracker = () => {
  const context = useContext(OTTTrackerContext);
  if (context === undefined) {
    throw new Error('useOTTTracker must be used within an OTTTrackerProvider');
  }
  return context;
};
