import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfWeek } from 'date-fns';

const MEALS = ['breakfast', 'lunch', 'snack', 'dinner'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' };
const MEAL_TIMES = { breakfast: '7–9 AM', lunch: '12–2 PM', snack: '4–5 PM', dinner: '7–9 PM' };

const MEAL_COLORS = {
  breakfast: { bg: 'rgba(232,164,39,0.12)', accent: '#E8A427', text: '#7A5A10' },
  lunch:     { bg: 'rgba(45,80,22,0.08)', accent: '#2D5016', text: '#2D5016' },
  snack:     { bg: 'rgba(125,155,118,0.12)', accent: '#7D9B76', text: '#4A6B43' },
  dinner:    { bg: 'rgba(196,98,45,0.10)', accent: '#C4622D', text: '#8B3A18' },
};

export default function Calendar7Day({ weekPlan = null, mode = 'daily', onSwapMeal, onLogMeal }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [view, setView] = useState('week'); // 'week' | 'day'

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getDayData = (dayName) => weekPlan?.weekPlan?.[dayName] || null;

  const isToday = (date) => format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  const isPast = (date) => date < today && !isToday(date);

  const modeColors = {
    clinical: { primary: '#1B5E4A', light: 'rgba(27,94,74,0.1)', header: 'linear-gradient(135deg, #1B5E4A, #3AAFA9)' },
    daily:    { primary: '#C4622D', light: 'rgba(196,98,45,0.1)', header: 'linear-gradient(135deg, #C4622D, #E8A427)' },
    fitness:  { primary: '#FF4D4D', light: 'rgba(255,77,77,0.1)', header: 'linear-gradient(135deg, #1C1C1C, #FF4D4D)' },
  };
  const mc = modeColors[mode];

  return (
    <div style={{
      background: 'white', borderRadius: 'var(--radius-xl)',
      border: '1px solid rgba(125,155,118,0.12)', overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{ background: mc.header, padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'white', marginBottom: '0.25rem' }}>
              Weekly Meal Calendar
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['week', 'day'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '0.4rem 1rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase',
                background: view === v ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                color: 'white', transition: 'all 0.2s',
              }}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Week view - day strip */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(125,155,118,0.1)', overflowX: 'auto' }}>
        {days.map((day, i) => {
          const dayData = getDayData(dayNames[i]);
          const mealCount = dayData ? Object.values(dayData).filter(Boolean).length : 0;
          return (
            <button key={i} onClick={() => { setSelectedDay(dayNames[i]); setView('day'); }}
              style={{
                flex: '1 0 80px', padding: '1rem 0.75rem', border: 'none', cursor: 'pointer',
                background: isToday(day) ? mc.light : 'transparent',
                borderBottom: isToday(day) ? `2px solid ${mc.primary}` : '2px solid transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!isToday(day)) e.currentTarget.style.background = 'rgba(125,155,118,0.06)'; }}
              onMouseLeave={e => { if (!isToday(day)) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', color: isToday(day) ? mc.primary : 'rgba(28,28,28,0.45)', textTransform: 'uppercase', fontWeight: isToday(day) ? 600 : 400 }}>
                {format(day, 'EEE')}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: isToday(day) ? mc.primary : isPast(day) ? 'rgba(28,28,28,0.35)' : 'var(--ink)' }}>
                {format(day, 'd')}
              </span>
              {/* Meal dots */}
              {dayData && (
                <div style={{ display: 'flex', gap: '2px' }}>
                  {MEALS.map(m => (
                    <div key={m} style={{ width: 4, height: 4, borderRadius: '50%', background: dayData[m] ? MEAL_COLORS[m].accent : 'rgba(28,28,28,0.12)' }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div style={{ padding: '1.5rem' }}>
        <AnimatePresence mode="wait">
          {view === 'week' ? (
            <motion.div key="week" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Week overview grid */}
              {weekPlan ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dayNames.map((dayName, di) => {
                    const dayData = getDayData(dayName);
                    const day = days[di];
                    return (
                      <div key={dayName} style={{
                        display: 'grid', gridTemplateColumns: '80px repeat(4, 1fr)', gap: '0.5rem',
                        alignItems: 'center',
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: isToday(day) ? mc.primary : 'var(--ink)' }}>{dayName.slice(0,3)}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(28,28,28,0.4)' }}>{format(day, 'MMM d')}</span>
                        </div>
                        {MEALS.map(meal => {
                          const mealData = dayData?.[meal];
                          const mc2 = MEAL_COLORS[meal];
                          return (
                            <div key={meal} style={{
                              padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
                              background: mealData ? mc2.bg : 'rgba(125,155,118,0.05)',
                              border: `1px solid ${mealData ? mc2.accent + '30' : 'rgba(125,155,118,0.1)'}`,
                              cursor: mealData ? 'pointer' : 'default',
                              minHeight: 48,
                            }} onClick={() => mealData && setSelectedMeal({ day: dayName, meal, data: mealData })}>
                              {mealData ? (
                                <p style={{ fontSize: '0.78rem', fontWeight: 500, color: mc2.text, lineHeight: 1.3 }}>
                                  {mealData.name || `${meal} meal`}
                                </p>
                              ) : (
                                <p style={{ fontSize: '0.75rem', color: 'rgba(28,28,28,0.25)', fontStyle: 'italic' }}>—</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ margin: '0 auto' }}>
                      <rect x="5" y="5" width="50" height="50" rx="8" stroke="var(--sage)" strokeWidth="2" strokeDasharray="4 3" fill="none"/>
                      <line x1="5" y1="20" x2="55" y2="20" stroke="var(--sage)" strokeWidth="1.5" opacity="0.5"/>
                      <line x1="5" y1="35" x2="55" y2="35" stroke="var(--sage)" strokeWidth="1.5" opacity="0.5"/>
                      <line x1="20" y1="5" x2="20" y2="55" stroke="var(--sage)" strokeWidth="1.5" opacity="0.5"/>
                      <line x1="35" y1="5" x2="35" y2="55" stroke="var(--sage)" strokeWidth="1.5" opacity="0.5"/>
                    </svg>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'rgba(28,28,28,0.5)', marginBottom: '0.5rem' }}>
                    No meal plan generated yet
                  </p>
                  <p style={{ color: 'rgba(28,28,28,0.35)', fontSize: '0.9rem' }}>
                    Use the AI planner above to generate your 7-day meal calendar
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="day" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={() => setView('week')} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: mc.primary,
                  fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}>← Week View</button>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--ink)' }}>{selectedDay || 'Monday'}</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {MEALS.map(meal => {
                  const dayData = getDayData(selectedDay || dayNames[0]);
                  const mealData = dayData?.[meal];
                  const mc2 = MEAL_COLORS[meal];
                  return (
                    <div key={meal} style={{
                      padding: '1.25rem', borderRadius: 'var(--radius-md)',
                      background: mc2.bg, border: `1.5px solid ${mc2.accent}20`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: mc2.text, fontWeight: 600 }}>{MEAL_LABELS[meal]}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(28,28,28,0.4)' }}>{MEAL_TIMES[meal]}</span>
                      </div>
                      {mealData ? (
                        <>
                          <p style={{ fontWeight: 600, color: mc2.text, marginBottom: '0.4rem', fontSize: '0.95rem' }}>{mealData.name || 'Meal'}</p>
                          {mealData.calories && <p style={{ fontSize: '0.8rem', color: 'rgba(28,28,28,0.5)' }}>{mealData.calories} kcal</p>}
                          {onLogMeal && (
                            <button onClick={() => onLogMeal(selectedDay, meal, true)} style={{
                              marginTop: '0.75rem', width: '100%', padding: '0.4rem',
                              background: mc2.accent, color: 'white', border: 'none',
                              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                              fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                            }}>Mark as eaten</button>
                          )}
                        </>
                      ) : (
                        <p style={{ color: 'rgba(28,28,28,0.3)', fontSize: '0.85rem', fontStyle: 'italic' }}>Not planned</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Meal detail popover */}
      <AnimatePresence>
        {selectedMeal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedMeal(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(28,28,28,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '2rem', maxWidth: 460, width: '100%', boxShadow: 'var(--shadow-lg)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <span className="tag tag-terra" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{selectedMeal.day} · {MEAL_LABELS[selectedMeal.meal]}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)' }}>
                    {selectedMeal.data?.name || 'Meal Details'}
                  </h3>
                </div>
                <button onClick={() => setSelectedMeal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(28,28,28,0.4)', fontSize: '1.5rem' }}>×</button>
              </div>
              {selectedMeal.data?.description && <p style={{ color: 'rgba(28,28,28,0.7)', lineHeight: 1.6, marginBottom: '1rem' }}>{selectedMeal.data.description}</p>}
              {selectedMeal.data?.nutrition && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  {Object.entries(selectedMeal.data.nutrition).map(([k, v]) => (
                    <div key={k} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: mc.primary }}>{v}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(28,28,28,0.5)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{k}</div>
                    </div>
                  ))}
                </div>
              )}
              {onSwapMeal && <button className="btn btn-outline" onClick={() => { onSwapMeal(selectedMeal.day, selectedMeal.meal); setSelectedMeal(null); }} style={{ width: '100%', justifyContent: 'center' }}>Swap this meal</button>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
