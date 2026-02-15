import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '34%', label: 'Indians skip meals due to indecision' },
  { value: '45%', label: 'Abandon healthy diets within 2 weeks' },
  { value: '3 hrs', label: 'Wasted weekly just deciding what to cook' },
  { value: '₹2,400', label: 'Average monthly food waste per household' },
];

// Mode Icons (same as ModeSelection)
const ClinicalIcon = ({ color = '#1B5E4A' }) => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect x="10" y="8" width="32" height="36" rx="4" stroke={color} strokeWidth="2" fill="none"/>
    <line x1="26" y1="16" x2="26" y2="28" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="20" y1="22" x2="32" y2="22" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="18" y1="33" x2="34" y2="33" strokeDasharray="3 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="38" x2="28" y2="38" strokeDasharray="3 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="40" cy="40" r="8" fill={color}/>
    <path d="M37 40h6M40 37v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const FamilyIcon = ({ color = '#C4622D' }) => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <path d="M8 42 C8 34 14 28 22 28" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <circle cx="22" cy="20" r="8" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M30 42 C30 36 34 32 40 32" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <circle cx="40" cy="26" r="6" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M18 42 L26 42" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Plate */}
    <ellipse cx="16" cy="44" rx="6" ry="2" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M10 44 Q16 40 22 44" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);

const FitnessIcon = ({ color = '#FF4D4D' }) => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    {/* Dumbbell */}
    <rect x="6" y="22" width="8" height="8" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <rect x="6" y="18" width="8" height="4" rx="1" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2"/>
    <rect x="6" y="30" width="8" height="4" rx="1" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2"/>
    <line x1="14" y1="26" x2="38" y2="26" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="38" y="22" width="8" height="8" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <rect x="38" y="18" width="8" height="4" rx="1" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2"/>
    <rect x="38" y="30" width="8" height="4" rx="1" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2"/>
    {/* Lightning */}
    <path d="M28 10 L24 22 H29 L25 36 L36 18 H31 Z" fill={color} opacity="0.8"/>
  </svg>
);

const features = [
  { icon: <ClinicalIcon />, title: 'Clinical Mode', desc: 'AI-tailored recipes for your exact medical conditions', color: '#1B5E4A' },
  { icon: <FamilyIcon />, title: 'Family Mode', desc: 'Budget-conscious, quick, family-loved meals all week', color: '#C4622D' },
  { icon: <FitnessIcon />, title: 'Fitness Mode', desc: 'Macro-precise fuel for your performance goals', color: '#FF4D4D' },
];

// SVG food illustrations
const ForkKnifeSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="rgba(196,98,45,0.08)" stroke="rgba(196,98,45,0.2)" strokeWidth="1.5"/>
    <line x1="28" y1="18" x2="28" y2="62" stroke="#C4622D" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="24" y1="18" x2="24" y2="30" stroke="#C4622D" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="28" y1="18" x2="28" y2="30" stroke="#C4622D" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="32" y1="18" x2="32" y2="30" stroke="#C4622D" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="52" y1="18" x2="52" y2="62" stroke="#2D5016" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M52 18 Q60 28 52 36" stroke="#2D5016" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
  </svg>
);

const LeafSVG = ({ opacity = 0.4 }) => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ opacity }}>
    <path d="M20 100 C20 100 40 20 100 20 C100 20 100 80 20 100Z" fill="rgba(74,124,47,0.3)"/>
    <line x1="20" y1="100" x2="100" y2="20" stroke="rgba(74,124,47,0.5)" strokeWidth="1.5"/>
    <line x1="60" y1="60" x2="40" y2="80" stroke="rgba(74,124,47,0.4)" strokeWidth="1"/>
    <line x1="70" y1="50" x2="50" y2="70" stroke="rgba(74,124,47,0.4)" strokeWidth="1"/>
    <line x1="80" y1="40" x2="60" y2="60" stroke="rgba(74,124,47,0.4)" strokeWidth="1"/>
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero title animation
      gsap.from('.hero-word', {
        y: 100, opacity: 0, duration: 1, stagger: 0.12,
        ease: 'power4.out', delay: 0.3,
      });

      // Subtitle
      gsap.from('.hero-sub', {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 1.2,
      });

      // CTA buttons
      gsap.from('.hero-cta', {
        y: 30, opacity: 0, duration: 0.7, stagger: 0.1,
        ease: 'back.out(1.7)', delay: 1.5,
      });

      // Floating food elements
      gsap.to('.hero-float-1', {
        y: -20, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1,
      });
      gsap.to('.hero-float-2', {
        y: -15, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5,
      });
      gsap.to('.hero-float-3', {
        y: -18, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1,
      });

      // Stats scroll animation
      gsap.from('.stat-card', {
        scrollTrigger: { trigger: '.stats-section', start: 'top 80%' },
        y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out',
      });

      // Features
      gsap.from('.feature-card', {
        scrollTrigger: { trigger: '.features-section', start: 'top 80%' },
        x: (i) => (i % 2 === 0 ? -60 : 60),
        opacity: 0, stagger: 0.2, duration: 0.9, ease: 'power3.out',
      });

      // Marquee text
      gsap.to('.marquee-inner', {
        x: '-50%', duration: 20, ease: 'none', repeat: -1,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ background: 'var(--cream)', overflowX: 'hidden' }}>
      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '1.25rem 3rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(251,247,240,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(125,155,118,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ForkKnifeSVG />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--forest)' }}>
            Palate Planner
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/auth')} style={{ fontSize: '0.9rem' }}>
            Sign in
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/auth')} style={{ fontSize: '0.9rem' }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '8rem 3rem 4rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative backgrounds */}
        <div style={{
          position: 'absolute', top: '10%', right: '-5%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,164,39,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,98,45,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Floating botanical elements */}
        <div className="hero-float-1" style={{ position: 'absolute', top: '15%', right: '8%', pointerEvents: 'none' }}>
          <LeafSVG opacity={0.5} />
        </div>
        <div className="hero-float-2" style={{ position: 'absolute', top: '50%', right: '15%', pointerEvents: 'none' }}>
          <LeafSVG opacity={0.3} />
        </div>
        <div className="hero-float-3" style={{ position: 'absolute', bottom: '20%', right: '5%', pointerEvents: 'none' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(196,98,45,0.15)', border: '1px solid rgba(196,98,45,0.2)' }} />
        </div>

        <div style={{ maxWidth: 900, position: 'relative', zIndex: 1 }}>
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}
          >
            <span className="tag tag-terra" style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Fork It Challenge 2025 · IIIT Delhi
            </span>
          </motion.div>

          {/* Title */}
          <div ref={titleRef} style={{ overflow: 'hidden', marginBottom: '0.5rem' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 7vw, 6rem)',
              fontWeight: 900, lineHeight: 1.05, color: 'var(--ink)',
              letterSpacing: '-0.02em',
            }}>
              {'Ending Decision'.split(' ').map((word, i) => (
                <span key={i} className="hero-word" style={{ display: 'inline-block', marginRight: '0.3em' }}>
                  {word}
                </span>
              ))}
              <br />
              {'Fatigue,'.split(' ').map((word, i) => (
                <span key={i} className="hero-word" style={{ display: 'inline-block', marginRight: '0.3em' }}>
                  {word}
                </span>
              ))}
              {' '}
              <span className="hero-word text-gradient-terra" style={{ margin: '2rem 0rem',display: 'inline-block', fontStyle: 'italic' }}>
                One Meal at a Time.
              </span>
            </h1>
          </div>

          <p className="hero-sub" style={{
            fontSize: '1.25rem', color: 'rgba(28,28,28,0.65)', maxWidth: 580,
            lineHeight: 1.7, fontWeight: 300,
          }}>
            AI-powered weekly meal scheduling with constraint-based optimization. Personalized for clinical patients, everyday families, and performance athletes.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="hero-cta btn btn-primary" onClick={() => navigate('/auth')}
              style={{ fontSize: '1.05rem', padding: '0.95rem 2rem', fontWeight: 600 }}>
              Start Planning Free →
            </button>
            <button className="hero-cta btn btn-outline" onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })}
              style={{ fontSize: '1.05rem', padding: '0.95rem 2rem' }}>
              See How It Works
            </button>
          </div>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 0.6 }}
            style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(28,28,28,0.45)', fontFamily: 'var(--font-mono)' }}
          >
            Built for Symposium on Computational Gastronomy · IIIT Delhi 2025
          </motion.p>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ overflow: 'hidden', background: 'var(--forest-mid)', padding: '0.875rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="marquee-inner" style={{ display: 'flex', whiteSpace: 'nowrap', gap: '3rem' }}>
          {Array(8).fill(['Molecular Flavor Science', '•', '7-Day AI Planning', '•', 'Smart Substitutions', '•', 'Clinical Nutrition', '•', 'Macro Optimization', '•', 'Cheat Day Logic', '•']).flat().map((item, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>{item}</span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="stats-section" style={{ padding: '6rem 3rem', background: 'var(--cream-dark)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--terra)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            The Problem
          </motion.p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '3rem', maxWidth: 600 }}>
            India's silent food crisis costs us more than we realize.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {stats.map((stat, i) => (
              <div key={i} className="stat-card" style={{
                background: 'white', borderRadius: 'var(--radius-lg)',
                padding: '2rem', boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(125,155,118,0.1)',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, color: 'var(--terra)', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <p style={{ color: 'rgba(28,28,28,0.65)', marginTop: '0.75rem', lineHeight: 1.5 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      {/* ── THE SOLUTIONS / MODES SECTION ── */}
<section id="how" style={{ padding: '6rem 3rem', background: 'var(--cream)' }}>
  <div style={{ maxWidth: 1200, margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--terra)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
        The Solution
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: 'var(--ink)', fontWeight: 700 }}>
        Three modes. One intelligent planner.
      </h2>
    </div>

    <div className="features-section" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
      gap: '2.5rem' 
    }}>
      {[
        {
          id: 'clinical',
          label: 'Clinical Mode',
          tagline: 'HEALTH FIRST',
          description: 'Personalized meal plans for your medical conditions. AI-analyzed clinical reports, allergen tracking, and therapeutic recipes that replicate your favourite flavours.',
          features: ['Diabetes, PCOS, Heart conditions', 'Doctor report analysis', 'Allergen-safe filtering', 'FlavorDB flavour replication'],
          gradient: 'linear-gradient(135deg, #1B5E4A 0%, #3AAFA9 100%)',
          accent: '#1B5E4A',
          icon: <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect x="10" y="8" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
            <line x1="26" y1="16" x2="26" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="20" y1="22" x2="32" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="18" y1="33" x2="34" y2="33" strokeDasharray="3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="18" y1="38" x2="28" y2="38" strokeDasharray="3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="40" cy="40" r="8" fill="currentColor"/>
            <path d="M37 40h6M40 37v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        },
        {
          id: 'daily',
          label: 'Family / Daily Mode',
          tagline: 'BALANCED LIFE',
          description: 'Smart, budget-friendly weekly meal plans for the whole family. Variety, nutrition balance, quick recipes, and a Cheat Day button for guilt-free indulgence.',
          features: ['Budget-conscious planning', 'Quick 30-min recipes', 'Smart ingredient substitutions', 'Cheat Day logic'],
          gradient: 'linear-gradient(135deg, #C4622D 0%, #E8A427 100%)',
          accent: '#C4622D',
          icon: <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <path d="M8 42 C8 34 14 28 22 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <circle cx="22" cy="20" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M30 42 C30 36 34 32 40 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <circle cx="40" cy="26" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M18 42 L26 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <ellipse cx="16" cy="44" rx="6" ry="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M10 44 Q16 40 22 44" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        },
        {
          id: 'fitness',
          label: 'Fitness Mode',
          tagline: 'PERFORMANCE',
          description: 'Precision nutrition for serious athletes. Macro tracking, TDEE calculation, pre/post workout meals, and goal-specific optimization for muscle gain or fat loss.',
          features: ['TDEE & macro calculation', 'Pre/post workout meals', 'Muscle gain / fat loss', 'Calorie optimization'],
          gradient: 'linear-gradient(135deg, #1C1C1C 0%, #FF4D4D 100%)',
          accent: '#FF4D4D',
          icon: <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect x="6" y="22" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <rect x="6" y="18" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
            <rect x="6" y="30" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
            <line x1="14" y1="26" x2="38" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <rect x="38" y="22" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <rect x="38" y="18" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
            <rect x="38" y="30" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
            <path d="M28 10 L24 22 H29 L25 36 L36 18 H31 Z" fill="currentColor" opacity="0.8"/>
          </svg>
        }
      ].map((m) => (
        <motion.div
          key={m.id}
          whileHover={{ y: -15, scale: 1.03 }} // Interactivity: Pops up and gets bigger
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          style={{
            borderRadius: '2.5rem',
            overflow: 'hidden',
            background: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Card Top: Gradient Header */}
          <div style={{ background: m.gradient, padding: '3rem 2rem 2.5rem', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ color: 'white', opacity: 0.9 }}>{m.icon}</div>
              <span style={{
                background: 'rgba(255,255,255,0.2)', padding: '0.4rem 0.9rem', borderRadius: '999px',
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em'
              }}>
                {m.tagline}
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              {m.label}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {m.description}
            </p>
          </div>

          {/* Card Bottom: Features List */}
          <div style={{ padding: '2rem', flexGrow: 1 }}>
            <p style={{ 
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#999', 
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' 
            }}>
              Includes
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {m.features.map((feat, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#444' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.accent }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>

      {/* ── CTA BANNER ── */}
      <section style={{
        margin: '0 3rem 6rem', borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, var(--forest-mid) 0%, var(--forest) 100%)',
        padding: '5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(232,164,39,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 300, height: 300, borderRadius: '50%', background: 'rgba(196,98,45,0.08)' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'white', marginBottom: '1.25rem', fontStyle: 'italic', position: 'relative' }}>
          Your perfect week of meals is <span style={{ color: 'var(--saffron)' }}>one click away.</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '1.75rem', position: 'relative' }}>
          Join the revolution in personalized nutrition. Free to start.
        </p>
        <button className="btn" onClick={() => navigate('/auth')} style={{
          background: 'var(--saffron)', color: 'var(--ink)', fontSize: '1.1rem',
          padding: '1rem 2.5rem', fontWeight: 700, position: 'relative',
        }}>
          Begin Your Journey →
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '2rem 3rem', borderTop: '1px solid rgba(125,155,118,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--forest)' }}>Palate Planner</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(28,28,28,0.45)' }}>
          IIIT Delhi · Fork It Challenge 2025 · Team Palate Planner
        </span>
      </footer>
    </div>
  );
}
