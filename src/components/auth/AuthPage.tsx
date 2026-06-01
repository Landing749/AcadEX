import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, GraduationCap, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { HeroIllustration, SchoolIllustration, BellIllustration } from '../illustrations';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'register' | 'forgot';

function FloatingParticle({ delay, duration, x, size, opacity }: {
  delay: number; duration: number; x: number; size: number; opacity: number;
}) {
  return (
    <div
      className="absolute bottom-0 rounded-full bg-white pointer-events-none"
      style={{
        left: `${x}%`,
        width: size,
        height: size,
        opacity,
        animation: `floatParticle ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

export function AuthPage() {
  const { login, signup, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (mode === 'register' && password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Welcome back! 🎉');
      } else if (mode === 'register') {
        await signup(email, password, name);
        toast.success('Account created! Welcome to Acadex! 🎓');
      } else {
        await resetPassword(email);
        toast.success('Reset email sent! Check your inbox.');
        setMode('login');
      }
    } catch (err: any) {
      const messages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/invalid-credential': 'Invalid email or password.',
      };
      setError(messages[err.code] || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: AuthMode) => { setMode(m); setError(''); };

  const FEATURES = [
    { icon: '📊', label: 'Grade Tracker' },
    { icon: '📅', label: 'Assignment Planner' },
    { icon: '👥', label: 'Study Community' },
    { icon: '📈', label: 'Analytics' },
  ];

  const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
    delay: i * 0.8, duration: 6 + (i % 4) * 2,
    x: 5 + (i * 8) % 92, size: 4 + (i % 3) * 3,
    opacity: 0.04 + (i % 4) * 0.03,
  }));

  return (
    <>
      <style>{`
        @keyframes floatParticle {
          0% { transform: translateY(0) scale(1); opacity: var(--op, 0.06); }
          50% { transform: translateY(-60vh) scale(1.2); }
          100% { transform: translateY(-100vh) scale(0.8); opacity: 0; }
        }
        @keyframes gradShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33%  { transform: translateY(-8px) rotate(0.5deg); }
          66%  { transform: translateY(-4px) rotate(-0.5deg); }
        }
        .auth-hero {
          background: linear-gradient(135deg, #3730a3 0%, #4f46e5 30%, #6d28d9 65%, #4338ca 100%);
          background-size: 300% 300%;
          animation: gradShift 10s ease infinite;
        }
        .form-appear { animation: fadeSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-float  { animation: heroFloat 7s ease-in-out infinite; }
        .input-field {
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .input-field:focus {
          background: white;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.14), 0 1px 4px rgba(0,0,0,0.08);
          outline: none;
        }
        .dark .input-field:focus {
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.22);
        }
        .btn-submit {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(79,70,229,0.3), 0 6px 20px rgba(79,70,229,0.2);
        }
        .btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #4338ca, #4f46e5);
          box-shadow: 0 4px 8px rgba(79,70,229,0.4), 0 10px 28px rgba(79,70,229,0.3);
          transform: translateY(-1px);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .tab-active {
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05);
        }
        .dark .tab-active {
          background: rgba(99,102,241,0.2);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .feature-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 16px; border-radius: 999px; font-size: 13px; font-weight: 500;
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.22);
          backdrop-filter: blur(8px); color: white;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .feature-chip:hover { background: rgba(255,255,255,0.22); transform: translateY(-2px); }
        .icon-wrapper {
          transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), color 0.15s ease;
        }
        .input-field:focus ~ .icon-wrapper, .input-field:not(:placeholder-shown) ~ .icon-wrapper {
          color: #6366f1; transform: scale(1.15);
        }
      `}</style>

      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* ── Left hero panel ─────────────────────────────────────────── */}
        <div className="auth-hero hidden lg:flex lg:w-[55%] xl:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12">

          {/* Particle field */}
          {PARTICLES.map((p, i) => <FloatingParticle key={i} {...p} />)}

          {/* Geometric shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-white/5 blur-xl"/>
            <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full bg-indigo-300/10 blur-2xl"/>
            <div className="absolute top-1/3 left-[-40px] w-48 h-48 rounded-full bg-violet-500/10 blur-lg"/>

            {/* Grid dots */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}/>

            {/* Glowing ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5"/>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-white/5"/>
          </div>

          {/* Content */}
          <div className={`relative z-10 max-w-md text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

            {/* School illustration */}
            <div className="mb-8 flex items-center justify-center hero-float">
              <div className="w-52 h-52 drop-shadow-2xl">
                <SchoolIllustration className="w-full h-full"/>
              </div>
            </div>

            {/* Wordmark */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center border border-white/25 backdrop-blur-sm">
                <GraduationCap size={20} className="text-white"/>
              </div>
              <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Acade<span className="text-indigo-200">x</span>
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-[1.15]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Your Academic<br/>
              <span className="text-indigo-200">Journey</span> Starts Here
            </h1>

            <p className="text-indigo-200/90 text-base leading-relaxed mb-10">
              Track grades, manage assignments, and connect with fellow students across the Philippines.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap justify-center gap-2.5">
              {FEATURES.map(f => (
                <span key={f.label} className="feature-chip">
                  <span>{f.icon}</span>
                  {f.label}
                </span>
              ))}
            </div>
          </div>

          {/* Notification preview card */}
          <div className="absolute bottom-8 right-8 glass-white rounded-2xl p-4 max-w-[220px] shadow-xl border border-white/20"
            style={{ animation: 'heroFloat 6s ease-in-out infinite', animationDelay: '-2s' }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 shrink-0">
                <BellIllustration className="w-full h-full"/>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-bold leading-tight">Assignment Due Soon</p>
                <p className="text-indigo-200 text-xs mt-0.5">Physics Lab Report · 2h left</p>
                <div className="mt-2 h-1 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full w-[70%] rounded-full bg-white/60"/>
                </div>
              </div>
            </div>
          </div>

          {/* Stats pill */}
          <div className="absolute top-8 right-8 glass-white rounded-2xl px-4 py-3 border border-white/20 shadow-lg"
            style={{ animation: 'heroFloat 5s ease-in-out infinite', animationDelay: '-1s' }}>
            <p className="text-indigo-200 text-xs">Current GPA</p>
            <p className="text-white text-xl font-bold leading-tight">3.85</p>
            <p className="text-emerald-300 text-xs mt-0.5 font-medium">↑ +0.12 this sem</p>
          </div>
        </div>

        {/* ── Right form panel ──────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen lg:min-h-0 overflow-y-auto">

          <div className="w-full max-w-[420px]">

            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-3">
                <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <GraduationCap size={22} className="text-white"/>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Acade<span className="text-indigo-500">x</span>
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-indigo-500"/>
                <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">
                  {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Get started free' : 'Account recovery'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {mode === 'login'    && 'Sign in to your account'}
                {mode === 'register' && 'Create your account'}
                {mode === 'forgot'   && 'Reset your password'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5">
                {mode === 'login'    && 'Continue your academic journey'}
                {mode === 'register' && 'Join thousands of Filipino students'}
                {mode === 'forgot'   && "We'll send you a reset link"}
              </p>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/8 p-7 sm:p-8"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)' }}>

              {/* Mode tabs */}
              {mode !== 'forgot' && (
                <div className="flex gap-1 bg-gray-100 dark:bg-white/6 rounded-2xl p-1 mb-7">
                  {(['login', 'register'] as const).map(m => (
                    <button key={m} onClick={() => switchMode(m)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        mode === m
                          ? 'tab-active text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}>
                      {m === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                  ))}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 mb-6 animate-slide-up">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5"/>
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 form-appear">

                {/* Name field */}
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                    <div className="relative">
                      <input type="text" value={name} onChange={e => setName(e.target.value)}
                        className="input-field w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm"
                        placeholder="Juan dela Cruz" required/>
                      <User size={16} className="icon-wrapper absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                  <div className="relative">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="input-field w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm"
                      placeholder="juan@school.edu.ph" required/>
                    <Mail size={16} className="icon-wrapper absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                  </div>
                </div>

                {/* Password field */}
                {mode !== 'forgot' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                      {mode === 'login' && (
                        <button type="button" onClick={() => switchMode('forgot')}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold transition-colors">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="input-field w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm"
                        placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'} required/>
                      <Lock size={16} className="icon-wrapper absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm password */}
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="input-field w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm"
                        placeholder="Repeat your password" required/>
                      <Lock size={16} className="icon-wrapper absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button type="submit" disabled={loading}
                  className="btn-submit w-full flex items-center justify-center gap-2.5 py-4 text-white font-bold rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm">
                  {loading ? (
                    <Loader2 size={18} className="animate-spin"/>
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                      <ArrowRight size={16}/>
                    </>
                  )}
                </button>
              </form>

              {/* Back to login */}
              {mode === 'forgot' && (
                <button onClick={() => switchMode('login')}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-5 transition-colors py-1">
                  ← Back to sign in
                </button>
              )}
            </div>

            {/* Terms */}
            {mode === 'register' && (
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5 leading-relaxed">
                By creating an account, you agree to our{' '}
                <span className="text-indigo-500 cursor-pointer hover:underline">Terms of Service</span>{' '}
                and{' '}
                <span className="text-indigo-500 cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
            )}

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5">
              For Filipino students 🇵🇭 · Built with ❤️ for academic excellence
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
