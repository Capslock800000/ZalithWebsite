import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail } from 'lucide-react';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'));
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

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src="/zl_icon.webp" alt="Logo" className="w-12 h-12 rounded-lg mx-auto" />
          </Link>
          <h1 className="text-3xl font-bold text-[var(--text-1)] mb-2">{t('auth.login')}</h1>
          <p className="text-[var(--text-2)]">{t('auth.loginSubtitle')}</p>
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
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[var(--brand)] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {submitting ? t('common.loading') : t('auth.login')}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-[var(--text-2)]">
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              className="text-[var(--brand)] hover:underline"
            >
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
