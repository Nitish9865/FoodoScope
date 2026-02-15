import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MealCard({ meal, mode = 'daily', onSelect, onSubstitute, index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const [substituteOpen, setSubstituteOpen] = useState(false);
  const [hoveredIngredient, setHoveredIngredient] = useState(null);

  if (!meal) return null;

  const modeAccent = { clinical: '#1B5E4A', daily: '#C4622D', fitness: '#FF4D4D' };
  const accent = modeAccent[mode] || '#C4622D';

  // Nutrient bar colors
  const nutrientColors = {
    calories: '#E8A427', protein: '#C4622D', carbs: '#4A7C2F', fat: '#7D9B76',
    fiber: '#3AAFA9', sugar: '#FF6B6B',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.4,0,0.2,1] }}
      style={{
        background: 'white', borderRadius: 'var(--radius-xl)',
        border: '1.5px solid rgba(125,155,118,0.12)',
        boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
        transition: 'all 0.3s var(--ease-smooth)',
      }}
    >
      {/* Card header stripe */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}80)` }} />

      <div style={{ padding: '1.5rem' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--ink)', marginBottom: '0.3rem' }}>
              {meal.name}
            </h3>
            <p style={{ color: 'rgba(28,28,28,0.6)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              {meal.description}
            </p>
          </div>

          {/* Stats chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginLeft: '1rem', alignItems: 'flex-end' }}>
            {meal.cookTime && (
              <span className="tag" style={{ background: 'rgba(125,155,118,0.1)', color: '#4A6B43', fontSize: '0.75rem' }}>
                ⏱ {meal.cookTime} min
              </span>
            )}
            {meal.flavorMatchPercent && (
              <span className="tag" style={{ background: 'rgba(232,164,39,0.12)', color: '#7A5A10', fontSize: '0.75rem' }}>
                ✦ {meal.flavorMatchPercent}% flavour match
              </span>
            )}
            {meal.difficulty && (
              <span className="tag" style={{
                background: meal.difficulty === 'easy' ? 'rgba(74,124,47,0.1)' : meal.difficulty === 'hard' ? 'rgba(229,62,62,0.1)' : 'rgba(232,164,39,0.1)',
                color: meal.difficulty === 'easy' ? '#4A7C2F' : meal.difficulty === 'hard' ? '#C53030' : '#7A5A10',
                fontSize: '0.75rem'
              }}>
                {meal.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Nutrition macro strip */}
        {meal.nutrition && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Object.keys(meal.nutrition).length}, 1fr)`, gap: '0.5rem', marginBottom: '1rem', padding: '0.875rem', background: 'var(--cream)', borderRadius: 'var(--radius-md)' }}>
            {Object.entries(meal.nutrition).map(([key, val]) => (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: nutrientColors[key] || accent }}>{val}{key === 'calories' ? '' : key === 'glycemicIndex' ? '' : 'g'}</div>
                <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'rgba(28,28,28,0.45)', letterSpacing: '0.05em', marginTop: '0.15rem' }}>{key === 'glycemicIndex' ? 'GI' : key.slice(0,6)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Fitness macros (different display) */}
        {meal.macros && (
          <div style={{ marginBottom: '1rem' }}>
            {[
              { label: 'Protein', val: meal.macros.protein_g, color: '#C4622D', max: 60 },
              { label: 'Carbs', val: meal.macros.carbs_g, color: '#4A7C2F', max: 100 },
              { label: 'Fat', val: meal.macros.fat_g, color: '#E8A427', max: 40 },
            ].map(m => (
              <div key={m.label} style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'rgba(28,28,28,0.6)', textTransform: 'uppercase' }}>{m.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: m.color }}>{m.val}g</span>
                </div>
                <div className="nutrient-bar">
                  <div className="nutrient-bar-fill" style={{ width: `${Math.min((m.val / m.max) * 100, 100)}%`, background: m.color }} />
                </div>
              </div>
            ))}
            {meal.macros.calories && <div style={{ textAlign: 'right', marginTop: '0.5rem' }}><span className="tag tag-terra" style={{ fontSize: '0.78rem' }}>{meal.macros.calories} kcal total</span></div>}
          </div>
        )}

        {/* Clinical medicinal benefits */}
        {meal.medicinalBenefits && meal.medicinalBenefits.length > 0 && (
          <div style={{ marginBottom: '1rem', padding: '0.875rem', background: 'rgba(27,94,74,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(27,94,74,0.12)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1B5E4A', marginBottom: '0.5rem' }}>Medicinal Benefits</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {meal.medicinalBenefits.map((b, i) => (
                <span key={i} style={{ background: 'rgba(27,94,74,0.1)', color: '#1B5E4A', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem' }}>{b}</span>
              ))}
            </div>
          </div>
        )}

        {/* Fitness timing badge */}
        {meal.mealTiming && (
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4D4D' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'rgba(28,28,28,0.6)' }}>
              Best consumed: <strong style={{ color: '#FF4D4D' }}>{meal.mealTiming}</strong>
            </span>
          </div>
        )}

        {/* Expand toggle */}
        <button onClick={() => setExpanded(!expanded)} style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid rgba(125,155,118,0.1)',
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(28,28,28,0.5)',
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          <span>{expanded ? 'Hide Details' : 'View Ingredients & Steps'}</span>
          <span style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>↓</span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: '1rem' }}>
                {/* Ingredients */}
                {meal.ingredients && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(28,28,28,0.4)', marginBottom: '0.5rem' }}>Ingredients</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {meal.ingredients.map((ing, i) => {
                        const name = typeof ing === 'string' ? ing : ing.name;
                        const amount = typeof ing === 'object' ? ing.amount : '';
                        return (
                          <div key={i}
                            onMouseEnter={() => setHoveredIngredient(i)}
                            onMouseLeave={() => setHoveredIngredient(null)}
                            style={{ position: 'relative', padding: '0.35rem 0.75rem', background: 'var(--cream)', borderRadius: '999px', fontSize: '0.82rem', cursor: 'default', border: '1px solid rgba(125,155,118,0.15)' }}>
                            {name}{amount ? ` — ${amount}` : ''}
                            {typeof ing === 'object' && (ing.benefit || ing.macroContribution) && hoveredIngredient === i && (
                              <div style={{ position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: 'white', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none' }}>
                                {ing.benefit || ing.macroContribution}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Prep steps */}
                {meal.preparationSteps && (
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(28,28,28,0.4)', marginBottom: '0.5rem' }}>Preparation</p>
                    <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {meal.preparationSteps.map((step, i) => (
                        <li key={i} style={{ fontSize: '0.88rem', color: 'rgba(28,28,28,0.75)', lineHeight: 1.5 }}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Substitute button */}
                {onSubstitute && (
                  <button onClick={() => onSubstitute(meal)} className="btn btn-outline" style={{ marginTop: '1rem', fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>
                    Find Ingredient Substitutes (FlavorDB)
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Select button */}
        {onSelect && (
          <button onClick={() => onSelect(meal)} className="btn" style={{
            marginTop: '1rem', background: accent, color: 'white',
            width: '100%', justifyContent: 'center', fontWeight: 600,
          }}>
            Add to My Plan
          </button>
        )}
      </div>
    </motion.div>
  );
}
