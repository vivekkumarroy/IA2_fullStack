import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { getErrorMessage } from '../utils/errors';
import { ShelfLifeMark } from '../components/common/ShelfLifeMark';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to target page or root
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#193946] px-4 py-10 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-[#e87861]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full border-[48px] border-[#88a8a3]/15" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center lg:justify-between lg:gap-20">
        <div className="mb-10 hidden max-w-sm lg:block">
          <div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-[1.4rem] bg-[#e87861] p-2 shadow-[0_10px_25px_rgba(7,21,27,0.22)]"><ShelfLifeMark className="h-full w-full" /></span><div><p className="font-serif text-4xl font-bold leading-none tracking-tight text-[#fff8ed]">Shelf<span className="text-[#f1b490]">Life</span></p><p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#eab495]">Library desk</p></div></div>
          <h2 className="mt-5 font-serif text-5xl font-bold leading-[0.98] tracking-tight text-[#fff8ed]">Every library has a living story.</h2>
          <p className="mt-6 text-base leading-7 text-[#c4d3d0]">Keep collections, book activity, and member histories connected in one calm workspace.</p>
        </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#fff8ed]">Welcome</h1>
          <p className="mt-2 text-sm text-[#c4d3d0]">Sign in to manage books, active issues, and member book records.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#f4eadd]/70 bg-[#fffdf9] p-6 shadow-[0_25px_80px_rgba(8,25,32,0.35)] sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-xl border border-[#efb6aa] bg-[#fbe7e1] p-3.5 text-sm text-[#8e352b]"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="field-label">
                Librarian Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#83908d]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@library.edu"
                  autoComplete="off"
                  required
                  disabled={submitting}
                  className="field-input pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="field-label">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#83908d]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="off"
                  required
                  disabled={submitting}
                  className="field-input pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full mt-2"
            >
              Sign In to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="pt-1 text-center text-sm leading-6 text-[#66717a]">
              Need access? Ask your library administrator for a librarian account.
            </p>
          </form>

        </div>
      </div></div>
    </div>
  );
};
