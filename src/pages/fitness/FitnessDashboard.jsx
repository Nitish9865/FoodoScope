import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useDietary } from '../../App';
import { updateUser, saveMealPlan, getMealPlan, saveFitnessProfile, addMealToToday } from '../../services/mockDB';
import { generateFitnessMealPlan, calculateTDEE, generate7DayFitnessPlan } from '../../services/aiService';
import { searchRecipeByTitle, getRecipeInstructions } from '../../services/flavorAPI';
import Calendar7Day from '../../components/Calendar7Day';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import Preloader from '../../components/Preloader';
import './FitnessDashboard.css';

// ── SVG Icons ─────────────────────────────────────────────────
const DumbbellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <rect x="6" y="22" width="8" height="8" rx="2"/>
    <rect x="6" y="18" width="8" height="4" rx="1" fillOpacity="0.3" fill="currentColor"/>
    <rect x="6" y="30" width="8" height="4" rx="1" fillOpacity="0.3" fill="currentColor"/>
    <line x1="14" y1="26" x2="38" y2="26"/>
    <rect x="38" y="22" width="8" height="8" rx="2"/>
    <rect x="38" y="18" width="8" height="4" rx="1" fillOpacity="0.3" fill="currentColor"/>
    <rect x="38" y="30" width="8" height="4" rx="1" fillOpacity="0.3" fill="currentColor"/>
  </svg>
);
const FireIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);
const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);
const BoltIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const GOALS = [
  { id: 'muscle_gain', label: 'Muscle Gain', desc: 'Bulk up with high-protein meals', color: '#FF4D4D' },
  { id: 'fat_loss', label: 'Fat Loss', desc: 'Lean out with caloric deficit meals', color: '#FFD700' },
  { id: 'maintenance', label: 'Maintenance', desc: 'Maintain weight & composition', color: '#39FF14' },
  { id: 'endurance', label: 'Endurance', desc: 'Fuel long workouts & recovery', color: '#00CFFF' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', sub: '< 2 days/week' },
  { id: 'light', label: 'Light', sub: '2–3 days/week' },
  { id: 'moderate', label: 'Moderate', sub: '4–5 days/week' },
  { id: 'very_active', label: 'Very Active', sub: '6–7 days/week' },
];

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const FULL_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner'];

// MacroBar component - fills as consumed increases toward target
function MacroBar({ label, value, max, color, unit = 'g' }) {
  const safeMax = Math.max(1, max || 1);
  const pct = Math.min(100, Math.round((Math.max(0, value) / safeMax) * 100));
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'white', fontWeight: 600 }}>{Math.max(0, value)}{unit} / {max}{unit}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 4 }}
        />
      </div>
    </div>
  );
}

export default function FitnessDashboard() {
  const { user, setUser } = useAuth();
  const { dietaryPreference } = useDietary();
  const [tab, setTab] = useState('dashboard');
  const [onboarded, setOnboarded] = useState(!!user?.fitnessProfile);
  const [loading, setLoading] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Onboarding form
  const [form, setForm] = useState({
    goal: user?.fitnessProfile?.goal || '',
    weight: user?.fitnessProfile?.weight || '',
    height: user?.fitnessProfile?.height || '',
    age: user?.fitnessProfile?.age || '',
    gender: user?.fitnessProfile?.gender || 'male',
    activityLevel: user?.fitnessProfile?.activityLevel || 'moderate',
    workoutDays: user?.fitnessProfile?.workoutDays || ['Mon','Wed','Fri'],
    allergies: user?.allergies || [],
  });

  const [tdee, setTdee] = useState(user?.fitnessProfile?.tdee || null);
  const [meals, setMeals] = useState({});
  const [activeMeal, setActiveMeal] = useState('breakfast');
  const [weekPlan, setWeekPlan] = useState(null);
  const [todayConsumed, setTodayConsumed] = useState({ protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 });
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [recipeSteps, setRecipeSteps] = useState({}); // recipeKey -> steps from RecipeDB
  const [todayPlan, setTodayPlan] = useState({});

  useEffect(() => {
    getMealPlan(user?.id).then(p => {
      if (p) {
        setWeekPlan(p);
        const today = new Date().toISOString().split('T')[0];
        setTodayPlan(p[today] || p.today || {});
      }
    });
  }, [user?.id]);

  // Compute todayConsumed from todayPlan meals - bars increase as meals are added
  useEffect(() => {
    if (!todayPlan || Object.keys(todayPlan).length === 0) {
      setTodayConsumed({ protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 });
      return;
    }
    let protein = 0, carbs = 0, fat = 0, calories = 0;
    for (const slot of Object.values(todayPlan)) {
      const meal = Array.isArray(slot) ? slot[0] : slot;
      if (meal) {
        const nut = meal.nutrition || {};
        const mac = meal.macros || {};
        protein += mac.protein_g ?? nut.protein ?? 0;
        carbs += mac.carbs_g ?? nut.carbs ?? 0;
        fat += mac.fat_g ?? nut.fat ?? 0;
        calories += mac.calories ?? nut.calories ?? 0;
      }
    }
    setTodayConsumed({ protein_g: protein, carbs_g: carbs, fat_g: fat, calories });
  }, [todayPlan]);

  const toggleWorkoutDay = (day) => {
    setForm(f => ({
      ...f,
      workoutDays: f.workoutDays.includes(day) ? f.workoutDays.filter(d => d !== day) : [...f.workoutDays, day],
    }));
  };

  const completeOnboarding = async () => {
    if (!form.goal || !form.weight || !form.height) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const tdeeData = await calculateTDEE({ ...form });
      const fitnessProfile = { ...form, tdee: tdeeData };
      const updated = await updateUser(user.id, { fitnessProfile, allergies: form.allergies, onboarded: true });
      setUser(updated);
      setTdee(tdeeData);
      setOnboarded(true);
      toast.success('Performance profile locked in!');
    } catch { toast.error('Setup failed. Try again.'); }
    setLoading(false);
  };

  const generateMeal = async (mealType) => {
    setLoading(true);
    try {
      const todayIsWorkout = form.workoutDays.includes(DAYS[new Date().getDay() - 1] || 'Mon');
      const result = await generateFitnessMealPlan({
        goal: form.goal,
        weight: form.weight,
        height: form.height,
        activityLevel: form.activityLevel,
        workoutDays: form.workoutDays,
        allergies: form.allergies,
        mealType,
        isWorkoutDay: todayIsWorkout,
        dietaryPreference,
      });
      setMeals(prev => ({ ...prev, [mealType]: result.meals || [] }));
      setActiveMeal(mealType);
      setTab('meals');
      toast.success(`${mealType} options generated!`);
    } catch { toast.error('AI generation failed'); }
    setLoading(false);
  };

  const generateFullWeekPlan = async () => {
    setGeneratingPlan(true);
    try {
      const plan = await generate7DayFitnessPlan({ ...form, goal: form.goal, dietaryPreference });
      setWeekPlan(plan);
      await saveMealPlan(user.id, plan);
      setTab('calendar');
      toast.success('Performance week plan ready!');
    } catch { toast.error('Plan generation failed'); }
    setGeneratingPlan(false);
  };

  // ── ONBOARDING ────────────────────────────────────────────────
  if (!onboarded) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--fitness-bg)', padding: '5rem 1.5rem 3rem', color: 'white' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--fitness-neon)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Performance Setup
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', margin: '0.75rem 0 2rem', lineHeight: 1.1 }}>
              Build your <span style={{ color: 'var(--fitness-primary)', fontStyle: 'italic' }}>performance profile.</span>
            </h2>

            {/* Goal selection */}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.875rem' }}>Primary Goal *</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setForm(f => ({ ...f, goal: g.id }))} style={{
                  padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  border: `2px solid ${form.goal === g.id ? g.color : 'rgba(255,255,255,0.1)'}`,
                  background: form.goal === g.id ? `${g.color}15` : 'rgba(255,255,255,0.03)',
                  textAlign: 'left', transition: 'all 0.2s',
                }}>
                  <div style={{ fontWeight: 700, color: form.goal === g.id ? g.color : 'white', marginBottom: '0.2rem', fontFamily: 'var(--font-body)' }}>{g.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{g.desc}</div>
                </button>
              ))}
            </div>

            {/* Body stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem', marginBottom: '2rem' }}>
              {[
                { key: 'weight', label: 'Weight (kg)', placeholder: '75' },
                { key: 'height', label: 'Height (cm)', placeholder: '175' },
                { key: 'age', label: 'Age', placeholder: '25' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>{f.label}</label>
                  <input type="number" placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                      border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                      color: 'white', fontFamily: 'var(--font-body)', fontSize: '1rem', outline: 'none',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--fitness-primary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              ))}
            </div>

            {/* Gender */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
              {['male', 'female'].map(g => (
                <button key={g} onClick={() => setForm(f => ({ ...f, gender: g }))} style={{
                  flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  border: `1.5px solid ${form.gender === g ? 'var(--fitness-primary)' : 'rgba(255,255,255,0.1)'}`,
                  background: form.gender === g ? 'rgba(255,77,77,0.1)' : 'transparent',
                  color: form.gender === g ? 'var(--fitness-primary)' : 'rgba(255,255,255,0.6)',
                  textTransform: 'capitalize', fontFamily: 'var(--font-body)', fontWeight: 500,
                }}>
                  {g}
                </button>
              ))}
            </div>

            {/* Activity level */}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.875rem' }}>Activity Level</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
              {ACTIVITY_LEVELS.map(a => (
                <button key={a.id} onClick={() => setForm(f => ({ ...f, activityLevel: a.id }))} style={{
                  padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center',
                  border: `1.5px solid ${form.activityLevel === a.id ? 'var(--fitness-primary)' : 'rgba(255,255,255,0.08)'}`,
                  background: form.activityLevel === a.id ? 'rgba(255,77,77,0.1)' : 'rgba(255,255,255,0.02)',
                }}>
                  <div style={{ fontWeight: 600, color: form.activityLevel === a.id ? 'var(--fitness-primary)' : 'white', fontSize: '0.85rem' }}>{a.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{a.sub}</div>
                </button>
              ))}
            </div>

            {/* Workout days */}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.875rem' }}>Workout Days</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
              {DAYS.map(d => (
                <button key={d} onClick={() => toggleWorkoutDay(d)} style={{
                  flex: 1, padding: '0.625rem 0.25rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  border: `1.5px solid ${form.workoutDays.includes(d) ? 'var(--fitness-primary)' : 'rgba(255,255,255,0.08)'}`,
                  background: form.workoutDays.includes(d) ? 'rgba(255,77,77,0.15)' : 'transparent',
                  color: form.workoutDays.includes(d) ? 'var(--fitness-primary)' : 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                }}>
                  {d}
                </button>
              ))}
            </div>

            <button onClick={completeOnboarding} disabled={loading} style={{
              width: '100%', padding: '1.1rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
              background: loading ? 'rgba(255,77,77,0.4)' : 'var(--fitness-primary)', color: 'white',
              fontFamily: 'var(--font-body)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.03em',
              transition: 'all 0.2s',
            }}>
              {loading ? 'Calculating your targets…' : 'Enter Performance Mode →'}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── MAIN FITNESS DASHBOARD ────────────────────────────────────
  const fp = user?.fitnessProfile || {};
  const tdeeData = fp.tdee || tdee;
  const goalData = GOALS.find(g => g.id === fp.goal) || GOALS[0];

  const workoutCount = (fp.workoutDays || []).length;
  const targetCal = tdeeData?.targetCalories || 0;
  const tdeeVal = tdeeData?.tdee || 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fitness-bg)', color: 'white' }}>
      <Navbar mode="fitness" />

      {/* Header: PERFORMANCE MODE + Fuel Your Goals */}
      <div style={{
        padding: '5.5rem 2rem 1.5rem',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem', maxWidth: 1200, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', letterSpacing: '0.12em', color: 'var(--fitness-primary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            PERFORMANCE MODE
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Fuel Your Goals, {user?.name?.split(' ')[0] || 'Demo'} 💪
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' ,position:'relative',top:'5px'}}>
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(255,77,77,0.2)', borderRadius: '999px', fontSize: '0.78rem', color: 'var(--fitness-primary)' }}>{goalData?.label}</span>
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(255,215,0,0.15)', borderRadius: '999px', fontSize: '0.78rem', color: '#FFD700' }}>{targetCal || 0} kcal target</span>
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(57,255,20,0.15)', borderRadius: '999px', fontSize: '0.78rem', color: '#39FF14' }}>{workoutCount}x/week</span>
          </div>
        </div>
        </div>
        <button onClick={generateFullWeekPlan} disabled={generatingPlan} style={{
          padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
          background: 'var(--fitness-primary)', color: 'white', fontFamily: 'var(--font-body)', fontWeight: 600,
          fontSize: '0.9rem', boxShadow: '0 0 24px rgba(255,77,77,0.3)',
        }}>
          {generatingPlan ? 'Building…' : 'Generate 7-Day Plan'}
        </button>
      </div>

      {/* Tab navigation */}
      <div style={{
        background: 'rgba(13,13,13,0.8)', borderBottom: '1px solid rgba(255,77,77,0.15)',
        padding: '0.5rem 2rem', display: 'flex', gap: '0.5rem', justifyContent: 'center',
      }}>
        {[
          { id: 'dashboard', icon: <TargetIcon />, label: 'Dashboard' },
          { id: 'meals', icon: <BoltIcon />, label: 'Meals' },
          { id: 'calendar', icon: <CalendarIcon />, label: 'Calendar' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.875rem', transition: 'all 0.2s',
            background: tab === t.id ? 'var(--fitness-primary)' : 'rgba(255,255,255,0.05)',
            color: tab === t.id ? 'white' : 'rgba(255,255,255,0.6)',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>

            {/* Central CTA card */}
            <div style={{
              background: 'linear-gradient(135deg, #2d1515 0%, #1a0a0a 100%)',
              border: '1px solid rgba(255,77,77,0.25)', borderRadius: 'var(--radius-xl)',
              padding: '2.5rem', marginBottom: '2rem', textAlign: 'center',
            }}>
              <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>✨ Your targets are set. Ready to fuel your goals?</p>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
                Generate your first macro-optimized meal plan or browse individual meals below
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={generateFullWeekPlan} disabled={generatingPlan} style={{
                  padding: '0.875rem 1.75rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
                  background: 'var(--fitness-primary)', color: 'white', fontFamily: 'var(--font-body)', fontWeight: 600,
                  fontSize: '0.95rem', boxShadow: '0 0 24px rgba(255,77,77,0.4)',
                }}>
                  🚀 Generate Full Week Plan
                </button>
                <button onClick={() => setTab('meals')} style={{
                  padding: '0.875rem 1.75rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,77,77,0.5)',
                  background: 'rgba(255,255,255,0.05)', color: 'var(--fitness-primary)', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem',
                }}>
                  ⚡ Browse Meals
                </button>
              </div>
            </div>

            {/* Three stats cards */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem',
              marginBottom: '2rem',
            }}>
              {[
                { label: 'TOTAL DAILY ENERGY EXPENDITURE', value: tdeeVal || 0, sub: 'kcal/day (maintenance)' },
                { label: 'TARGET CALORIES', value: targetCal || 0, sub: 'for maintenance' },
                { label: 'TRAINING FREQUENCY', value: `${workoutCount}X`, sub: 'per week', color: '#39FF14' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.08)',
                  padding: '1.5rem', textAlign: 'center',
                }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{s.label}</p>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: s.color || 'var(--fitness-primary)' }}>{s.value}</div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem' }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Daily Macro Targets card */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.08)',
              padding: '2rem', marginBottom: '2rem',
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Daily Macro Targets</h3>
              <MacroBar label="PROTEIN" value={todayConsumed.protein_g} max={tdeeData?.macros?.protein_g || 150} color="var(--fitness-primary)" />
              <MacroBar label="CARBS"   value={todayConsumed.carbs_g}   max={tdeeData?.macros?.carbs_g || 250}   color="#FFD700" />
              <MacroBar label="FATS"    value={todayConsumed.fat_g}     max={tdeeData?.macros?.fat_g || 70}     color="#39FF14" />
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>CALORIES</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{todayConsumed.calories} / {targetCal || '—'}</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: targetCal ? Math.min(100, (todayConsumed.calories / targetCal) * 100) + '%' : '0%' }}
                    transition={{ duration: 0.8 }}
                    style={{ height: '100%', background: 'var(--fitness-accent)', borderRadius: 4 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                {/* Your Profile */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                    <div style={{ color: 'var(--fitness-accent)' }}><TargetIcon /></div>
                    <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.1rem' }}>Your Profile</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      ['Goal', goalData?.label],
                      ['Weight', `${fp.weight || '—'} kg`],
                      ['Activity', fp.activityLevel?.replace('_', ' ')],
                      ['Workout Days', `${(fp.workoutDays || []).length} days/week`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem' }}>{k}</div>
                        <div style={{ color: 'white', fontWeight: 600, textTransform: 'capitalize' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Planned Meals */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--fitness-accent)' }}><CalendarIcon /></div>
                    <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.1rem' }}>Today's Plan</h3>
                  </div>
                  {Object.keys(todayPlan).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {['breakfast','lunch','snack','dinner'].map(slot => {
                        const m = todayPlan[slot];
                        const meal = Array.isArray(m) ? m[0] : m;
                        return meal ? (
                          <div key={slot} style={{ padding: '0.5rem', background: 'rgba(255,77,77,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,77,77,0.2)' }}>
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{slot}</span>
                            <div style={{ fontWeight: 600, color: 'white' }}>{meal.name}</div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Add meals from the Meals tab</p>
                  )}
                </div>

                {/* Workout days */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.1rem', marginBottom: '1rem' }}>Workout Schedule</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {DAYS.map(d => {
                      const isWorkout = (fp.workoutDays || []).includes(d);
                      const isToday = DAYS[new Date().getDay() - 1] === d;
                      return (
                        <div key={d} style={{
                          flex: 1, padding: '0.625rem 0.25rem', borderRadius: 'var(--radius-sm)', textAlign: 'center',
                          background: isWorkout ? (isToday ? 'var(--fitness-primary)' : 'rgba(255,77,77,0.15)') : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isToday ? 'var(--fitness-primary)' : isWorkout ? 'rgba(255,77,77,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: isWorkout ? (isToday ? 'white' : 'var(--fitness-primary)') : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{d}</div>
                          {isWorkout && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isToday ? 'white' : 'var(--fitness-primary)', margin: '0.2rem auto 0' }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick generate meals */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--fitness-primary)' }}><DumbbellIcon /></div>
                    <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.1rem' }}>Quick Generate</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {MEAL_TYPES.map(m => (
                      <button key={m} onClick={() => { generateMeal(m); setTab('meals'); }} disabled={loading} style={{
                        padding: '0.625rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textTransform: 'capitalize',
                        border: '1px solid rgba(255,77,77,0.2)', background: 'rgba(255,77,77,0.08)',
                        color: 'var(--fitness-primary)', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.875rem',
                      }}>
                        {loading ? '…' : m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── MEALS TAB ── */}
          {tab === 'meals' && (
            <motion.div key="meals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,77,77,0.1)', paddingBottom: '1rem' }}>
                {MEAL_TYPES.map(m => (
                  <button key={m} onClick={() => { setActiveMeal(m); if (!meals[m]) generateMeal(m); }} style={{
                    padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
                    textTransform: 'capitalize', fontFamily: 'var(--font-body)', fontWeight: 500,
                    background: activeMeal === m ? 'var(--fitness-primary)' : 'rgba(255,255,255,0.05)',
                    color: activeMeal === m ? 'white' : 'rgba(255,255,255,0.6)', transition: 'all 0.2s',
                  }}>
                    {m}
                  </button>
                ))}
                <button onClick={() => generateMeal(activeMeal)} disabled={loading} style={{
                  marginLeft: 'auto', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                  border: '1px solid rgba(255,77,77,0.3)', background: 'transparent', color: 'var(--fitness-primary)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                }}>
                  {loading ? 'Generating…' : 'Regenerate'}
                </button>
              </div>

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: 280, borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.05)', animation: 'pulse-ring 2s infinite' }} />)}
                </div>
              ) : meals[activeMeal]?.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {meals[activeMeal].map((meal, i) => {
                    const mealKey = `${activeMeal}-${i}`;
                    const isExpanded = expandedMeal === mealKey;
                    
                    return (
                      <div key={i} style={{
                        background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)',
                        border: '1px solid rgba(255,77,77,0.15)', overflow: 'hidden',
                      }}>
                        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--fitness-primary), var(--fitness-accent))' }} />
                        <div style={{ padding: '1.5rem' }}>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'white', marginBottom: '0.5rem' }}>{meal.name}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: '1rem' }}>{meal.description}</p>

                          {meal.macros && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
                              {[['protein_g','P','var(--fitness-primary)'],['carbs_g','C','var(--fitness-accent)'],['fat_g','F','#FF8C00'],['calories','kcal','rgba(255,255,255,0.7)']].map(([k, l, c]) => meal.macros[k] && (
                                <div key={k} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', border: `1px solid ${c}20` }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: c }}>{meal.macros[k]}{k !== 'calories' ? 'g' : ''}</div>
                                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{l}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {meal.mealTiming && (
                            <div style={{ padding: '0.625rem 0.875rem', background: 'rgba(255,77,77,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,77,77,0.15)', marginBottom: '0.75rem' }}>
                              <p style={{ fontSize: '0.8rem', color: 'var(--fitness-primary)', fontFamily: 'var(--font-mono)' }}>
                                ⚡ {meal.mealTiming}
                              </p>
                            </div>
                          )}

                          {meal.performanceBenefit && (
                            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: '1rem' }}>{meal.performanceBenefit}</p>
                          )}

                          {/* Add to Plan button */}
                          <button
                            onClick={async () => {
                              await addMealToToday(user.id, activeMeal, meal);
                              const p = await getMealPlan(user.id);
                              if (p) setTodayPlan(p[new Date().toISOString().split('T')[0]] || p.today || {});
                              toast.success(`${meal.name} added to Today!`);
                            }}
                            style={{
                              width: '100%', padding: '0.75rem', marginBottom: '0.5rem',
                              borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                              background: 'var(--fitness-primary)', color: 'white',
                              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem',
                            }}
                          >
                            Add to My Plan
                          </button>

                          {/* Recipe Details Toggle Button */}
                          <button 
                            onClick={async () => {
                              if (isExpanded) {
                                setExpandedMeal(null);
                                return;
                              }
                              setExpandedMeal(mealKey);
                              if (!recipeSteps[mealKey] && meal.name) {
                                try {
                                  const query = meal.name.split(' ').slice(0, 3).join(' ');
                                  const recipe = await searchRecipeByTitle(query);
                                  if (recipe?.Recipe_id) {
                                    const steps = await getRecipeInstructions(recipe.Recipe_id);
                                    if (steps?.length) setRecipeSteps(s => ({ ...s, [mealKey]: steps }));
                                  }
                                } catch (_) {}
                              }
                            }}
                            style={{
                              width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(255,77,77,0.2)', 
                              background: isExpanded ? 'rgba(255,77,77,0.15)' : 'rgba(255,255,255,0.03)',
                              color: 'var(--fitness-primary)', cursor: 'pointer', 
                              fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
                              transition: 'all 0.2s', display: 'flex', alignItems: 'center', 
                              justifyContent: 'center', gap: '0.5rem'
                            }}
                          >
                            <span style={{ fontSize: '0.7rem' }}>{isExpanded ? '▼' : '▶'}</span>
                            <span>VIEW INGREDIENTS & STEPS</span>
                          </button>

                          {/* Expanded Recipe Details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}
                              >
                                {/* Ingredients Section */}
                                {meal.ingredients && meal.ingredients.length > 0 && (
                                  <div style={{ marginBottom: '1.5rem' }}>
                                    <h5 style={{ 
                                      fontFamily: 'var(--font-mono)', fontSize: '0.72rem', 
                                      textTransform: 'uppercase', letterSpacing: '0.08em', 
                                      color: 'var(--fitness-accent)', marginBottom: '0.75rem',
                                      fontWeight: 600
                                    }}>
                                      INGREDIENTS
                                    </h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                      {meal.ingredients.map((ing, idx) => (
                                        <div key={idx} style={{
                                          padding: '0.5rem 0.75rem', 
                                          background: 'rgba(255,255,255,0.04)',
                                          borderRadius: 'var(--radius-sm)', 
                                          border: '1px solid rgba(255,255,255,0.06)',
                                          fontSize: '0.85rem', 
                                          color: 'rgba(255,255,255,0.8)',
                                          display: 'flex',
                                          justifyContent: 'space-between'
                                        }}>
                                          <span style={{ color: 'white', fontWeight: 600 }}>
                                            {typeof ing === 'string' ? ing : ing.name}
                                          </span>
                                          {typeof ing === 'object' && ing.amount && (
                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                                              {ing.amount}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Preparation Steps Section - RecipeDB or fallback */}
                                {((recipeSteps[mealKey] && recipeSteps[mealKey].length > 0) || (meal.preparationSteps && meal.preparationSteps.length > 0)) && (
                                  <div>
                                    <h5 style={{ 
                                      fontFamily: 'var(--font-mono)', fontSize: '0.72rem', 
                                      textTransform: 'uppercase', letterSpacing: '0.08em', 
                                      color: 'var(--fitness-accent)', marginBottom: '0.75rem',
                                      fontWeight: 600
                                    }}>
                                      PREPARATION {recipeSteps[mealKey] ? '(RecipeDB)' : ''}
                                    </h5>
                                    <ol style={{ 
                                      margin: 0, paddingLeft: '1.25rem', 
                                      display: 'flex', flexDirection: 'column', gap: '0.625rem' 
                                    }}>
                                      {(recipeSteps[mealKey] || meal.preparationSteps || []).map((step, idx) => (
                                        <li key={idx} style={{
                                          fontSize: '0.85rem', 
                                          color: 'rgba(255,255,255,0.7)',
                                          lineHeight: 1.6
                                        }}>
                                          {typeof step === 'string' ? step : step?.step || step?.text || JSON.stringify(step)}
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Select a meal type to generate options</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── CALENDAR TAB ── */}
          {tab === 'calendar' && (
            <motion.div key="cal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'white' }}>Performance Week</h2>
                <button onClick={generateFullWeekPlan} disabled={generatingPlan} style={{
                  padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
                  background: 'var(--fitness-primary)', color: 'white', fontFamily: 'var(--font-body)', fontWeight: 600,
                  boxShadow: '0 0 20px rgba(255,77,77,0.25)',
                }}>
                  {generatingPlan ? 'Building…' : 'Regenerate Plan'}
                </button>
              </div>
              {generatingPlan ? <Preloader message="Building your performance week…" /> : (
                <Calendar7Day weekPlan={weekPlan} mode="fitness" />
              )}
            </motion.div>
          )}

        </AnimatePresence>
    </div>
  );
}