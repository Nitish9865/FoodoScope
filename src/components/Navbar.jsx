import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useDietary } from '../App';
import { clearSession } from '../services/mockDB';

const MODE_CONFIG = {
  clinical: {
    bg: 'rgba(240,247,244,0.92)',
    border: 'rgba(27,94,74,0.15)',
    logoColor: '#1B5E4A',
    accent: '#1B5E4A',
    label: 'Clinical Mode',
    dot: '#3AAFA9',
  },
  daily: {
    bg: 'rgba(251,247,240,0.92)',
    border: 'rgba(196,98,45,0.15)',
    logoColor: '#C4622D',
    accent: '#C4622D',
    label: 'Daily Mode',
    dot: '#E8A427',
  },
  fitness: {
    bg: 'rgba(13,13,13,0.92)',
    border: 'rgba(255,77,77,0.15)',
    logoColor: 'white',
    accent: '#FF4D4D',
    label: 'Fitness Mode',
    dot: '#FF4D4D',
  },
};

export default function Navbar({ mode = 'daily' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  // ✅ FIX: was `const { user } = useAuth()` — setUser was missing, causing logout to crash
  const { user, setUser } = useAuth();
  const { dietaryPreference, setDietaryPreference } = useDietary();
  const navigate = useNavigate();
  const mc = MODE_CONFIG[mode] || MODE_CONFIG.daily;

  const handleSwitchMode = async () => {
    setMenuOpen(false);
    navigate('/select-mode');
  };

  const handleLogout = () => {
    setMenuOpen(false);
    clearSession();
    setUser(null); // ✅ now works — setUser is properly destructured above
    navigate('/', { replace: true });
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0.875rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: mc.bg, backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${mc.border}`,
      }}>
        {/* Left: Logo */}
        <Link to={`/${mode}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill={mc.accent + '18'} stroke={mc.accent + '30'} strokeWidth="1"/>
            <line x1="11" y1="8" x2="11" y2="24" stroke={mc.accent} strokeWidth="2" strokeLinecap="round"/>
            <line x1="9" y1="8" x2="9" y2="13" stroke={mc.accent} strokeWidth="2" strokeLinecap="round"/>
            <line x1="11" y1="8" x2="11" y2="13" stroke={mc.accent} strokeWidth="2" strokeLinecap="round"/>
            <line x1="13" y1="8" x2="13" y2="13" stroke={mc.accent} strokeWidth="2" strokeLinecap="round"/>
            <line x1="22" y1="8" x2="22" y2="24" stroke={mc.logoColor === 'white' ? '#FF4D4D' : mc.accent} strokeWidth="2" strokeLinecap="round"/>
            <path d="M22 8 Q26 12 22 16" stroke={mc.logoColor === 'white' ? '#FF4D4D' : mc.accent} strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: mc.logoColor, lineHeight: 1 }}>
              Palate Planner
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: mc.dot }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: mc.dot, letterSpacing: '0.06em' }}>
                {mc.label}
              </span>
            </div>
          </div>
        </Link>

        {/* Center: Veg / Non-Veg toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', border: `1px solid ${mc.border}` }}>
          {[
            { id: 'veg', label: '🌱 Veg' },
            { id: 'both', label: 'Both' },
            { id: 'nonveg', label: '🍗 Non-Veg' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setDietaryPreference(id)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                background: dietaryPreference === id ? mc.accent : 'transparent',
                color: dietaryPreference === id ? 'white' : (mode === 'fitness' ? 'rgba(255,255,255,0.6)' : mc.logoColor),
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: User menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.4rem 0.875rem 0.4rem 0.4rem',
              background: 'rgba(255,255,255,0.1)', border: `1px solid ${mc.border}`,
              borderRadius: '999px', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: mc.accent, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700,
            }}>
              {initials}
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: mc.logoColor, fontWeight: 500 }}>
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
              <path d="M2 4L6 8L10 4" stroke={mc.logoColor} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
                  background: 'white', borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(125,155,118,0.12)',
                  minWidth: 220, overflow: 'hidden', zIndex: 200,
                }}
              >
                {/* User info */}
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(125,155,118,0.1)', background: 'var(--cream)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.95rem' }}>{user?.name}</div>
                  <div style={{ color: 'rgba(28,28,28,0.5)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{user?.email}</div>
                </div>

                {/* Menu items */}
                {[
                  { label: 'Switch Mode', action: handleSwitchMode, icon: '⇄' },
                  { label: 'My Profile', action: () => setMenuOpen(false), icon: '◉' },
                ].map(item => (
                  <button key={item.label} onClick={item.action} style={{
                    width: '100%', padding: '0.875rem 1.25rem', border: 'none',
                    background: 'transparent', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--charcoal)',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}

                <div style={{ height: 1, background: 'rgba(125,155,118,0.1)' }} />
                <button onClick={handleLogout} style={{
                  width: '100%', padding: '0.875rem 1.25rem', border: 'none',
                  background: 'transparent', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#E53E3E',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,62,62,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span>⎋</span>
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Click-outside close */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />}
    </>
  );
}