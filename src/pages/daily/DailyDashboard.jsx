import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Preloader from '../../components/Preloader';
import MealCard from '../../components/MealCard';
import Calendar7Day from '../../components/Calendar7Day';
import { useAuth, useDietary } from '../../App';
import { updateUser, getMealPlan, saveMealPlan, addMealToToday } from '../../services/mockDB';
import { generateDailyMealPlan, suggestCheatDayMeal, generate7DayDailyPlan } from '../../services/aiService';
import { getSubstitutes, getFlavorPairing } from '../../services/flavorAPI';
import './DailyDashboard.css';

const CUISINES = ['Indian', 'Mediterranean', 'Continental', 'Chinese', 'Mexican', 'Italian', 'Middle Eastern', 'South Indian', 'Bengali', 'Punjabi', 'Rajasthani', 'Thai'];
const BUDGETS = [{ id: 'low', label: 'Budget', sub: '< ₹100/meal' }, { id: 'medium', label: 'Moderate', sub: '₹100–250/meal' }, { id: 'high', label: 'Premium', sub: '> ₹250/meal' }];
const BUDGET_TOTALS = { low: 1500, medium: 2500, high: 4000 };
const MEAL_SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];

export default function DailyDashboard() {
  const { user, setUser } = useAuth();
  const { dietaryPreference } = useDietary();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [prefs, setPrefs] = useState({ cuisines: ['Indian'], budget: 'medium', familySize: 4, quickCook: true, allergies: user?.allergies || [] });
  const [weekPlan, setWeekPlan] = useState(null);
  const [meals, setMeals] = useState({});
  const [selectedSlot, setSelectedSlot] = useState('breakfast');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [cheatMeal, setCheatMeal] = useState(null);
  const [substitutes, setSubstitutes] = useState(null);
  const [favoriteFlavors, setFavoriteFlavors] = useState([]);
  const [onboarded, setOnboarded] = useState(false);
  const BUDGET_TOTALS = { low: 1500, medium: 2500, high: 4000 };
  const [dailyBudget, setDailyBudget] = useState({ used: 0, total: 2500 });
  useEffect(() => {
    setDailyBudget(prev => ({ ...prev, total: BUDGET_TOTALS[prefs?.budget] ?? 2500 }));
  }, [prefs?.budget]);

  // Reload meals when switching to Today tab or when plan updates
  const loadTodaysMeals = async () => {
    const plan = await getMealPlan(user?.id);
    const today = new Date().toISOString().split('T')[0];
    if (plan) {
      const todayPlan = plan[today] || plan.today || {};
      setMeals(prev => {
        const next = { ...prev };
        for (const [slot, meal] of Object.entries(todayPlan)) {
          if (meal) next[slot] = Array.isArray(meal) ? meal : [meal];
        }
        return next;
      });
    }
  };
  useEffect(() => { loadTodaysMeals(); }, [activeTab, user?.id]);

  // Update budget when meals change
  useEffect(() => {
    if (meals && Object.keys(meals).length > 0) {
      const totalCost = Object.values(meals)
        .flat().filter(Boolean)
        .reduce((sum, meal) => sum + (meal.estimatedCostINR || meal.cost || 0), 0);
      setDailyBudget(prev => ({ ...prev, used: totalCost }));
    }
  }, [meals]);

  useEffect(() => {
    const init = async () => {
      if (user?.preferences?.dailySetup) {
        setPrefs(p => ({ ...p, ...user.preferences }));
        setOnboarded(true);
      }
      const plan = await getMealPlan(user.id);
      if (plan) setWeekPlan(plan);
      setLoading(false);
    };
    init();
  }, [user]);

  const handleSavePrefs = async () => {
    const updated = await updateUser(user.id, { preferences: { ...prefs, dailySetup: true }, onboarded: true });
    setUser(updated);
    setOnboarded(true);
    toast.success('Preferences saved!');
    handleGenerateMeals();
  };

  const handleGenerateMeals = async () => {
    setAiLoading(true);
    setAiMsg(`Finding perfect ${selectedSlot} options for you…`);
    try {
      const result = await generateDailyMealPlan({
        familySize: prefs.familySize,
        budget: prefs.budget,
        cuisinePrefs: prefs.cuisines,
        allergies: prefs.allergies,
        quickCook: prefs.quickCook,
        mealType: selectedSlot,
        dietaryPreference,
      });
      setMeals(prev => ({ ...prev, [selectedSlot]: result.meals || [] }));
      toast.success(`${result.meals?.length || 0} options ready!`);
    } catch { toast.error('Generation failed, try again'); }
    setAiLoading(false);
  };

  const handleCheatDay = async () => {
    setAiLoading(true);
    setAiMsg('Finding your perfect guilt-free indulgence…');
    try {
      const meal = await suggestCheatDayMeal({
        remainingCalories: 600 + Math.floor(Math.random() * 400),
        cuisinePrefs: prefs.cuisines,
        allergies: prefs.allergies,
        dietaryPreference,
      });
      setCheatMeal(meal);
      setActiveTab('cheat');
    } catch { toast.error('Could not summon the cheat meal'); }
    setAiLoading(false);
  };

  const handleGenerate7Day = async () => {
    setAiLoading(true);
    setAiMsg('Building your perfect family week…');
    try {
      const plan = await generate7DayDailyPlan({ familySize: prefs.familySize, budget: prefs.budget, cuisinePrefs: prefs.cuisines, allergies: prefs.allergies, quickCook: prefs.quickCook, dietaryPreference });
      setWeekPlan(plan);
      await saveMealPlan(user.id, plan);
      toast.success('7-day family plan ready!');
      setActiveTab('calendar');
    } catch { toast.error('Failed to generate plan'); }
    setAiLoading(false);
  };

  const handleSubstitute = async (meal) => {
    const ingName = meal.ingredients?.[0]?.name || meal.ingredients?.[0] || 'butter';
    setAiLoading(true);
    setAiMsg(`Finding smart swaps for ${ingName}…`);
    const subs = await getSubstitutes(ingName);
    setSubstitutes({ for: ingName, options: subs });
    const pairings = await getFlavorPairing(ingName);
    setSubstitutes(s => ({ ...s, pairings }));
    setAiLoading(false);
  };

  if (loading) return <Preloader message="Setting up your kitchen…" />;
  if (aiLoading) return <Preloader message={aiMsg} />;

  // Onboarding
  if (!onboarded) {
    return (
      <div className="daily-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 620, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(196,98,45,0.1)', border: '2px solid rgba(196,98,45,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M8 34 C8 26 14 20 22 20" stroke="#C4622D" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <circle cx="22" cy="14" r="6" stroke="#C4622D" strokeWidth="2" fill="none"/>
                <path d="M28 34 C28 28 32 24 38 24" stroke="#E8A427" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <circle cx="38" cy="20" r="4" stroke="#E8A427" strokeWidth="2" fill="none"/>
                <ellipse cx="14" cy="36" rx="6" ry="2" stroke="#C4622D" strokeWidth="1.5" fill="none"/>
                <path d="M8 36 Q14 32 20 36" stroke="#C4622D" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--terra)', marginBottom: '0.5rem' }}>
              Let's set up your family kitchen!
            </h1>
            <p style={{ color: 'rgba(28,28,28,0.6)',position:'relative',top:'10px' }}>Quick preferences to personalize your meal planning experience.</p>
          </div>

          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(28,28,28,0.5)', marginBottom: '0.75rem' }}>Family Size</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => setPrefs(p => ({ ...p, familySize: Math.max(1, p.familySize - 1) }))} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid rgba(196,98,45,0.3)', background: 'white', cursor: 'pointer', color: 'var(--terra)', fontWeight: 700, fontSize: '1.2rem' }}>−</button>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--terra)', fontWeight: 700, position:'relative',bottom:'7.5px' }}>{prefs.familySize}</span>
                <button onClick={() => setPrefs(p => ({ ...p, familySize: p.familySize + 1 }))} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid rgba(196,98,45,0.3)', background: 'white', cursor: 'pointer', color: 'var(--terra)', fontWeight: 700, fontSize: '1.2rem' }}>+</button>
                <span style={{ color: 'rgba(28,28,28,0.5)', fontSize: '0.9rem' }}>people</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(28,28,28,0.5)', marginBottom: '0.75rem' }}>Budget</label>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                {BUDGETS.map(b => (
                  <button key={b.id} onClick={() => setPrefs(p => ({ ...p, budget: b.id }))}
                    style={{ flex: 1, padding: '0.875rem 0.5rem', borderRadius: 'var(--radius-md)', border: prefs.budget === b.id ? '2px solid var(--terra)' : '1.5px solid rgba(28,28,28,0.12)', background: prefs.budget === b.id ? 'rgba(196,98,45,0.08)' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <div style={{ fontWeight: 600, color: prefs.budget === b.id ? 'var(--terra)' : 'var(--ink)', fontSize: '0.88rem' }}>{b.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(28,28,28,0.45)', fontFamily: 'var(--font-mono)' }}>{b.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(28,28,28,0.5)', marginBottom: '0.75rem' }}>Favourite Cuisines</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {CUISINES.map(c => (
                  <button key={c} onClick={() => setPrefs(p => ({ ...p, cuisines: p.cuisines.includes(c) ? p.cuisines.filter(x => x !== c) : [...p.cuisines, c] }))}
                    style={{ padding: '0.4rem 0.875rem', borderRadius: '999px', cursor: 'pointer', border: prefs.cuisines.includes(c) ? '2px solid var(--terra)' : '1.5px solid rgba(28,28,28,0.15)', background: prefs.cuisines.includes(c) ? 'rgba(196,98,45,0.08)' : 'white', color: prefs.cuisines.includes(c) ? 'var(--terra)' : 'rgba(28,28,28,0.7)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div onClick={() => setPrefs(p => ({ ...p, quickCook: !p.quickCook }))}
                style={{ width: 44, height: 24, borderRadius: '999px', background: prefs.quickCook ? 'var(--terra)' : 'rgba(28,28,28,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: prefs.quickCook ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>Prefer quick recipes (under 30 mins)</span>
            </div>

            <button onClick={handleSavePrefs} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontWeight: 600 }}>
              Start Planning My Week →
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="daily-bg" style={{ minHeight: '100vh' }}>
      <Navbar mode="daily" />
      <div style={{ padding: '6rem 2rem 4rem', maxWidth: 1200, margin: '0 auto' }}>

        {/* Header with cheat day button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--terra)', marginBottom: '0.4rem' }}>
              Family & Daily Mode
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: 'var(--ink)', marginBottom: '0.7rem' }}>
              What's cooking, {user?.name?.split(' ')[0]}? 🍳
            </h1>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' ,position:'relative',top:'7.5px'}}>
              <span className="tag tag-terra">{prefs.familySize} people</span>
              <span className="tag tag-saffron">{BUDGETS.find(b => b.id === prefs.budget)?.label} budget</span>
              {prefs.cuisines.slice(0, 2).map(c => <span key={c} className="tag tag-green">{c}</span>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <motion.button
              onClick={handleCheatDay}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{
                padding: '0.875rem 1.5rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #E8A427, #C4622D)',
                color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem',
                boxShadow: '0 4px 20px rgba(232,164,39,0.4)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                animation: 'cheat-pulse 3s ease-in-out infinite',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L10.8 6.5H15.7L11.8 9.4L13.2 14L9 11.2L4.8 14L6.2 9.4L2.3 6.5H7.2L9 2Z" fill="white"/>
              </svg>
              Surprise Me! (Cheat Day)
            </motion.button>
            <button onClick={handleGenerate7Day} className="btn btn-primary">
              Plan My Week
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', background: 'rgba(196,98,45,0.06)', borderRadius: '999px', padding: '0.25rem', marginBottom: '2rem', width: 'fit-content' }}>
          {[['today', 'Today'], ['plan', 'Meal Planner'], ['calendar', '7-Day Calendar'], ['cheat', 'Cheat Day'], ['substitutes', 'Smart Swaps']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding: '0.5rem 1.125rem', border: 'none', cursor: 'pointer', borderRadius: '999px',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem',
              background: activeTab === id ? 'var(--terra)' : 'transparent',
              color: activeTab === id ? 'white' : 'var(--terra)', fontWeight: activeTab === id ? 600 : 400,
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>{label}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* TODAY TAB */}
          {activeTab === 'today' && (
            <motion.div key="today" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {MEAL_SLOTS.map(slot => {
                  const slotMeals = meals[slot];
                  return (
                    <div key={slot} className="daily-slot-card" onClick={() => { setSelectedSlot(slot); setActiveTab('plan'); }}>
                      <div className="daily-slot-top">
                        <div>
                          <p className="daily-slot-label">{slot}</p>
                          <p className="daily-slot-time">{slot === 'breakfast' ? '7–9 AM' : slot === 'lunch' ? '12–2 PM' : slot === 'snack' ? '4–5 PM' : '7–9 PM'}</p>
                        </div>
                        <div className="daily-slot-dot" style={{ background: slotMeals?.length ? 'var(--terra)' : 'rgba(28,28,28,0.15)' }} />
                      </div>
                      {slotMeals?.length > 0 ? (
                        <p className="daily-slot-meal">{slotMeals[0].name}</p>
                      ) : (
                        <p className="daily-slot-empty">Tap to plan</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Daily Budget Tracker */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--terra)' }}>Daily Food Budget</h3>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(28,28,28,0.5)' }}>₹{dailyBudget.used} / ₹{dailyBudget.total}</span>
                </div>
                <div className="nutrient-bar" style={{ height: 10 }}>
                  <div className="nutrient-bar-fill" style={{ width: `${(dailyBudget.used / dailyBudget.total) * 100}%`, background: 'linear-gradient(90deg, var(--terra), var(--saffron))' }} />
                </div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(28,28,28,0.5)', marginTop: '0.5rem' }}>₹{dailyBudget.total - dailyBudget.used} remaining today</p>
              </div>
            </motion.div>
          )}

          {/* MEAL PLANNER TAB */}
          {activeTab === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {MEAL_SLOTS.map(slot => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)} style={{
                    padding: '0.6rem 1.25rem', borderRadius: '999px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                    background: selectedSlot === slot ? 'var(--terra)' : 'rgba(196,98,45,0.08)',
                    color: selectedSlot === slot ? 'white' : 'var(--terra)',
                    fontFamily: 'var(--font-body)', fontWeight: selectedSlot === slot ? 600 : 400, transition: 'all 0.2s',
                    textTransform: 'capitalize',
                  }}>
                    {slot}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" onClick={handleGenerateMeals} style={{ marginBottom: '1.5rem' }}>
                Find {selectedSlot} options
              </button>
              {meals[selectedSlot]?.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {meals[selectedSlot].map((meal, i) => (
                    <MealCard key={i} meal={meal} mode="daily" index={i} onSubstitute={handleSubstitute}
                      onSelect={async (m) => {
                        await addMealToToday(user.id, selectedSlot, m);
                        setMeals(prev => ({ ...prev, [selectedSlot]: [m] }));
                        loadTodaysMeals();
                        toast.success(`${m.name} added to Today!`);
                      }} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(196,98,45,0.04)', borderRadius: 'var(--radius-xl)', border: '1.5px dashed rgba(196,98,45,0.2)' }}>
                  <p style={{ fontFamily: 'var(--font-display)', color: 'rgba(196,98,45,0.5)', fontSize: '1.1rem' }}>Click above to get delicious {selectedSlot} suggestions</p>
                </div>
              )}
            </motion.div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Calendar7Day weekPlan={weekPlan} mode="daily" onSwapMeal={(d, m) => { setSelectedSlot(m); setActiveTab('plan'); }} />
            </motion.div>
          )}

          {/* CHEAT DAY TAB */}
          {activeTab === 'cheat' && (
            <motion.div key="cheat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {cheatMeal ? (
                <div style={{ maxWidth: 560, margin: '0 auto' }}>
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                    style={{ background: 'linear-gradient(135deg, #E8A427, #C4622D)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', color: 'white', textAlign: 'center', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.75rem' }}>
                      Today's Cheat Day Pick ✦
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.75rem' }}>{cheatMeal.name}</h2>
                    <p style={{ opacity: 0.9, lineHeight: 1.6, marginBottom: '1rem' }}>{cheatMeal.description}</p>
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'inline-block' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900 }}>{cheatMeal.calories}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>calories</div>
                    </div>
                    <p style={{ marginTop: '1rem', opacity: 0.8, fontSize: '0.9rem', fontStyle: 'italic' }}>{cheatMeal.whyItWorks}</p>
                  </motion.div>
                  <button className="btn btn-primary" onClick={handleCheatDay} style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontWeight: 700 }}>
                    Give Me Another Option
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--terra)', marginBottom: '0.75rem' }}>Ready to indulge smartly?</h3>
                  <p style={{ color: 'rgba(28,28,28,0.6)', marginBottom: '2rem' }}>Click the "Surprise Me" button to get a cheat meal within your nutritional budget.</p>
                  <button className="btn btn-primary" onClick={handleCheatDay} style={{ fontSize: '1.1rem', padding: '1rem 2rem', fontWeight: 700 }}>
                    Surprise Me!
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* SMART SUBSTITUTES TAB */}
          {activeTab === 'substitutes' && (
            <motion.div key="substitutes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ maxWidth: 700 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--terra)', marginBottom: '0.5rem' }}>FlavorDB Smart Substitutions</h3>
                <p style={{ color: 'rgba(28,28,28,0.6)', marginBottom: '1.5rem' }}>Missing an ingredient? Our AI finds molecularly similar alternatives that taste just as good.</p>

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                  <input className="input" placeholder="Enter ingredient to find substitute for…" id="sub-input"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        setAiLoading(true);
                        setAiMsg(`Finding substitutes for ${e.target.value.trim()}...`);
                        
                        try {
                          const subs = await getSubstitutes(e.target.value.trim());
                          if (subs && subs.length > 0) {
                            setSubstitutes({ for: e.target.value.trim(), options: subs });
                            toast.success(`Found ${subs.length} substitutes!`);
                          } else {
                            toast.error('No substitutes found');
                          }
                        } catch (error) {
                          console.error('Substitute search error:', error);
                          toast.error('Could not find substitutes');
                        }
                        
                        setAiLoading(false);
                      }
                    }} />
                  <button className="btn btn-primary" onClick={async () => {
                    const input = document.getElementById('sub-input');
                    if (!input?.value || input.value.trim() === '') {
                      toast.error('Please enter an ingredient name');
                      return;
                    }
                    
                    setAiLoading(true);
                    setAiMsg(`Finding substitutes for ${input.value.trim()}...`);
                    
                    try {
                      const subs = await getSubstitutes(input.value.trim());
                      if (subs && subs.length > 0) {
                        setSubstitutes({ for: input.value.trim(), options: subs });
                        toast.success(`Found ${subs.length} substitutes!`);
                      } else {
                        toast.error('No substitutes found');
                      }
                    } catch (error) {
                      console.error('Substitute search error:', error);
                      toast.error('Could not find substitutes');
                    }
                    
                    setAiLoading(false);
                  }}>Find Swaps</button>
                </div>

                {substitutes && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(28,28,28,0.5)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Substitutes for "{substitutes.for}"
                    </p>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {substitutes.options.map((sub, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                          style={{ padding: '1.25rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1.5px solid rgba(196,98,45,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '1rem', marginBottom: '0.25rem' }}>{sub.name}</div>
                            <div style={{ fontSize: '0.82rem', color: 'rgba(28,28,28,0.5)' }}>Flavour: {sub.flavor} · Use ratio: {sub.usageRatio || '1:1'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--terra)' }}>{sub.similarity}%</div>
                            <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'rgba(28,28,28,0.4)', textTransform: 'uppercase' }}>flavour match</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}