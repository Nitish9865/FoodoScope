import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../App';
import { setUserMode } from '../services/mockDB';
import toast from 'react-hot-toast';

const ClinicalIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect x="10" y="8" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
    <line x1="26" y1="16" x2="26" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="20" y1="22" x2="32" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="18" y1="33" x2="34" y2="33" strokeDasharray="3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="38" x2="28" y2="38" strokeDasharray="3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="40" cy="40" r="8" fill="currentColor"/>
    <path d="M37 40h6M40 37v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const FamilyIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <path d="M8 42 C8 34 14 28 22 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <circle cx="22" cy="20" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M30 42 C30 36 34 32 40 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <circle cx="40" cy="26" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M18 42 L26 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* Plate */}
    <ellipse cx="16" cy="44" rx="6" ry="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M10 44 Q16 40 22 44" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);

const FitnessIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    {/* Dumbbell */}
    <rect x="6" y="22" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="6" y="18" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
    <rect x="6" y="30" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
    <line x1="14" y1="26" x2="38" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="38" y="22" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="38" y="18" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
    <rect x="38" y="30" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
    {/* Lightning */}
    <path d="M28 10 L24 22 H29 L25 36 L36 18 H31 Z" fill="currentColor" opacity="0.8"/>
  </svg>
);

const modes = [
  {
    id: 'clinical',
    label: 'Clinical Mode',
    tagline: 'Health First',
    description: 'Personalized meal plans for your medical conditions. AI-analyzed clinical reports, allergen tracking, and therapeutic recipes that replicate your favourite flavours.',
    features: ['Diabetes, PCOS, Heart conditions', 'Doctor report analysis', 'Allergen-safe filtering', 'FlavorDB flavour replication'],
    icon: <ClinicalIcon />,
    gradient: 'linear-gradient(135deg, #1B5E4A 0%, #3AAFA9 100%)',
    bg: '#F0F7F4',
    accent: '#1B5E4A',
    accentLight: 'rgba(27,94,74,0.1)',
    border: 'rgba(27,94,74,0.2)',
  },
  {
    id: 'daily',
    label: 'Family / Daily Mode',
    tagline: 'Balanced Life',
    description: 'Smart, budget-friendly weekly meal plans for the whole family. Variety, nutrition balance, quick recipes, and a Cheat Day button for guilt-free indulgence.',
    features: ['Budget-conscious planning', 'Quick 30-min recipes', 'Smart ingredient substitutions', 'Cheat Day logic'],
    icon: <FamilyIcon />,
    gradient: 'linear-gradient(135deg, #C4622D 0%, #E8A427 100%)',
    bg: '#FBF7F0',
    accent: '#C4622D',
    accentLight: 'rgba(196,98,45,0.1)',
    border: 'rgba(196,98,45,0.2)',
  },
  {
    id: 'fitness',
    label: 'Fitness Mode',
    tagline: 'Performance',
    description: 'Precision nutrition for serious athletes. Macro tracking, TDEE calculation, pre/post workout meals, and goal-specific optimization for muscle gain or fat loss.',
    features: ['TDEE & macro calculation', 'Pre/post workout meals', 'Muscle gain / fat loss', 'Calorie optimization'],
    icon: <FitnessIcon />,
    gradient: 'linear-gradient(135deg, #1C1C1C 0%, #FF4D4D 100%)',
    bg: '#0D0D0D',
    accent: '#FF4D4D',
    accentLight: 'rgba(255,77,77,0.12)',
    border: 'rgba(255,77,77,0.2)',
  },
];

export default function ModeSelection() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const updated = await setUserMode(user.id, selected);
      setUser(updated);
      toast.success(`${modes.find(m => m.id === selected)?.label} activated!`);
      navigate(`/${selected}`);
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FBF7F0', padding: '6rem 2rem 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', maxWidth: 600, marginBottom: '4rem' }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--terra)' }}>
          Step 1 of 2
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: 'var(--ink)', margin: '0.75rem 0', lineHeight: 1.1, position:'relative' , top:'5px'}}>
          Which best describes <em>you?</em>
        </h1>
        <p style={{ color: 'rgba(28,28,28,0.6)', fontSize: '1.1rem', lineHeight: 1.6  , position:'relative' , top:'20px'}}>
          Choose your mode. You can always switch later. We'll personalize your entire experience from here.
        </p>
      </motion.div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem', maxWidth: 1150, width: '100%', marginBottom: '4rem',
        alignItems: 'start' 
      }}>
        {modes.map((m) => {
          const isSelected = selected === m.id;
          return (
            <motion.div
              key={m.id}
              onClick={() => setSelected(m.id)}
              whileHover={{ y: -12, scale: isSelected ? 1.06 : 1.03 }}
              animate={{ 
                scale: isSelected ? 1.06 : 1,
                y: isSelected ? -10 : 0
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                // FIX: Force all cards to be the exact same dimensions
                height: '560px', 
                display: 'flex',
                flexDirection: 'column',
                
                borderRadius: '2.5rem', overflow: 'hidden', background: 'white', cursor: 'pointer',
                border: '2px solid', borderColor: isSelected ? m.accent : 'transparent',
                boxShadow: isSelected ? `0 30px 60px ${m.accentLight}` : '0 10px 30px rgba(0,0,0,0.04)',
                zIndex: isSelected ? 10 : 1, 
                position: 'relative',
                transformOrigin: 'center center',
                willChange: 'transform'
              }}
            >
              {/* Card Header (Fixed height for internal alignment) */}
              <div style={{ background: m.gradient, padding: '2.5rem 2rem 2.2rem', color: 'white', minHeight: '210px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', height: '40px' }}>
                  <div style={{ color: 'white' }}>{m.icon}</div>
                  <span style={{ 
                    background: 'rgba(255,255,255,0.15)', padding: '0.4rem 0.8rem', borderRadius: '999px',
                    fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    {m.tagline}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.6rem' }}>{m.label}</h3>
                <p style={{ opacity: 0.9, fontSize: '0.92rem', lineHeight: 1.5 }}>{m.description}</p>
              </div>

              {/* Card Body */}
              <div style={{ padding: '2rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Includes</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {m.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.92rem', color: '#444', fontWeight: 500 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.accent }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* This pushes the badge to the bottom of the fixed-height card */}
                <div style={{ flexGrow: 1 }} />

                <div style={{ height: '45px', display: 'flex', alignItems: 'flex-end' }}>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{ 
                          width: '100%', padding: '0.65rem', background: m.accentLight, 
                          borderRadius: '999px', textAlign: 'center', color: m.accent, fontWeight: 800, fontSize: '0.85rem', position: 'relative' , top : '15px'
                        }}
                      >
                        ✓ Selected
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Confirm Button */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}
      >
        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          className="btn btn-primary"
          style={{
            fontSize: '1.05rem', padding: '1rem 3rem', fontWeight: 600,
            opacity: selected ? 1 : 0.5, cursor: selected ? 'pointer' : 'not-allowed',
            position: 'relative' , bottom : '20px'
          }}
        >
          {loading ? 'Setting up your experience…' : 'Continue →'}
        </button>
        <p style={{ fontSize: '0.8rem', color: 'rgba(28,28,28,0.4)', fontFamily: 'var(--font-mono)' }}>
          You'll only see this once. We save your progress.
        </p>
      </motion.div>
    </div>
  );
}
