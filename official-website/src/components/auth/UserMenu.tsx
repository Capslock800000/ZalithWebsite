import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserMenuProps {
  onLoginClick: () => void;
}

const UserMenu = ({ onLoginClick }: UserMenuProps) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="px-4 py-2 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand)]/80 transition-colors text-sm"
      >
        {t('auth.login')}
      </button>
    );
  }

  const isAdmin = user.role === 'admin' || user.role === 'moderator';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-[var(--brand)]/20 flex items-center justify-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-[var(--brand)] text-xs font-semibold">
              {user.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span className="text-sm text-white">{user.username}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-sm text-white font-medium">{user.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="py-1">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {t('admin.dashboard')}
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
