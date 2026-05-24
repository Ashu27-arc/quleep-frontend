import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Toast } from '../components/Toast';

export const Login = () => {
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setToastMessage({
        message: 'Your session has expired. Please log in again.',
        type: 'warning',
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-neutral-950 shadow-xl shadow-emerald-950/20 mb-3">
            <Box className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-neutral-100">3D OBJECT STUDIO</h1>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest font-semibold">Enter your credentials to continue</p>
        </div>

        {/* Card wrapper */}
        <div className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-rose-400 text-xs animate-shake">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950/70 border border-neutral-850 rounded-2xl text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label htmlFor="password" className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950/70 border border-neutral-850 rounded-2xl text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm"
                  required
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-neutral-950 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/30 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Access Studio</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Nav transition */}
          <div className="mt-8 text-center border-t border-neutral-900 pt-6">
            <p className="text-xs text-neutral-400">
              New to the Studio?{' '}
              <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
