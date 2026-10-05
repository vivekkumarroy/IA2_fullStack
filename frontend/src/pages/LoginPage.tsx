import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { getErrorMessage } from '../utils/errors';
import { ShelfLifeMark } from '../components/common/ShelfLifeMark';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('librarian@shelflife.test');
  const [password, setPassword] = useState('Passw0rd!');
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
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e87861] p-1.5 shadow-[0_10px_25px_rgba(7,21,27,0.22)]"><ShelfLifeMark className="h-full w-full" /></span><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#eab495]">ShelfLife library desk</p></div>
          <h2 className="mt-5 font-serif text-5xl font-bold leading-[0.98] tracking-tight text-[#fff8ed]">Every library has a living story.</h2>
          <p className="mt-6 text-base leading-7 text-[#c4d3d0]">Keep collections, loans, and member histories connected in one calm workspace.</p>
        </div>
      <div className="w-full max-w-md">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-[#e87861] p-2.5 text-white shadow-xl shadow-[#0d2027]/30 ring-1 ring-white/20">
            <ShelfLifeMark className="h-full w-full" />
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#fff8ed]">
            Shelf<span className="text-[#f1b490]">Life</span>
          </h1>
          <p className="mt-2 text-sm text-[#c4d3d0]">
            Sign in to manage catalog, active loans, and member borrow records.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#f4eadd]/70 bg-[#fffdf9] p-6 shadow-[0_25px_80px_rgba(8,25,32,0.35)] sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="librarian@shelflife.test"
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
          </form>

          {/* Dev Demo Credentials Box */}
          <div className="-mx-6 -mb-6 mt-6 rounded-b-2xl border-t border-[#e5e0d7] bg-[#f4f0e8] p-4 pt-5 sm:-mx-8 sm:-mb-8">
            <div className="flex items-start gap-2 text-xs text-[#66717a]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#286050]" />
              <div>
                <span className="font-semibold text-[#263640]">Demo Seed Credentials:</span>
                <div className="mt-0.5 font-mono text-[#53616a]">
                  librarian@shelflife.test / Passw0rd!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div></div>
    </div>
  );
};
