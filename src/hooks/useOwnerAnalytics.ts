import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { logger } from '@/services/logger';

interface PropertyAnalytics {
  property_id: string;
  property_title: string;
  property_image: string | null;
  monthly_rent: number;
  views_7d: number;
  views_30d: number;
  applications_count: number;
  conversion_rate: number;
  status: string;
}

interface OwnerAnalyticsStats {
  total_properties: number;
  total_views_7d: number;
  total_applications: number;
  avg_conversion_rate: number;
}

export const useOwnerAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PropertyAnalytics[]>([]);
  const [stats, setStats] = useState<OwnerAnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Try RPC first
        let data = null;
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_owner_analytics', { owner_user_id: user.id });

        if (!rpcError && rpcData) {
          data = rpcData;
        } else {
          // Fallback: fetch data directly from tables
          console.warn('RPC get_owner_analytics not found, using fallback queries');
          
          // Get owner's properties
          const { data: properties, error: propsError } = await supabase
            .from('properties')
            .select('id, title, main_image, monthly_rent, status')
            .eq('owner_id', user.id);

          if (propsError) throw propsError;

          if (!properties || properties.length === 0) {
            data = [];
          } else {
            // For each property, get views and applications
            const analyticsData = await Promise.all(
              properties.map(async (property) => {
                // Get views count (last 7 days and 30 days)
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const { count: views7d } = await supabase
                  .from('property_views')
                  .select('*', { count: 'exact', head: true })
                  .eq('property_id', property.id)
                  .gte('created_at', sevenDaysAgo.toISOString());

                const { count: views30d } = await supabase
                  .from('property_views')
                  .select('*', { count: 'exact', head: true })
                  .eq('property_id', property.id)
                  .gte('created_at', thirtyDaysAgo.toISOString());

                // Get applications count
                const { count: applicationsCount } = await supabase
                  .from('rental_applications')
                  .select('*', { count: 'exact', head: true })
                  .eq('property_id', property.id);

                // Calculate conversion rate
                const views = views7d || 0;
                const applications = applicationsCount || 0;
                const conversionRate = views > 0 ? (applications / views) * 100 : 0;

                return {
                  property_id: property.id,
                  property_title: property.title,
                  property_image: property.main_image,
                  monthly_rent: property.monthly_rent,
                  views_7d: views7d || 0,
                  views_30d: views30d || 0,
                  applications_count: applications,
                  conversion_rate: Math.round(conversionRate * 100) / 100,
                  status: property.status
                };
              })
            );

            data = analyticsData;
          }
        }

        setAnalytics(data || []);

        // Calculer les stats globales
        if (data && data.length > 0) {
          const totalViews7d = data.reduce((sum: number, p: any) => sum + Number(p.views_7d), 0);
          const totalApplications = data.reduce((sum: number, p: any) => sum + Number(p.applications_count), 0);
          const avgConversion = data.reduce((sum: number, p: any) => sum + Number(p.conversion_rate), 0) / data.length;

          setStats({
            total_properties: data.length,
            total_views_7d: totalViews7d,
            total_applications: totalApplications,
            avg_conversion_rate: Math.round(avgConversion * 100) / 100
          });
        } else {
          setStats({
            total_properties: 0,
            total_views_7d: 0,
            total_applications: 0,
            avg_conversion_rate: 0
          });
        }
      } catch (err: any) {
        logger.error('Failed to fetch owner analytics', { error: err.message, userId: user.id });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  return { analytics, stats, loading, error };
};

