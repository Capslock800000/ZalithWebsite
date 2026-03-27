import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Clock,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    navigate('/admin/login');
    return null;
  }

  const navigation = [
    { name: t('admin.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('admin.stats.pendingComments'), href: '/admin/comments/pending', icon: Clock },
    { name: t('admin.comments.title'), href: '/admin/comments', icon: MessageSquare },
  ];

  if (user.role === 'admin') {
    navigation.splice(2, 0, { name: t('admin.users.title'), href: '/admin/users', icon: Users });
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1a1a1a] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">{t('admin.dashboard')}</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#1a1a1a] border-r border-white/10 transform transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/10">
              <Link to="/" className="text-xl font-bold text-white">
                Zalith Admin
              </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-[var(--brand)] text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 mb-4 px-4">
                <div className="w-8 h-8 rounded-full bg-[var(--brand)]/20 flex items-center justify-center">
                  <span className="text-[var(--brand)] text-sm font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 lg:ml-0 p-6 lg:p-8 pt-20 lg:pt-8">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
