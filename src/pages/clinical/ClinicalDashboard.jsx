import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Preloader from '../../components/Preloader';
import MealCard from '../../components/MealCard';
import Calendar7Day from '../../components/Calendar7Day';
import { useAuth, useDietary } from '../../App';
import { updateUser, getMealPlan, saveMealPlan, addMealToToday } from '../../services/mockDB';
import { generateClinicalMealPlan, analyzeClinicalReport, generate7DayClinicalPlan } from '../../services/aiService';
import { getSubstitutes } from '../../services/flavorAPI';
import './ClinicalDashboard.css';

const CONDITIONS = [
  'Type 2 Diabetes', 'Type 1 Diabetes', 'Hypertension', 'PCOS', 'Hypothyroidism', 'Hyperthyroidism',
  'Heart Disease', 'High Cholesterol', 'Arthritis', 'GERD/Acid Reflux', 'IBS', 'Kidney Disease',
  'Fatty Liver', 'Anemia', 'Common Cold', 'Fever', 'Cough', 'Post-Surgery Recovery', 'Other'
];

const COMMON_ALLERGENS = ['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Shellfish', 'Soy', 'Fish', 'Wheat', 'Peanuts', 'Sesame'];

const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast', time: '7–9 AM', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', time: '12–2 PM', icon: '☀️' },
  { id: 'snack', label: 'Snack', time: '4–5 PM', icon: '🌿' },
  { id: 'dinner', label: 'Dinner', time: '7–9 PM', icon: '🌙' },
];

export default function ClinicalDashboard() {
  const { user, setUser } = useAuth();
  const { dietaryPreference } = useDietary();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState({ conditions: [], allergies: [], favoriteDishes: [], severity: 'moderate', doctorNotes: '' });
  const [weekPlan, setWeekPlan] = useState(null);
  const [currentMeals, setCurrentMeals] = useState({});
  const [selectedSlot, setSelectedSlot] = useState('breakfast');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingMsg, setAiLoadingMsg] = useState('');
  const [reportText, setReportText] = useState('');
  const [substitutes, setSubstitutes] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(null);
  const [favInput, setFavInput] = useState('');

  useEffect(() => {
    const init = async () => {
      if (user?.healthProfile) {
        setProfile(p => ({ ...p, ...user.healthProfile }));
      } else {
        setOnboardingStep('conditions');
      }
      const plan = await getMealPlan(user?.id);
      if (plan) {
        setWeekPlan(plan);
        const today = new Date().toISOString().split('T')[0];
        const todayPlan = plan[today] || plan.today || {};
        if (Object.keys(todayPlan).length > 0) {
          const asArrays = {};
          for (const [slot, meal] of Object.entries(todayPlan)) {
            if (meal) asArrays[slot] = Array.isArray(meal) ? meal : [meal];
          }
          setCurrentMeals(prev => ({ ...prev, ...asArrays }));
        }
      }
      setLoading(false);
    };
    init();
  }, [user]);

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    toast('Reading your report…', { icon: '📄' });
    const text = await file.text().catch(() => 'Unable to parse PDF');
    setReportText(text || `Uploaded: ${file.name}`);
    // Analyze the report
    if (profile.conditions.length > 0) {
      setAiLoading(true);
      setAiLoadingMsg('Analyzing your medical report…');
      try {
        const analysis = await analyzeClinicalReport(text || file.name, profile.conditions.join(', '));
        toast.success('Report analyzed! Recommendations updated.');
        setProfile(p => ({ ...p, reportAnalysis: analysis }));
      } catch { }
      setAiLoading(false);
    }
  }, [profile.conditions]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': [], 'image/*': [], 'text/plain': [] } });

  const completeOnboarding = async () => {
    const updated = await updateUser(user.id, { healthProfile: profile, onboarded: true, allergies: profile.allergies });
    setUser(updated);
    setOnboardingStep(null);
    toast.success('Profile saved! Generating your first meal plan…');
    handleGeneratePlan();
  };

  const handleGeneratePlan = async () => {
    setAiLoading(true);
    setAiLoadingMsg('AI is crafting your therapeutic meal plan…');
    try {
      const result = await generateClinicalMealPlan({
        conditions: profile.conditions.join(', ') || 'General wellness',
        allergies: profile.allergies,
        favoriteDishes: profile.favoriteDishes,
        doctorNotes: profile.doctorNotes || reportText,
        severity: profile.severity,
        mealType: selectedSlot,
        dietaryPreference,
      });
      setCurrentMeals(prev => ({ ...prev, [selectedSlot]: result.meals || [] }));
      toast.success('Meal options generated!');
    } catch { toast.error('Try again in a moment'); }
    setAiLoading(false);
  };

  const handleGenerate7Day = async () => {
    setAiLoading(true);
    setAiLoadingMsg('Planning your complete therapeutic week…');
    try {
      const plan = await generate7DayClinicalPlan({ conditions: profile.conditions.join(', '), allergies: profile.allergies, favoriteDishes: profile.favoriteDishes, severity: profile.severity, dietaryPreference });
      setWeekPlan(plan);
      await saveMealPlan(user.id, plan);
      toast.success('7-day clinical plan ready!');
      setActiveTab('calendar');
    } catch { toast.error('Generation failed, please retry'); }
    setAiLoading(false);
  };

  const handleSubstitute = async (meal) => {
    if (!meal.ingredients) return;
    const ingName = meal.ingredients[0]?.name || meal.ingredients[0];
    if (!ingName) return;
    setAiLoadingMsg(`Finding substitutes for ${ingName}…`);
    setAiLoading(true);
    const subs = await getSubstitutes(ingName);
    setSubstitutes({ for: ingName, options: subs });
    setAiLoading(false);
  };

  if (loading) return <Preloader message="Loading your clinical profile…" />;
  if (aiLoading) return <Preloader message={aiLoadingMsg} />;

  // ── ONBOARDING ──────────────────────────────────────────────
  if (onboardingStep) {
    return (
      <div className="clinical-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 620, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="clinical-icon-circle" style={{ margin: '0 auto 1.25rem' }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="6" y="4" width="28" height="32" rx="4" stroke="#1B5E4A" strokeWidth="2" fill="none"/>
                <line x1="20" y1="12" x2="20" y2="24" stroke="#1B5E4A" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="14" y1="18" x2="26" y2="18" stroke="#1B5E4A" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="30" cy="30" r="8" fill="#1B5E4A"/>
                <path d="M27 30h6M30 27v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#1B5E4A', marginBottom: '0.5rem' }}>
              {onboardingStep === 'conditions' ? 'Your Health Profile' :
               onboardingStep === 'allergies' ? 'Any Allergies?' :
               'Your Favourite Dishes'}
            </h1>
            <p style={{ color: 'rgba(28,28,28,0.6)',position:'relative',top:"10px"}}>
              {onboardingStep === 'conditions' ? "Tell us about your conditions — we'll tailor every meal to help you heal." :
               onboardingStep === 'allergies' ? "We'll ask this only once and never suggest something harmful." :
               "We'll use FlavorDB to replicate these flavours in your therapeutic meals."}
            </p>
          </div>

          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
            {onboardingStep === 'conditions' && (
              <>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1B5E4A', marginBottom: '1rem' }}>Select all that apply</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {CONDITIONS.map(c => (
                    <button key={c} onClick={() => setProfile(p => ({ ...p, conditions: p.conditions.includes(c) ? p.conditions.filter(x => x !== c) : [...p.conditions, c] }))}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '999px', cursor: 'pointer',
                        border: profile.conditions.includes(c) ? '2px solid #1B5E4A' : '1.5px solid rgba(28,28,28,0.15)',
                        background: profile.conditions.includes(c) ? 'rgba(27,94,74,0.1)' : 'white',
                        color: profile.conditions.includes(c) ? '#1B5E4A' : 'rgba(28,28,28,0.7)',
                        fontFamily: 'var(--font-body)', fontSize: '0.88rem', transition: 'all 0.2s',
                        fontWeight: profile.conditions.includes(c) ? 600 : 400,
                      }}
                    >{c}</button>
                  ))}
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(28,28,28,0.5)', marginBottom: '0.5rem' }}>Severity</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['mild', 'moderate', 'severe'].map(s => (
                      <button key={s} onClick={() => setProfile(p => ({ ...p, severity: s }))}
                        style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-md)', border: profile.severity === s ? '2px solid #1B5E4A' : '1.5px solid rgba(28,28,28,0.12)', background: profile.severity === s ? 'rgba(27,94,74,0.08)' : 'white', color: profile.severity === s ? '#1B5E4A' : 'rgba(28,28,28,0.6)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: profile.severity === s ? 600 : 400, textTransform: 'capitalize' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn btn-forest" style={{ width: '100%', justifyContent: 'center', padding: '0.95rem' }}
                  onClick={() => setOnboardingStep('allergies')} disabled={profile.conditions.length === 0}>
                  Continue →
                </button>
              </>
            )}

            {onboardingStep === 'allergies' && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {COMMON_ALLERGENS.map(a => (
                    <button key={a} onClick={() => setProfile(p => ({ ...p, allergies: p.allergies.includes(a) ? p.allergies.filter(x => x !== a) : [...p.allergies, a] }))}
                      style={{ padding: '0.5rem 1rem', borderRadius: '999px', cursor: 'pointer', border: profile.allergies.includes(a) ? '2px solid #C53030' : '1.5px solid rgba(28,28,28,0.15)', background: profile.allergies.includes(a) ? 'rgba(197,48,48,0.08)' : 'white', color: profile.allergies.includes(a) ? '#C53030' : 'rgba(28,28,28,0.7)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', transition: 'all 0.2s' }}>
                      {a}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(28,28,28,0.45)', marginBottom: '1.5rem', fontStyle: 'italic' }}>No allergies? Click Continue without selecting any.</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-outline" onClick={() => setOnboardingStep('conditions')} style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
                  <button className="btn btn-forest" onClick={() => setOnboardingStep('flavors')} style={{ flex: 2, justifyContent: 'center', padding: '0.95rem' }}>Continue →</button>
                </div>
              </>
            )}

            {onboardingStep === 'flavors' && (
              <>
                <p style={{ color: 'rgba(28,28,28,0.6)', marginBottom: '1rem', fontSize: '0.9rem' }}>e.g. Biryani, Pasta, Dal Makhani, Rajma Rice</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input className="input" placeholder="Add a favourite dish…" value={favInput}
                    onChange={e => setFavInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && favInput.trim()) { setProfile(p => ({ ...p, favoriteDishes: [...p.favoriteDishes, favInput.trim()] })); setFavInput(''); } }}
                  />
                  <button className="btn btn-forest" onClick={() => { if (favInput.trim()) { setProfile(p => ({ ...p, favoriteDishes: [...p.favoriteDishes, favInput.trim()] })); setFavInput(''); } }}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem', minHeight: '2rem' }}>
                  {profile.favoriteDishes.map((d, i) => (
                    <span key={i} onClick={() => setProfile(p => ({ ...p, favoriteDishes: p.favoriteDishes.filter((_, j) => j !== i) }))}
                      style={{ padding: '0.35rem 0.875rem', background: 'rgba(27,94,74,0.1)', color: '#1B5E4A', borderRadius: '999px', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {d} <span style={{ opacity: 0.5 }}>×</span>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-outline" onClick={() => setOnboardingStep('allergies')} style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
                  <button className="btn btn-forest" onClick={completeOnboarding} style={{ flex: 2, justifyContent: 'center', padding: '0.95rem' }}>
                    Save & Generate My Plan →
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── MAIN DASHBOARD ───────────────────────────────────────────
  return (
    <div className="clinical-bg" style={{ minHeight: '100vh' }}>
      <Navbar mode="clinical" />

      <div style={{ padding: '6rem 2rem 4rem', maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3AAFA9', marginBottom: '0.4rem',position:'relative',left:'5px' }}>
                Clinical Nutrition Mode
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#1B5E4A', marginBottom: '0.7rem' }}>
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 🌿
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem',position:'relative',top:'7.5px' }}>
                {profile.conditions.slice(0, 3).map(c => (
                  <span key={c} style={{ padding: '0.2rem 0.625rem', background: 'rgba(27,94,74,0.1)', color: '#1B5E4A', borderRadius: '999px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{c}</span>
                ))}
                {profile.allergies.length > 0 && (
                  <span style={{ padding: '0.2rem 0.625rem', background: 'rgba(197,48,48,0.08)', color: '#C53030', borderRadius: '999px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    {profile.allergies.length} allergen{profile.allergies.length !== 1 ? 's' : ''} flagged
                  </span>
                )}
              </div>
            </div>
            <button className="btn" onClick={handleGenerate7Day}
              style={{ background: '#1B5E4A', color: 'white', fontWeight: 600, padding: '0.875rem 1.75rem' }}>
              Generate 7-Day Plan
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(27,94,74,0.06)', borderRadius: '999px', padding: '0.25rem', marginBottom: '2rem', width: 'fit-content' }}>
          {[['overview', 'Overview'], ['plan', 'Meal Planner'], ['calendar', 'Calendar'], ['report', 'Medical Report']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer',
              borderRadius: '999px', fontFamily: 'var(--font-body)', fontSize: '0.88rem',
              background: activeTab === id ? '#1B5E4A' : 'transparent',
              color: activeTab === id ? 'white' : '#1B5E4A', fontWeight: activeTab === id ? 600 : 400,
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                {/* Quick Stats */}
                {[
                  { label: 'Active Conditions', value: profile.conditions.length, desc: profile.conditions.slice(0, 2).join(', ') || 'None recorded', color: '#1B5E4A' },
                  { label: 'Allergens Flagged', value: profile.allergies.length, desc: profile.allergies.slice(0, 2).join(', ') || 'No restrictions', color: '#C53030' },
                  { label: 'Flavour Matches', value: profile.favoriteDishes.length, desc: 'Dishes being replicated', color: '#3AAFA9' },
                ].map(s => (
                  <div key={s.label} className="card">
                    <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>{s.label}</div>
                    <div style={{ fontSize: '0.82rem', color: 'rgba(28,28,28,0.5)' }}>{s.desc}</div>
                  </div>
                ))}

                {/* Today's Quick Plan */}
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#1B5E4A', marginBottom: '1rem' }}>Today's Meal Slots</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    {MEAL_SLOTS.map(slot => {
                      const hasMeals = currentMeals[slot.id]?.length > 0;
                      return (
                        <button key={slot.id} onClick={() => { setSelectedSlot(slot.id); setActiveTab('plan'); }}
                          style={{
                            padding: '1.25rem 1rem', borderRadius: 'var(--radius-lg)',
                            border: `1.5px solid ${hasMeals ? '#1B5E4A' : 'rgba(27,94,74,0.15)'}`,
                            background: hasMeals ? 'rgba(27,94,74,0.08)' : 'white',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                          }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3AAFA9', marginBottom: '0.3rem' }}>{slot.time}</div>
                          <div style={{ fontWeight: 600, color: '#1B5E4A', fontSize: '0.95rem' }}>{slot.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(28,28,28,0.45)', marginTop: '0.25rem' }}>
                            {hasMeals ? `${currentMeals[slot.id].length} options ready` : 'Tap to generate'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* MEAL PLANNER TAB */}
          {activeTab === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              {/* Slot selector */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {MEAL_SLOTS.map(slot => (
                  <button key={slot.id} onClick={() => setSelectedSlot(slot.id)} style={{
                    padding: '0.625rem 1.25rem', borderRadius: '999px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                    background: selectedSlot === slot.id ? '#1B5E4A' : 'rgba(27,94,74,0.08)',
                    color: selectedSlot === slot.id ? 'white' : '#1B5E4A',
                    fontFamily: 'var(--font-body)', fontWeight: selectedSlot === slot.id ? 600 : 400, transition: 'all 0.2s',
                  }}>
                    {slot.label} · {slot.time}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button className="btn" onClick={handleGeneratePlan} style={{ background: '#1B5E4A', color: 'white' }}>
                  Generate {MEAL_SLOTS.find(s => s.id === selectedSlot)?.label} Options
                </button>
              </div>

              {currentMeals[selectedSlot]?.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {currentMeals[selectedSlot].map((meal, i) => (
                    <MealCard key={i} meal={meal} mode="clinical" index={i} onSubstitute={handleSubstitute}
                      onSelect={async (m) => {
                        await addMealToToday(user.id, selectedSlot, m);
                        setCurrentMeals(prev => ({ ...prev, [selectedSlot]: [m] }));
                        const plan = await getMealPlan(user.id);
                        if (plan) setWeekPlan(plan);
                        toast.success(`${m.name} added to Overview & Today!`);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(27,94,74,0.04)', borderRadius: 'var(--radius-xl)', border: '1.5px dashed rgba(27,94,74,0.2)' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'rgba(27,94,74,0.5)' }}>
                    Click "Generate" to get AI-crafted therapeutic meal options for {selectedSlot}
                  </p>
                </div>
              )}

              {/* Substitute panel */}
              <AnimatePresence>
                {substitutes && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(58,175,169,0.08)', borderRadius: 'var(--radius-xl)', border: '1.5px solid rgba(58,175,169,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h4 style={{ fontFamily: 'var(--font-display)', color: '#1B5E4A' }}>FlavorDB Substitutes for <em>{substitutes.for}</em></h4>
                      <button onClick={() => setSubstitutes(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(28,28,28,0.4)', fontSize: '1.2rem' }}>×</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      {substitutes.options.map((sub, i) => (
                        <div key={i} style={{ padding: '1rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid rgba(58,175,169,0.2)' }}>
                          <div style={{ fontWeight: 600, color: '#1B5E4A', marginBottom: '0.3rem' }}>{sub.name}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ color: 'rgba(28,28,28,0.5)' }}>{sub.flavor}</span>
                            <span style={{ color: '#3AAFA9', fontWeight: 600 }}>{sub.similarity}% match</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Calendar7Day weekPlan={weekPlan} mode="clinical"
                onSwapMeal={(day, meal) => { setSelectedSlot(meal); setActiveTab('plan'); }}
              />
            </motion.div>
          )}

          {/* REPORT TAB */}
          {activeTab === 'report' && (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Upload */}
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#1B5E4A', marginBottom: '1rem' }}>Upload Medical Report</h3>
                  <div {...getRootProps()} style={{
                    border: `2px dashed ${isDragActive ? '#1B5E4A' : 'rgba(27,94,74,0.3)'}`,
                    borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', textAlign: 'center',
                    background: isDragActive ? 'rgba(27,94,74,0.06)' : 'rgba(27,94,74,0.02)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <input {...getInputProps()} />
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }}>
                      <rect x="8" y="4" width="32" height="40" rx="4" stroke="#1B5E4A" strokeWidth="2" fill="none"/>
                      <line x1="16" y1="16" x2="32" y2="16" stroke="#1B5E4A" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2"/>
                      <line x1="16" y1="22" x2="32" y2="22" stroke="#1B5E4A" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2"/>
                      <line x1="16" y1="28" x2="24" y2="28" stroke="#1B5E4A" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2"/>
                      <path d="M28 30 L34 30 M31 27 L31 33" stroke="#3AAFA9" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <p style={{ color: '#1B5E4A', fontWeight: 500, marginBottom: '0.4rem' }}>
                      {isDragActive ? 'Drop your report here' : 'Drag & drop or click to upload'}
                    </p>
                    <p style={{ color: 'rgba(28,28,28,0.4)', fontSize: '0.82rem' }}>PDF, image, or text file</p>
                  </div>
                  {reportText && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(27,94,74,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(27,94,74,0.15)' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#1B5E4A', marginBottom: '0.4rem' }}>REPORT RECEIVED</p>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(28,28,28,0.7)', whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>{reportText.slice(0, 500)}{reportText.length > 500 ? '…' : ''}</p>
                    </div>
                  )}
                </div>

                {/* Doctor's Notes */}
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#1B5E4A', marginBottom: '1rem' }}>Describe Your Condition</h3>
                  <textarea className="input" rows={6} placeholder="Describe symptoms, doctor's instructions, or current medications…"
                    value={profile.doctorNotes}
                    onChange={e => setProfile(p => ({ ...p, doctorNotes: e.target.value }))}
                    style={{ resize: 'vertical', lineHeight: 1.6 }}
                  />
                  <p style={{ fontSize: '0.8rem', color: 'rgba(28,28,28,0.4)', marginTop: '0.5rem' }}>e.g. "Common cold for 3 days, mild fever. Doctor advised light meals."</p>
                  <button className="btn" onClick={handleGeneratePlan}
                    style={{ marginTop: '1rem', background: '#1B5E4A', color: 'white', width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                    Update Meal Plan with This Info
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
