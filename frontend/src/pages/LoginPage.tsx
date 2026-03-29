import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/feed');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-lg shadow-xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <span className="text-3xl font-black text-[#006948] tracking-tight">Eco-Pulse</span>
          <p className="text-on-surface-variant mt-2">Welcome back, Eco-Warrior!</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-md mb-6 text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">mail</span>
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-on-surface"
              placeholder="nature@lover.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">lock</span>
              Password
            </label>
            <input
              type="password"
              required
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-on-surface"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
            <span className="material-symbols-outlined">login</span>
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-on-surface-variant">
          New to the movement?{' '}
          <Link to="/onboarding" className="text-primary font-bold hover:underline">
            Join Eco-Pulse
          </Link>
        </div>
      </div>
    </div>
  );
};
