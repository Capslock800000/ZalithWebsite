import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { X, Mail, Lock, User } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin: () => void;
  onClose: () => void;
}

const RegisterForm = ({ onSuccess, onSwitchToLogin, onClose }: RegisterFormProps) => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await register({ email, username, password });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="absolute top-0 right-0 text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-2xl font-bold text-white mb-6">{t('auth.register')}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('auth.email')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
              placeholder={t('auth.emailPlaceholder')}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('auth.username')}</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
              placeholder={t('auth.usernamePlaceholder')}
              required
              minLength={3}
              maxLength={20}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('auth.password')}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
              placeholder={t('auth.passwordPlaceholder')}
              required
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('auth.confirmPassword')}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand)]/80 transition-colors disabled:opacity-50"
        >
          {loading ? t('common.loading') : t('auth.register')}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-400">
        {t('auth.hasAccount')}{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-[var(--brand)] hover:underline"
        >
          {t('auth.login')}
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
