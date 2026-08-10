import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PriceAlert {
  id: string;
  user_id: string;
  symbol: string;
  alert_type: 'price_above' | 'price_below' | 'volume_spike' | 'dividend' | 'news';
  target_value: number | null;
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export function usePriceAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    } else {
      setAlerts([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
      } else {
        setAlerts((data || []) as PriceAlert[]);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData: Omit<PriceAlert, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'triggered_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .insert({
          ...alertData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating alert:', error);
        return { error };
      }

      setAlerts(prev => [data as PriceAlert, ...prev]);
      return { data };
    } catch (error) {
      console.error('Error creating alert:', error);
      return { error };
    }
  };

  const deleteAlert = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting alert:', error);
        return { error };
      }

      setAlerts(prev => prev.filter(alert => alert.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting alert:', error);
      return { error };
    }
  };

  const updateAlert = async (id: string, changes: Partial<Pick<PriceAlert, 'alert_type' | 'target_value' | 'is_active'>>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .update(changes)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating alert:', error);
        return { error };
      }

      setAlerts(prev => prev.map(alert => alert.id === id ? data as PriceAlert : alert));
      return { data };
    } catch (error) {
      console.error('Error updating alert:', error);
      return { error };
    }
  };

  const toggleAlert = async (id: string, isActive: boolean) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .update({ is_active: isActive })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling alert:', error);
        return { error };
      }

      setAlerts(prev => prev.map(alert => alert.id === id ? data as PriceAlert : alert));
      return { data };
    } catch (error) {
      console.error('Error toggling alert:', error);
      return { error };
    }
  };

  return {
    alerts,
    loading,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    refetch: fetchAlerts,
  };
}