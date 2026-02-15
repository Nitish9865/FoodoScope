# 🍽️ Palate Planner — IIIT Delhi · Fork It Challenge 2025

> **Ending Decision Fatigue, One Meal at a Time**

AI-powered weekly meal scheduling with constraint-based optimization.  
Built for the Symposium on Computational Gastronomy.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── LandingPage.jsx         — GSAP animated landing page
│   ├── AuthPage.jsx            — Google OAuth + email/password login
│   ├── ModeSelection.jsx       — First-visit mode picker (Clinical/Daily/Fitness)
│   ├── clinical/
│   │   ├── ClinicalDashboard.jsx  — Therapeutic meal planning UI (sage/green)
│   │   └── ClinicalDashboard.css
│   ├── daily/
│   │   ├── DailyDashboard.jsx  — Family meal planning UI (terracotta/warm)
│   │   └── DailyDashboard.css
│   └── fitness/
│       └── FitnessDashboard.jsx   — Performance nutrition UI (dark/red)
├── components/
│   ├── Calendar7Day.jsx        — Universal 7-day meal calendar
│   ├── MealCard.jsx            — Reusable meal display card
│   ├── Preloader.jsx           — Page transition loader
│   └── Navbar.jsx
├── services/
│   ├── aiService.js            — Claude AI integration (all 3 modes)
│   ├── flavorAPI.js            — FlavorDB API stub (ready for real key)
│   └── mockDB.js               — Database layer (localStorage → real DB)
└── index.css                   — Global design system & CSS variables
```

---

## 🔑 API Keys Setup (At Hackathon)

### 1. FlavorDB API
Open `src/services/flavorAPI.js` and fill in:
```javascript
const BASE_URL = 'YOUR_FLAVORDB_BASE_URL';
const API_KEY  = 'YOUR_FLAVORDB_API_KEY';
```
Then uncomment the real `apiCall()` usage in each function.

### 2. RecipeDB API
The AI service uses Claude and currently has mock recipe data.
When you receive the RecipeDB key, add integration in `src/services/aiService.js`.

### 3. Google OAuth
Open `src/pages/AuthPage.jsx` and fill in:
```javascript
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
```
Then implement the OAuth flow (or use Firebase Auth).

### 4. Real Database (PostgreSQL / Firebase)
Replace `localStorage` calls in `src/services/mockDB.js`:
- Every function has a `// TODO: Replace with: GET/POST /api/...` comment
- The API is async-ready — zero refactoring needed
- Just swap the implementations

---

## 🎨 Design System

| Variable | Value | Use |
|---|---|---|
| `--cream` | `#FBF7F0` | Primary background |
| `--forest` | `#1E3A0F` | Clinical mode primary |
| `--terra` | `#C4622D` | Daily mode primary / accents |
| `--fitness-bg` | `#0D0D0D` | Fitness mode background |
| `--fitness-primary` | `#FF4D4D` | Fitness accents |
| `--font-display` | Playfair Display | Headings |
| `--font-body` | DM Sans | Body text |
| `--font-mono` | DM Mono | Labels, tags, stats |

---

## 🤖 AI Features

### Clinical Mode
- Analyzes medical conditions + doctor reports
- Generates therapeutic meals that fight specific conditions
- Replicates favourite dish flavours using FlavorDB molecular data
- Tracks allergens permanently per user

### Daily / Family Mode  
- Budget-conscious family meal planning
- Smart ingredient substitutions (FlavorDB)
- Cheat Day button (calorie-budget aware)
- Quick cook filters (< 30 mins)

### Fitness Mode
- TDEE & macro calculation
- Workout-day vs rest-day meal differentiation
- Pre/post workout meal timing
- Goal-specific optimization (muscle gain, fat loss, endurance)

---

## 📊 Database Schema (mockDB → real DB)

```javascript
User {
  id, email, name, avatar, provider
  mode: 'clinical' | 'daily' | 'fitness'
  onboarded: boolean
  allergies: string[]
  healthProfile: { conditions, severity, favDishes, doctorNotes }
  fitnessProfile: { goal, weight, height, activityLevel, workoutDays, tdee }
  preferences: { cuisines, budget, familySize }
  weeklyPlan: WeekPlan
  history: MealLog[]
}
```

---

## 👥 Team Palate Planner

| Member | Role |
|---|---|
| Vinyas | Lead Developer / Architecture |
| Shambhavi | Frontend / UI |
| Nayan | AI Integration |
| Nitish | Backend / Database |

**IIIT Delhi · Fork It Challenge 2025**  
*Winning projects showcased at Symposium on Computational Gastronomy*
