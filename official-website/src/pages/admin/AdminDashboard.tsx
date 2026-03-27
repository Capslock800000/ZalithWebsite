import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthToken } from '../../contexts/AuthContext';
import type { AdminStats } from '../../types/admin';
import { Users, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  color: string;
}) => (
  <div className="bg-[var(--bg-alt)] border border-[var(--divider)]/20 rounded-xl p-6">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--text-1)]">{value}</p>
        <p className="text-sm text-[var(--text-2)]">{title}</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { t } = useTranslation();
  const token = useAuthToken();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(`${API_BASE}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-1)] mb-8">{t('admin.dashboard')}</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard
          title={t('admin.stats.totalUsers')}
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-blue-500/20"
        />
        <StatsCard
          title={t('admin.stats.totalComments')}
          value={stats?.totalComments || 0}
          icon={MessageSquare}
          color="bg-purple-500/20"
        />
        <StatsCard
          title={t('admin.stats.pendingComments')}
          value={stats?.pendingComments || 0}
          icon={Clock}
          color="bg-yellow-500/20"
        />
        <StatsCard
          title={t('admin.stats.approvedComments')}
          value={stats?.approvedComments || 0}
          icon={CheckCircle}
          color="bg-green-500/20"
        />
        <StatsCard
          title={t('admin.stats.rejectedComments')}
          value={stats?.rejectedComments || 0}
          icon={XCircle}
          color="bg-red-500/20"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
