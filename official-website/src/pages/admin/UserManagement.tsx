import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthToken } from '../../contexts/AuthContext';
import type { User } from '../../types/auth';
import type { UpdateUserRoleRequest } from '../../types/admin';
import { Search, MoreVertical, Shield, Ban, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

const UserManagement = () => {
  const { t } = useTranslation();
  const token = useAuthToken();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const fetchUsers = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        ...(search && { search }),
      });

      const response = await fetch(`${API_BASE}/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const updateRole = async (userId: number, role: 'user' | 'moderator' | 'admin') => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role } as UpdateUserRoleRequest),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    }
    setOpenMenu(null);
  };

  const updateStatus = async (userId: number, status: 'active' | 'disabled') => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
    setOpenMenu(null);
  };

  const deleteUser = async (userId: number) => {
    if (!token || !window.confirm(t('admin.users.deleteConfirm'))) return;

    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
    setOpenMenu(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-400',
      moderator: 'bg-yellow-500/20 text-yellow-400',
      user: 'bg-gray-500/20 text-gray-400',
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'bg-green-500/20 text-green-400'
      : 'bg-red-500/20 text-red-400';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">{t('admin.users.title')}</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.users.search')}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)]"
          />
        </div>
      </form>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">{t('auth.username')}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">{t('auth.email')}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">{t('admin.users.role')}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">{t('admin.users.status')}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">{t('admin.users.createdAt')}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">{t('admin.users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-gray-300">{user.id}</td>
                    <td className="px-6 py-4 text-sm text-white">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openMenu === user.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenu(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-lg z-20 overflow-hidden">
                              <div className="py-1">
                                <div className="px-3 py-2 text-xs text-gray-500 border-b border-white/10">
                                  {t('admin.users.changeRole')}
                                </div>
                                <button
                                  onClick={() => updateRole(user.id, 'admin')}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
                                >
                                  <Shield className="w-4 h-4" />
                                  Admin
                                </button>
                                <button
                                  onClick={() => updateRole(user.id, 'moderator')}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
                                >
                                  <Shield className="w-4 h-4" />
                                  Moderator
                                </button>
                                <button
                                  onClick={() => updateRole(user.id, 'user')}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
                                >
                                  <Shield className="w-4 h-4" />
                                  User
                                </button>
                                <div className="border-t border-white/10 mt-1 pt-1">
                                  {user.status === 'active' ? (
                                    <button
                                      onClick={() => updateStatus(user.id, 'disabled')}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-yellow-400 hover:bg-white/5"
                                    >
                                      <Ban className="w-4 h-4" />
                                      {t('admin.users.disable')}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => updateStatus(user.id, 'active')}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-400 hover:bg-white/5"
                                    >
                                      <Ban className="w-4 h-4" />
                                      {t('admin.users.enable')}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteUser(user.id)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-white/5"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    {t('admin.users.delete')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > 10 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-400">
            Page {page} of {Math.ceil(total / 10)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / 10)}
            className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
