import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, User } from 'lucide-react';

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register, loading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

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

    setSubmitting(true);
    try {
      await register({ email, username, password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.registerFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md">
          <div className="bg-[var(--bg-alt)] border border-[var(--divider)]/20 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-1)] mb-2">{t('auth.registerSuccess')}</h2>
            <p className="text-[var(--text-2)] mb-6">{t('auth.registerSuccessDesc')}</p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-[var(--brand)] text-white rounded-lg hover:opacity-90 transition-colors"
            >
              {t('auth.login')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src="/zl_icon.webp" alt="Logo" className="w-12 h-12 rounded-lg mx-auto" />
          </Link>
          <h1 className="text-3xl font-bold text-[var(--text-1)] mb-2">{t('auth.register')}</h1>
          <p className="text-[var(--text-2)]">{t('auth.registerSubtitle')}</p>
        </div>

        <div className="bg-[var(--bg-alt)] border border-[var(--divider)]/20 rounded-xl p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-2)] mb-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-2)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--divider)]/30 rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-1)] placeholder-[var(--text-2)] focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-2)] mb-1">{t('auth.username')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-2)]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--divider)]/30 rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-1)] placeholder-[var(--text-2)] focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder={t('auth.usernamePlaceholder')}
                  required
                  minLength={3}
                  maxLength={20}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-2)] mb-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-2)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--divider)]/30 rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-1)] placeholder-[var(--text-2)] focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-2)] mb-1">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-2)]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--divider)]/30 rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-1)] placeholder-[var(--text-2)] focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[var(--brand)] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {submitting ? t('common.loading') : t('auth.register')}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-[var(--text-2)]">
            {t('auth.hasAccount')}{' '}
            <Link
              to="/login"
              className="text-[var(--brand)] hover:underline"
            >
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
