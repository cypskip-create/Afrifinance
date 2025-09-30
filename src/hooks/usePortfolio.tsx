import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PortfolioHolding {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  shares: number;
  avg_cost: number;
  sector: string | null;
  created_at: string;
  updated_at: string;
}

export function usePortfolio() {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHoldings();
    } else {
      setHoldings([]);
      setLoading(false);
    }
  }, [user]);

  const fetchHoldings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching portfolio:', error);
      } else {
        setHoldings(data || []);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHolding = async (holding: Omit<PortfolioHolding, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          ...holding,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding holding:', error);
        return { error };
      }

      setHoldings(prev => [data, ...prev]);
      return { data };
    } catch (error) {
      console.error('Error adding holding:', error);
      return { error };
    }
  };

  const updateHolding = async (id: string, updates: Partial<PortfolioHolding>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating holding:', error);
        return { error };
      }

      setHoldings(prev => prev.map(h => h.id === id ? data : h));
      return { data };
    } catch (error) {
      console.error('Error updating holding:', error);
      return { error };
    }
  };

  const deleteHolding = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting holding:', error);
        return { error };
      }

      setHoldings(prev => prev.filter(h => h.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting holding:', error);
      return { error };
    }
  };

  return {
    holdings,
    loading,
    addHolding,
    updateHolding,
    deleteHolding,
    refetch: fetchHoldings,
  };
}