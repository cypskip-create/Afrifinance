import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  created_at: string;
}

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWatchlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching watchlist:', error);
      } else {
        setWatchlist(data || []);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (symbol: string, name: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('watchlists')
        .insert({
          symbol,
          name,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { error: { message: 'Stock already in watchlist' } };
        }
        console.error('Error adding to watchlist:', error);
        return { error };
      }

      setWatchlist(prev => [data, ...prev]);
      return { data };
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return { error };
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('symbol', symbol)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing from watchlist:', error);
        return { error };
      }

      setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
      return { success: true };
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return { error };
    }
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol);
  };

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refetch: fetchWatchlist,
  };
}