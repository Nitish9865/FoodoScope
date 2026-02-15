// ============================================================
// MOCK DATABASE SERVICE
// Replace localStorage calls with real API calls when DB is ready
// All functions are async-ready for seamless DB migration
// ============================================================

const DB_PREFIX = 'pp_';

const storage = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem(DB_PREFIX + key)); }
    catch { return null; }
  },
  set: (key, value) => {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
  },
  remove: (key) => localStorage.removeItem(DB_PREFIX + key),
};

// ── User Management ──────────────────────────────────────────

export const getUser = async (userId) => {
  // TODO: Replace with: GET /api/users/:userId
  return storage.get(`user_${userId}`);
};

export const createUser = async (userData) => {
  // TODO: Replace with: POST /api/users
  const user = {
    id: userData.id || `user_${Date.now()}`,
    email: userData.email,
    name: userData.name,
    avatar: userData.avatar || null,
    provider: userData.provider || 'email',
    createdAt: new Date().toISOString(),
    mode: null,           // 'clinical' | 'daily' | 'fitness'
    onboarded: false,
    allergies: [],
    preferences: {},
    healthProfile: null,
    weeklyPlan: null,
    history: [],
  };
  storage.set(`user_${user.id}`, user);
  storage.set('current_user', user.id);
  return user;
};

export const updateUser = async (userId, updates) => {
  // TODO: Replace with: PATCH /api/users/:userId
  const user = storage.get(`user_${userId}`);
  if (!user) throw new Error('User not found');
  const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
  storage.set(`user_${userId}`, updated);
  return updated;
};

export const getCurrentUserId = () => storage.get('current_user');
export const setCurrentUser = (userId) => storage.set('current_user', userId);
export const clearSession = () => storage.remove('current_user');

// ── Mode & Onboarding ────────────────────────────────────────

export const setUserMode = async (userId, mode) => {
  return updateUser(userId, { mode, onboarded: false });
};

export const completeOnboarding = async (userId, profile) => {
  return updateUser(userId, { onboarded: true, healthProfile: profile });
};

export const isUserOnboarded = async (userId) => {
  const user = await getUser(userId);
  return user?.onboarded === true;
};

// ── Allergies & Preferences ──────────────────────────────────

export const saveAllergies = async (userId, allergies) => {
  // TODO: Replace with: POST /api/users/:userId/allergies
  return updateUser(userId, { allergies });
};

export const savePreferences = async (userId, preferences) => {
  // TODO: Replace with: POST /api/users/:userId/preferences
  return updateUser(userId, { preferences });
};

// ── Meal Plans ───────────────────────────────────────────────
// Plan structure: { weekPlan: { Monday: { breakfast, lunch, snack, dinner }, ... }, [dateKey]: { breakfast, lunch, snack, dinner } }
// dateKey = 'yyyy-MM-dd' for today's meals

export const saveMealPlan = async (userId, mealPlan) => {
  try {
    const user = storage.get(`user_${userId}`);
    if (!user) return false;
    const existing = user.weeklyPlan || {};
    const merged = { ...existing };
    if (mealPlan.weekPlan) merged.weekPlan = mealPlan.weekPlan;
    if (mealPlan.today) merged.today = { ...(merged.today || {}), ...mealPlan.today };
    for (const [k, v] of Object.entries(mealPlan)) {
      if (k !== 'weekPlan' && k !== 'today' && v && typeof v === 'object') merged[k] = v;
    }
    const updated = { ...user, weeklyPlan: merged };
    storage.set(`user_${userId}`, updated);
    return true;
  } catch (error) {
    console.error('Save meal plan error:', error);
    return false;
  }
};

export const getMealPlan = async (userId) => {
  const user = storage.get(`user_${userId}`);
  return user?.weeklyPlan || null;
};

export const addMealToToday = async (userId, mealSlot, meal) => {
  const today = new Date().toISOString().split('T')[0];
  const user = storage.get(`user_${userId}`);
  if (!user) return false;
  const plan = user.weeklyPlan || {};
  const todayPlan = plan[today] || plan.today || {};
  const updatedToday = { ...todayPlan, [mealSlot]: meal };
  const merged = { ...plan, [today]: updatedToday, today: updatedToday };
  storage.set(`user_${userId}`, { ...user, weeklyPlan: merged });
  return true;
};

export const getMealHistory = async (userId) => {
  // TODO: Replace with: GET /api/users/:userId/meal-plans/history
  const user = await getUser(userId);
  return user?.history || [];
};

export const logMealConsumption = async (userId, day, meal, consumed) => {
  // TODO: Replace with: POST /api/users/:userId/meal-logs
  const user = await getUser(userId);
  const log = {
    date: new Date().toISOString(),
    day, meal, consumed,
  };
  const history = [...(user?.history || []), log];
  return updateUser(userId, { history });
};

// ── Clinical Data ─────────────────────────────────────────────

export const saveClinicalReport = async (userId, report) => {
  // TODO: Replace with: POST /api/users/:userId/clinical-reports
  return updateUser(userId, { clinicalReport: report });
};

export const getClinicalReport = async (userId) => {
  const user = await getUser(userId);
  return user?.clinicalReport || null;
};

// ── Fitness Data ──────────────────────────────────────────────

export const saveFitnessProfile = async (userId, profile) => {
  // TODO: Replace with: POST /api/users/:userId/fitness-profile
  return updateUser(userId, { fitnessProfile: profile });
};

export const logWorkout = async (userId, workout) => {
  // TODO: Replace with: POST /api/users/:userId/workouts
  const user = await getUser(userId);
  const workouts = [...(user?.workouts || []), { ...workout, date: new Date().toISOString() }];
  return updateUser(userId, { workouts });
};

// ── Demo Data Seeder ─────────────────────────────────────────

export const seedDemoUser = () => {
  const userId = 'demo_user';
  if (!storage.get(`user_${userId}`)) {
    storage.set(`user_${userId}`, {
      id: userId,
      email: 'demo@palateplan.app',
      name: 'Demo User',
      avatar: null,
      provider: 'email',
      createdAt: new Date().toISOString(),
      mode: null,
      onboarded: false,
      allergies: [],
      preferences: { cuisines: ['Indian', 'Mediterranean'], budget: 'medium' },
      healthProfile: null,
      weeklyPlan: null,
      history: [],
    });
  }
  return userId;
};

export default { getUser, createUser, updateUser, getCurrentUserId, setCurrentUser,
  clearSession, setUserMode, completeOnboarding, isUserOnboarded,
  saveAllergies, savePreferences, saveMealPlan, getMealPlan, getMealHistory,
  logMealConsumption, saveClinicalReport, getClinicalReport,
  saveFitnessProfile, logWorkout, seedDemoUser };
