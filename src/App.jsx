import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useContext, useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import './index.css';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ModeSelection from './pages/ModeSelection';
import ClinicalDashboard from './pages/clinical/ClinicalDashboard';
import DailyDashboard from './pages/daily/DailyDashboard';
import FitnessDashboard from './pages/fitness/FitnessDashboard';
import Preloader from './components/Preloader';

import { getCurrentUserId, getUser } from './services/mockDB';

// ── Auth Context ──────────────────────────────────────────────
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Dietary preference: 'veg' | 'nonveg' | 'both'
export const DietaryContext = createContext(null);
export const useDietary = () => useContext(DietaryContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dietaryPreference, setDietaryPreference] = useState(() => {
    try { return localStorage.getItem('pp_dietary') || 'both'; } catch { return 'both'; }
  });

  useEffect(() => {
    const init = async () => {
      const userId = getCurrentUserId();
      if (userId) {
        const userData = await getUser(userId);
        setUser(userData);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    try { localStorage.setItem('pp_dietary', dietaryPreference); } catch (_) {}
  }, [dietaryPreference]);

  if (loading) return <Preloader />;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <DietaryContext.Provider value={{ dietaryPreference, setDietaryPreference }}>
        {children}
      </DietaryContext.Provider>
    </AuthContext.Provider>
  );
}

// ── Route Guards ──────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function ModeRoute({ children, mode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (!user.mode) return <Navigate to="/select-mode" replace />;
  if (user.mode !== mode) return <Navigate to={`/${user.mode}`} replace />;
  return children;
}

// ── Page Transition Wrapper ───────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
            <LandingPage />
          </motion.div>
        } />

        <Route path="/auth" element={
          <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
            <AuthPage />
          </motion.div>
        } />

        <Route path="/select-mode" element={
          <ProtectedRoute>
            <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
              <ModeSelection />
            </motion.div>
          </ProtectedRoute>
        } />

        <Route path="/clinical" element={
          <ModeRoute mode="clinical">
            <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
              <ClinicalDashboard />
            </motion.div>
          </ModeRoute>
        } />

        <Route path="/daily" element={
          <ModeRoute mode="daily">
            <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
              <DailyDashboard />
            </motion.div>
          </ModeRoute>
        } />

        <Route path="/fitness" element={
          <ModeRoute mode="fitness">
            <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
              <FitnessDashboard />
            </motion.div>
          </ModeRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="grain-overlay" />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: '12px',
              background: '#1C1C1C',
              color: 'white',
              fontSize: '0.9rem',
            },
          }}
        />
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
// TEMPORARY SKELETON CODE
// function App() {
//   return (
//     <div style={{ padding: '50px', textAlign: 'center' }}>
//       <h1>Foodoscope Setup 🚀</h1>
//       <p>Phase 1: Environment Ready</p>
//     </div>
//   )
// }
// export default App;