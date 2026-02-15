import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import { createUser, getUser, setCurrentUser } from '../services/mockDB';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = ''; // TODO: Add Google OAuth Client ID

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Replace with real auth API call
      // const res = await fetch('/api/auth/email', { method: 'POST', body: JSON.stringify(form) });
      const userId = `user_${btoa(form.email)}`;

      if (mode === 'signup') {
        const user = await createUser({ id: userId, email: form.email, name: form.name || form.email.split('@')[0], provider: 'email' });
        setCurrentUser(userId);
        setUser(user);
        toast.success('Welcome to Palate Planner!');
        navigate('/select-mode');
      } else {
        const existing = await getUser(userId);
        if (existing) {
          setCurrentUser(userId);
          setUser(existing);
          toast.success(`Welcome back, ${existing.name}!`);
          navigate(existing.mode ? `/${existing.mode}` : '/select-mode');
        } else {
          toast.error('Account not found. Sign up first?');
          setMode('signup');
        }
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleAuth = () => {
    // TODO: Implement Google OAuth
    // For demo, use a demo user
    toast('Google OAuth coming at hackathon — using demo mode', { icon: '🔐' });
    handleDemoLogin();
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const userId = 'demo_' + Date.now();
    const user = await createUser({ id: userId, email: 'demo@palateplan.app', name: 'Demo User', provider: 'demo' });
    setCurrentUser(userId);
    setUser(user);
    setTimeout(() => { navigate('/select-mode'); setLoading(false); }, 500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--cream)' }}>
      {/* ── LEFT PANEL ── */}
      <motion.div
        initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        style={{
          flex: '0 0 45%', background: 'linear-gradient(160deg, var(--forest-mid) 0%, var(--forest) 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '3rem', position: 'relative', overflow: 'hidden',
        }}
        className="auth-left"
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(232,164,39,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(196,98,45,0.12)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'white', cursor: 'pointer' }}
            onClick={() => navigate('/')}>
            Palate Planner
          </span>
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '4rem', }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="34" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
              <path d="M22 52 C22 52 36 16 56 16 C56 16 54 46 22 52Z" fill="rgba(232,164,39,0.4)"/>
              <circle cx="36" cy="36" r="6" fill="rgba(255,255,255,0.3)"/>
              <line x1="26" y1="24" x2="26" y2="48" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="22" y1="24" x2="22" y2="32" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="26" y1="24" x2="26" y2="32" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="30" y1="24" x2="30" y2="32" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="50" y1="24" x2="50" y2="48" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M50 24 Q58 32 50 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'white', fontStyle: 'italic', lineHeight: 1.2 }}>
            Eat better, live better, stress less.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 340, marginTop: '20px', marginBottom: '20px'}}>
            Your AI-powered nutrition companion that ends decision fatigue and builds healthier habits — one meal at a time.
          </p>

          {/* Mode preview chips */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Clinical Mode', color: 'rgba(58,175,169,0.3)' },
              { label: 'Family Mode', color: 'rgba(196,98,45,0.3)' },
              { label: 'Fitness Mode', color: 'rgba(255,77,77,0.3)' },
            ].map((m) => (
              <span key={m.label} style={{
                padding: '0.4rem 1rem', borderRadius: '999px',
                background: m.color, border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
              }}>{m.label}</span>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', position: 'relative', zIndex: 1 }}>
          IIIT Delhi · Fork It Challenge 2025
        </p>

        <style>{`@media(max-width:768px){ .auth-left { display:none; } }`}</style>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <motion.div
        initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--cream-dark)', borderRadius: 'var(--radius-full)', padding: '0.25rem', marginBottom: '2.5rem' }}>
            {['login', 'signup'].map((tab) => (
              <button key={tab} onClick={() => setMode(tab)} style={{
                flex: 1, padding: '0.65rem', border: 'none', cursor: 'pointer',
                borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontWeight: 500,
                fontSize: '0.95rem', transition: 'all 0.2s',
                background: mode === tab ? 'white' : 'transparent',
                color: mode === tab ? 'var(--terra)' : 'rgba(28,28,28,0.5)',
                boxShadow: mode === tab ? 'var(--shadow-sm)' : 'none',
              }}>
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
            {mode === 'login' ? 'Welcome back' : 'Join Palate Planner'}
          </h2>
          <p style={{ color: 'rgba(28,28,28,0.5)', marginBottom: '2rem' }}>
            {mode === 'login' ? 'Continue your personalized nutrition journey' : 'Start your 7-day free meal planning experience'}
          </p>

          {/* Google Button */}
          <button onClick={handleGoogleAuth} style={{
            width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)',
            border: '1.5px solid rgba(28,28,28,0.12)', background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer',
            transition: 'all 0.2s', color: 'var(--charcoal)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--terra)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(28,28,28,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* Google Logo */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(28,28,28,0.1)' }} />
            <span style={{ color: 'rgba(28,28,28,0.4)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(28,28,28,0.1)' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'signup' && (
              <input className="input" type="text" placeholder="Your name"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            )}
            <input className="input" type="email" placeholder="Email address" required
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input className="input" type="password" placeholder="Password" required
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1rem', fontWeight: 600 }}>
              {loading ? 'Loading…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Demo mode */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button onClick={handleDemoLogin} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--terra)', fontFamily: 'var(--font-body)', fontSize: '0.9rem',
              textDecoration: 'underline', textDecorationStyle: 'dotted',
            }}>
              Try without account (Demo Mode)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
