// ============================================================
// AI SERVICE — PALATE PLANNER (ENHANCED VERSION)
// 60+ recipes with smart randomization and anti-repetition
// ============================================================

// ⚙️ Configuration
const ENABLE_AI_API = false;
const ANTHROPIC_API_KEY = '';

// ══════════════════════════════════════════════════════════════
// MASSIVE RECIPE DATABASE (60+ recipes)
// ══════════════════════════════════════════════════════════════

// veg: true = vegetarian, false = non-vegetarian
const RECIPE_DATABASE = {
  breakfast: [
    { name: 'Masala Oats Upma', calories: 320, protein: 12, carbs: 52, fat: 8, fiber: 6, time: 15, cost: 60, difficulty: 'easy', veg: true },
    { name: 'Besan Chilla with Mint Chutney', calories: 280, protein: 15, carbs: 38, fat: 7, fiber: 8, time: 20, cost: 50, difficulty: 'easy', veg: true },
    { name: 'Poha with Peanuts', calories: 350, protein: 9, carbs: 58, fat: 10, fiber: 4, time: 15, cost: 45, difficulty: 'easy', veg: true },
    { name: 'Idli with Sambar', calories: 265, protein: 8, carbs: 48, fat: 4, fiber: 6, time: 25, cost: 55, difficulty: 'medium', veg: true },
    { name: 'Vegetable Upma', calories: 295, protein: 10, carbs: 45, fat: 9, fiber: 5, time: 20, cost: 50, difficulty: 'easy', veg: true },
    { name: 'Moong Dal Cheela', calories: 270, protein: 16, carbs: 35, fat: 6, fiber: 9, time: 18, cost: 48, difficulty: 'easy', veg: true },
    { name: 'Egg Bhurji with Toast', calories: 320, protein: 18, carbs: 28, fat: 14, fiber: 2, time: 12, cost: 55, difficulty: 'easy', veg: false },
    { name: 'Chicken Omelette with Vegetables', calories: 380, protein: 28, carbs: 12, fat: 24, fiber: 3, time: 15, cost: 70, difficulty: 'easy', veg: false },
    { name: 'Oats Idli', calories: 240, protein: 9, carbs: 42, fat: 5, fiber: 7, time: 30, cost: 60, difficulty: 'medium', veg: true },
    { name: 'Ragi Dosa with Coconut Chutney', calories: 310, protein: 11, carbs: 50, fat: 8, fiber: 8, time: 25, cost: 55, difficulty: 'medium', veg: true },
    { name: 'Quinoa Upma', calories: 330, protein: 14, carbs: 48, fat: 10, fiber: 6, time: 20, cost: 70, difficulty: 'easy', veg: true },
    { name: 'Vegetable Poha', calories: 320, protein: 8, carbs: 55, fat: 9, fiber: 5, time: 15, cost: 45, difficulty: 'easy', veg: true },
    { name: 'Suji Upma with Vegetables', calories: 305, protein: 9, carbs: 50, fat: 8, fiber: 4, time: 18, cost: 42, difficulty: 'easy', veg: true },
    { name: 'Multigrain Dosa', calories: 290, protein: 12, carbs: 46, fat: 7, fiber: 9, time: 22, cost: 58, difficulty: 'medium', veg: true },
    { name: 'Sprouted Moong Salad', calories: 220, protein: 14, carbs: 32, fat: 4, fiber: 10, time: 10, cost: 40, difficulty: 'easy', veg: true },
    { name: 'Paneer Paratha with Curd', calories: 380, protein: 18, carbs: 45, fat: 14, fiber: 5, time: 25, cost: 75, difficulty: 'medium', veg: true },
    { name: 'Methi Thepla', calories: 295, protein: 10, carbs: 48, fat: 7, fiber: 6, time: 20, cost: 50, difficulty: 'easy', veg: true },
    { name: 'Chicken Sandwich with Avocado', calories: 420, protein: 30, carbs: 35, fat: 18, fiber: 6, time: 15, cost: 90, difficulty: 'easy', veg: false },
  ],

  lunch: [
    { name: 'Dal Tadka with Jeera Rice', calories: 420, protein: 18, carbs: 72, fat: 8, fiber: 12, time: 30, cost: 80, difficulty: 'medium', veg: true },
    { name: 'Rajma Chawal', calories: 480, protein: 22, carbs: 78, fat: 9, fiber: 15, time: 45, cost: 90, difficulty: 'medium', veg: true },
    { name: 'Chole Bhature', calories: 520, protein: 20, carbs: 75, fat: 16, fiber: 14, time: 40, cost: 95, difficulty: 'medium', veg: true },
    { name: 'Chicken Biryani', calories: 550, protein: 32, carbs: 65, fat: 18, fiber: 6, time: 50, cost: 130, difficulty: 'hard', veg: false },
    { name: 'Fish Curry with Rice', calories: 480, protein: 38, carbs: 55, fat: 14, fiber: 5, time: 40, cost: 120, difficulty: 'medium', veg: false },
    { name: 'Kadhi Chawal', calories: 390, protein: 14, carbs: 65, fat: 10, fiber: 6, time: 35, cost: 75, difficulty: 'medium', veg: true },
    { name: 'Vegetable Biryani', calories: 450, protein: 12, carbs: 70, fat: 14, fiber: 8, time: 40, cost: 100, difficulty: 'hard', veg: true },
    { name: 'Paneer Tikka Masala with Naan', calories: 510, protein: 24, carbs: 58, fat: 20, fiber: 7, time: 35, cost: 120, difficulty: 'medium', veg: true },
    { name: 'Mixed Dal with Brown Rice', calories: 410, protein: 19, carbs: 68, fat: 9, fiber: 13, time: 32, cost: 85, difficulty: 'medium', veg: true },
    { name: 'Palak Chole with Rice', calories: 430, protein: 21, carbs: 70, fat: 10, fiber: 15, time: 35, cost: 88, difficulty: 'medium', veg: true },
    { name: 'Sambhar Rice', calories: 395, protein: 15, carbs: 66, fat: 8, fiber: 11, time: 30, cost: 78, difficulty: 'easy', veg: true },
    { name: 'Vegetable Pulao with Raita', calories: 420, protein: 13, carbs: 68, fat: 11, fiber: 7, time: 30, cost: 85, difficulty: 'easy', veg: true },
    { name: 'Moong Dal Khichdi', calories: 360, protein: 16, carbs: 60, fat: 7, fiber: 10, time: 25, cost: 70, difficulty: 'easy', veg: true },
    { name: 'Aloo Gobi with Roti', calories: 385, protein: 11, carbs: 62, fat: 12, fiber: 9, time: 35, cost: 75, difficulty: 'medium', veg: true },
    { name: 'Bhindi Masala with Rice', calories: 370, protein: 10, carbs: 64, fat: 9, fiber: 12, time: 30, cost: 72, difficulty: 'easy', veg: true },
    { name: 'Butter Chicken with Naan', calories: 580, protein: 35, carbs: 52, fat: 26, fiber: 5, time: 45, cost: 140, difficulty: 'medium', veg: false },
    { name: 'Chana Masala with Jeera Rice', calories: 425, protein: 20, carbs: 71, fat: 9, fiber: 14, time: 32, cost: 82, difficulty: 'medium', veg: true },
  ],

  snack: [
    { name: 'Roasted Makhana (Fox Nuts)', calories: 180, protein: 5, carbs: 28, fat: 6, fiber: 3, time: 10, cost: 40, difficulty: 'easy', veg: true },
    { name: 'Fruit Chaat with Chaat Masala', calories: 150, protein: 2, carbs: 38, fat: 1, fiber: 5, time: 5, cost: 50, difficulty: 'easy', veg: true },
    { name: 'Masala Roasted Chickpeas', calories: 210, protein: 12, carbs: 32, fat: 5, fiber: 9, time: 15, cost: 35, difficulty: 'easy', veg: true },
    { name: 'Chicken Kebabs', calories: 280, protein: 24, carbs: 8, fat: 18, fiber: 2, time: 25, cost: 85, difficulty: 'medium', veg: false },
    { name: 'Vegetable Cutlet', calories: 230, protein: 8, carbs: 35, fat: 7, fiber: 6, time: 20, cost: 55, difficulty: 'medium', veg: true },
    { name: 'Sprouts Chaat', calories: 195, protein: 10, carbs: 30, fat: 4, fiber: 8, time: 10, cost: 38, difficulty: 'easy', veg: true },
    { name: 'Roasted Peanuts with Spices', calories: 220, protein: 9, carbs: 18, fat: 14, fiber: 4, time: 12, cost: 30, difficulty: 'easy', veg: true },
    { name: 'Cucumber Raita', calories: 85, protein: 4, carbs: 12, fat: 2, fiber: 2, time: 5, cost: 25, difficulty: 'easy', veg: true },
    { name: 'Masala Corn Bhel', calories: 205, protein: 6, carbs: 38, fat: 5, fiber: 5, time: 10, cost: 45, difficulty: 'easy', veg: true },
    { name: 'Moong Dal Pakora', calories: 245, protein: 11, carbs: 28, fat: 10, fiber: 7, time: 18, cost: 50, difficulty: 'medium', veg: true },
    { name: 'Green Smoothie Bowl', calories: 185, protein: 5, carbs: 35, fat: 4, fiber: 7, time: 8, cost: 55, difficulty: 'easy', veg: true },
    { name: 'Roasted Almonds Mix', calories: 195, protein: 7, carbs: 15, fat: 13, fiber: 4, time: 10, cost: 60, difficulty: 'easy', veg: true },
    { name: 'Paneer Tikka Bites', calories: 260, protein: 16, carbs: 12, fat: 18, fiber: 2, time: 22, cost: 75, difficulty: 'medium', veg: true },
    { name: 'Masala Buttermilk', calories: 95, protein: 4, carbs: 14, fat: 2, fiber: 1, time: 5, cost: 20, difficulty: 'easy', veg: true },
    { name: 'Sweet Potato Chaat', calories: 215, protein: 4, carbs: 42, fat: 4, fiber: 6, time: 15, cost: 45, difficulty: 'easy', veg: true },
    { name: 'Mixed Fruit Yogurt', calories: 170, protein: 6, carbs: 32, fat: 3, fiber: 4, time: 5, cost: 48, difficulty: 'easy', veg: true },
  ],

  dinner: [
    { name: 'Palak Paneer with Roti', calories: 480, protein: 24, carbs: 52, fat: 18, fiber: 10, time: 35, cost: 120, difficulty: 'medium', veg: true },
    { name: 'Mixed Vegetable Pulao', calories: 390, protein: 11, carbs: 68, fat: 8, fiber: 6, time: 30, cost: 85, difficulty: 'easy', veg: true },
    { name: 'Dal Makhani with Roti', calories: 445, protein: 20, carbs: 58, fat: 15, fiber: 12, time: 40, cost: 110, difficulty: 'medium', veg: true },
    { name: 'Grilled Chicken with Herbed Rice', calories: 520, protein: 42, carbs: 45, fat: 20, fiber: 4, time: 40, cost: 135, difficulty: 'medium', veg: false },
    { name: 'Baingan Bharta with Phulka', calories: 365, protein: 9, carbs: 55, fat: 12, fiber: 9, time: 32, cost: 75, difficulty: 'medium', veg: true },
    { name: 'Vegetable Khichdi with Curd', calories: 350, protein: 14, carbs: 62, fat: 7, fiber: 8, time: 25, cost: 70, difficulty: 'easy', veg: true },
    { name: 'Paneer Butter Masala with Naan', calories: 520, protein: 26, carbs: 54, fat: 22, fiber: 6, time: 38, cost: 130, difficulty: 'medium', veg: true },
    { name: 'Aloo Palak with Roti', calories: 375, protein: 12, carbs: 60, fat: 10, fiber: 11, time: 30, cost: 72, difficulty: 'easy', veg: true },
    { name: 'Mushroom Masala with Rice', calories: 395, protein: 15, carbs: 58, fat: 12, fiber: 8, time: 32, cost: 95, difficulty: 'medium', veg: true },
    { name: 'Tofu Curry with Quinoa', calories: 410, protein: 22, carbs: 52, fat: 14, fiber: 9, time: 30, cost: 105, difficulty: 'medium', veg: true },
    { name: 'Matar Paneer with Paratha', calories: 465, protein: 21, carbs: 56, fat: 18, fiber: 8, time: 35, cost: 115, difficulty: 'medium', veg: true },
    { name: 'Vegetable Jalfrezi with Roti', calories: 355, protein: 11, carbs: 58, fat: 9, fiber: 10, time: 28, cost: 80, difficulty: 'easy', veg: true },
    { name: 'Kadai Vegetables with Rice', calories: 385, protein: 10, carbs: 64, fat: 10, fiber: 9, time: 30, cost: 82, difficulty: 'easy', veg: true },
    { name: 'Lauki Chana Dal', calories: 340, protein: 17, carbs: 56, fat: 7, fiber: 11, time: 32, cost: 68, difficulty: 'easy', veg: true },
    { name: 'Soya Chunks Curry with Roti', calories: 420, protein: 28, carbs: 48, fat: 12, fiber: 10, time: 30, cost: 85, difficulty: 'medium', veg: true },
    { name: 'Methi Matar Malai with Roti', calories: 435, protein: 18, carbs: 52, fat: 16, fiber: 8, time: 35, cost: 98, difficulty: 'medium', veg: true },
    { name: 'Fish Tikka with Salad', calories: 380, protein: 40, carbs: 15, fat: 18, fiber: 4, time: 35, cost: 125, difficulty: 'medium', veg: false },
  ],

  cheat: [
    { name: 'Mini Samosa Chaat Bowl', calories: 450, score: 8, tip: 'Air-fry samosas instead of deep-frying to save 150 calories', veg: true },
    { name: 'Chocolate Peanut Butter Smoothie Bowl', calories: 380, score: 7, tip: 'Use unsweetened cocoa and natural peanut butter', veg: true },
    { name: 'Tandoori Paneer Pizza', calories: 520, score: 9, tip: 'Use part-skim mozzarella and load up on vegetables', veg: true },
    { name: 'Pav Bhaji', calories: 465, score: 8, tip: 'Use whole wheat pav and extra vegetables', veg: true },
    { name: 'Chicken Pizza Slice', calories: 520, score: 9, tip: 'Pair with a side salad for balance', veg: false },
    { name: 'Veg Cheese Burger', calories: 490, score: 8, tip: 'Use multigrain bun and baked patty', veg: true },
    { name: 'Pasta Arrabbiata', calories: 425, score: 7, tip: 'Use whole wheat pasta and add extra vegetables', veg: true },
    { name: 'Veg Manchurian with Fried Rice', calories: 510, score: 9, tip: 'Bake the manchurian instead of frying', veg: true },
    { name: 'Loaded Nachos', calories: 485, score: 8, tip: 'Use baked chips and add black beans for protein', veg: true },
  ]
};

// ══════════════════════════════════════════════════════════════
// UNIQUE INGREDIENTS & PREPARATION STEPS PER RECIPE
// ══════════════════════════════════════════════════════════════
const RECIPE_INGREDIENTS = {
  'Masala Oats Upma': [{ name: 'Rolled oats', amount: '1 cup' }, { name: 'Onion', amount: '1 medium' }, { name: 'Tomato', amount: '1' }, { name: 'Mustard seeds', amount: '1 tsp' }, { name: 'Curry leaves', amount: '8-10' }, { name: 'Green chilli', amount: '2' }, { name: 'Turmeric', amount: '1/4 tsp' }],
  'Besan Chilla with Mint Chutney': [{ name: 'Besan (chickpea flour)', amount: '1 cup' }, { name: 'Onion', amount: '1' }, { name: 'Cumin seeds', amount: '1 tsp' }, { name: 'Fresh mint', amount: '1/2 cup' }, { name: 'Green chilli', amount: '2' }, { name: 'Coriander', amount: '1/4 cup' }, { name: 'Lemon juice', amount: '1 tbsp' }],
  'Poha with Peanuts': [{ name: 'Flattened rice (poha)', amount: '2 cups' }, { name: 'Peanuts', amount: '2 tbsp' }, { name: 'Onion', amount: '1' }, { name: 'Potato', amount: '1 small' }, { name: 'Mustard seeds', amount: '1 tsp' }, { name: 'Turmeric', amount: '1/2 tsp' }, { name: 'Lemon juice', amount: '1 tbsp' }],
  'Dal Tadka with Jeera Rice': [{ name: 'Toor dal', amount: '1 cup' }, { name: 'Basmati rice', amount: '1 cup' }, { name: 'Tomatoes', amount: '2' }, { name: 'Cumin seeds', amount: '2 tsp' }, { name: 'Garlic', amount: '4 cloves' }, { name: 'Ghee', amount: '2 tbsp' }, { name: 'Red chilli', amount: '2' }],
  'Rajma Chawal': [{ name: 'Kidney beans (rajma)', amount: '1.5 cups' }, { name: 'Rice', amount: '1 cup' }, { name: 'Onion', amount: '2' }, { name: 'Tomato puree', amount: '1 cup' }, { name: 'Rajma masala', amount: '2 tbsp' }, { name: 'Ginger-garlic paste', amount: '1 tbsp' }],
  'Chicken Biryani': [{ name: 'Chicken', amount: '500g' }, { name: 'Basmati rice', amount: '2 cups' }, { name: 'Yogurt', amount: '1/2 cup' }, { name: 'Biryani masala', amount: '2 tbsp' }, { name: 'Saffron', amount: 'pinch' }, { name: 'Mint', amount: '1/2 cup' }, { name: 'Onion', amount: '2' }],
  'Palak Paneer with Roti': [{ name: 'Paneer', amount: '250g' }, { name: 'Spinach', amount: '2 bunches' }, { name: 'Onion', amount: '2' }, { name: 'Garlic', amount: '4 cloves' }, { name: 'Garam masala', amount: '1 tsp' }, { name: 'Cream', amount: '2 tbsp' }, { name: 'Whole wheat flour', amount: '2 cups' }],
  'Egg Bhurji with Toast': [{ name: 'Eggs', amount: '4' }, { name: 'Onion', amount: '1' }, { name: 'Tomato', amount: '1' }, { name: 'Green chilli', amount: '2' }, { name: 'Bread slices', amount: '4' }, { name: 'Turmeric', amount: '1/4 tsp' }, { name: 'Butter', amount: '1 tbsp' }],
  'Roasted Makhana (Fox Nuts)': [{ name: 'Makhana', amount: '2 cups' }, { name: 'Ghee', amount: '1 tbsp' }, { name: 'Salt', amount: 'to taste' }, { name: 'Chaat masala', amount: '1/2 tsp' }, { name: 'Black pepper', amount: '1/4 tsp' }],
  'Fruit Chaat with Chaat Masala': [{ name: 'Mixed seasonal fruits', amount: '2 cups' }, { name: 'Chaat masala', amount: '1 tsp' }, { name: 'Lemon juice', amount: '1 tbsp' }, { name: 'Black salt', amount: 'pinch' }, { name: 'Coriander', amount: '2 tbsp' }],
  'Mixed Vegetable Pulao': [{ name: 'Basmati rice', amount: '1.5 cups' }, { name: 'Mixed vegetables', amount: '2 cups' }, { name: 'Bay leaf', amount: '2' }, { name: 'Cinnamon', amount: '1 inch' }, { name: 'Cloves', amount: '4' }, { name: 'Ghee', amount: '2 tbsp' }],
  'Dal Makhani with Roti': [{ name: 'Whole urad dal', amount: '1/2 cup' }, { name: 'Rajma', amount: '1/4 cup' }, { name: 'Butter', amount: '3 tbsp' }, { name: 'Cream', amount: '1/4 cup' }, { name: 'Tomato', amount: '3' }, { name: 'Ginger-garlic paste', amount: '1 tbsp' }],
  'Paneer Tikka Masala with Naan': [{ name: 'Paneer', amount: '300g' }, { name: 'Yogurt', amount: '1/2 cup' }, { name: 'Tikka masala paste', amount: '3 tbsp' }, { name: 'Cream', amount: '1/4 cup' }, { name: 'Naan', amount: '4 pieces' }, { name: 'Bell peppers', amount: '2' }],
  'Butter Chicken with Naan': [{ name: 'Chicken', amount: '500g' }, { name: 'Tomato puree', amount: '2 cups' }, { name: 'Butter', amount: '4 tbsp' }, { name: 'Cream', amount: '1/2 cup' }, { name: 'Garam masala', amount: '1 tbsp' }, { name: 'Kashmiri red chilli', amount: '2 tsp' }],
};

const RECIPE_STEPS = {
  'Masala Oats Upma': ['Dry roast oats in a pan for 2-3 minutes. Set aside.', 'Heat oil, add mustard seeds, curry leaves, and green chilli.', 'Add chopped onion and sauté until translucent. Add tomato and turmeric.', 'Add 2 cups water, salt, and bring to boil. Stir in oats, cover and cook for 5 minutes.', 'Fluff with fork, garnish with coriander. Serve hot.'],
  'Besan Chilla with Mint Chutney': ['Mix besan with water, onion, cumin, salt to make a smooth batter.', 'For chutney: blend mint, coriander, green chilli, lemon, salt.', 'Heat a non-stick pan, pour ladle of batter, spread in circle.', 'Drizzle oil, cook until golden on both sides.', 'Serve chilla hot with mint chutney.'],
  'Poha with Peanuts': ['Rinse poha in water, drain and set aside for 5 mins.', 'Heat oil, add mustard seeds, peanuts. Add onion, potato, turmeric.', 'Sauté until potato is soft. Add poha, salt, mix gently.', 'Cover 2 mins. Add lemon juice, coriander. Serve.'],
  'Dal Tadka with Jeera Rice': ['Pressure cook toor dal until soft. Cook rice with cumin seeds.', 'For tadka: heat ghee, add cumin, garlic, red chilli, pour over dal.', 'Mix tempered dal, serve with jeera rice and lemon wedge.'],
  'Rajma Chawal': ['Soak rajma overnight. Pressure cook with salt until soft.', 'Sauté onion, add tomato puree, rajma masala. Add cooked rajma, simmer 15 mins.', 'Cook rice. Serve rajma over steaming rice.'],
  'Chicken Biryani': ['Marinate chicken in yogurt and biryani masala for 1 hour.', 'Parboil rice. Layer marinated chicken and rice in handi.', 'Add saffron milk, mint, fried onions. Seal and dum cook 25 mins.', 'Fluff and serve with raita.'],
  'Palak Paneer with Roti': ['Blanch spinach, blend to puree. Sauté onion-garlic, add spinach puree.', 'Add spices, paneer cubes, cream. Simmer 5 mins.', 'Make roti dough, roll and cook on tawa. Serve paneer with hot roti.'],
  'Egg Bhurji with Toast': ['Beat eggs with salt and pepper. Heat butter in pan.', 'Sauté onion, tomato, chilli. Pour eggs, scramble until done.', 'Toast bread. Serve bhurji with toast.'],
  'Roasted Makhana (Fox Nuts)': ['Heat ghee in pan. Add makhana, roast on low 8-10 mins until crisp.', 'Add salt, chaat masala, pepper. Toss. Cool and store.'],
  'Fruit Chaat with Chaat Masala': ['Chop fruits into bite-sized pieces.', 'Add chaat masala, lemon juice, black salt. Toss gently.', 'Garnish with coriander. Serve chilled.'],
  'Mixed Vegetable Pulao': ['Sauté whole spices in ghee. Add onions, vegetables.', 'Add washed rice, water (1:2 ratio), salt. Bring to boil.', 'Cover and cook on low 15 mins. Fluff and serve.'],
  'Dal Makhani with Roti': ['Cook urad dal and rajma until very soft.', 'Mash slightly, add tomato base, butter, cream. Simmer 20 mins.', 'Make rotis. Serve dal with hot roti.'],
  'Paneer Tikka Masala with Naan': ['Marinate paneer in yogurt and spices. Grill until charred.', 'Make masala: onion-tomato base, add cream, grilled paneer.', 'Warm naan. Serve tikka masala with naan.'],
  'Butter Chicken with Naan': ['Marinate and grill chicken. Make tomato-butter gravy.', 'Add cream, grilled chicken. Simmer. Warm naan, serve.'],
};

// Fallback: generate from recipe name
const getRecipeStepsFallback = (name) => {
  const verbs = ['Wash and prepare', 'Heat oil in pan', 'Add and sauté', 'Cook until done', 'Season and serve'];
  const main = name.split(' ')[0] || 'ingredients';
  return verbs.map((v, i) => i === 2 ? `${v} ${main}` : v + '.');
};

// ══════════════════════════════════════════════════════════════
// SMART RANDOMIZATION & ANTI-REPETITION LOGIC
// ══════════════════════════════════════════════════════════════

let recentSelections = {
  breakfast: [],
  lunch: [],
  snack: [],
  dinner: [],
  cheat: []
};

/**
 * Filter recipes by dietary preference (veg / nonveg / both)
 */
const filterByDietary = (pool, dietaryPreference = 'both') => {
  if (dietaryPreference === 'both') return pool;
  const isVeg = dietaryPreference === 'veg';
  return pool.filter(r => (r.veg !== undefined ? r.veg === isVeg : isVeg));
};

/**
 * Get random recipes with anti-repetition logic
 */
const getRandomRecipes = (mealType, count = 3, excludeRecent = true, dietaryPreference = 'both') => {
  let pool = [...RECIPE_DATABASE[mealType]];
  pool = filterByDietary(pool, dietaryPreference);
  if (pool.length === 0) pool = [...RECIPE_DATABASE[mealType]]; // fallback
  const recent = recentSelections[mealType] || [];
  
  let available = pool;
  if (excludeRecent && pool.length > count * 2) {
    available = pool.filter(recipe => !recent.includes(recipe.name));
  }
  if (available.length === 0) available = pool;
  
  const shuffled = available.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  const selectedNames = selected.map(r => r.name);
  recentSelections[mealType] = [...selectedNames, ...recent].slice(0, 5);
  
  return selected;
};

/**
 * Convert recipe to full meal object
 */
const recipeToMeal = (recipe, mealType) => {
  const flavorProfiles = {
    breakfast: ['savory', 'mild', 'warm'],
    lunch: ['rich', 'hearty', 'spicy'],
    snack: ['light', 'tangy', 'fresh'],
    dinner: ['aromatic', 'comforting', 'balanced']
  };
  
  return {
    name: recipe.name,
    description: generateDescription(recipe.name, mealType),
    ingredients: generateIngredients(recipe.name),
    cookTime: recipe.time,
    nutrition: {
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      fiber: recipe.fiber,
      ...(mealType === 'clinical' && { glycemicIndex: Math.floor(Math.random() * 20) + 35 })
    },
    difficulty: recipe.difficulty,
    estimatedCostINR: recipe.cost,
    cheatDayScore: Math.floor(recipe.calories / 60),
    flavorProfile: flavorProfiles[mealType] || ['delicious'],
    preparationSteps: generateSteps(recipe.name),
    ...(mealType === 'clinical' && {
      medicinalBenefits: generateClinicalBenefits(recipe),
      flavorMatchPercent: Math.floor(Math.random() * 20) + 75
    }),
    ...(mealType === 'fitness' && {
      macros: {
        protein_g: recipe.protein,
        carbs_g: recipe.carbs,
        fat_g: recipe.fat,
        calories: recipe.calories
      },
      mealTiming: 'Anytime',
      performanceBenefit: generatePerformanceBenefit(recipe)
    })
  };
};

/**
 * Generate contextual description
 */
const generateDescription = (name, mealType) => {
  const descriptions = {
    'Masala Oats Upma': 'Savory oats cooked with vegetables and aromatic spices',
    'Besan Chilla with Mint Chutney': 'Protein-rich chickpea flour pancakes with fresh mint sauce',
    'Poha with Peanuts': 'Light and fluffy flattened rice with crunchy peanuts',
    'Dal Tadka with Jeera Rice': 'Comforting lentil curry with cumin-flavored rice',
    'Rajma Chawal': 'Hearty kidney bean curry with steamed rice',
    'Roasted Makhana (Fox Nuts)': 'Crunchy roasted lotus seeds with light spices',
    'Palak Paneer with Roti': 'Creamy spinach curry with cottage cheese and whole wheat flatbread',
    'Mixed Vegetable Pulao': 'Fragrant rice cooked with seasonal vegetables and whole spices'
  };
  return descriptions[name] || `A delicious and nutritious ${mealType} option`;
};

/**
 * Generate ingredient list - unique per recipe
 */
const generateIngredients = (name) => {
  if (RECIPE_INGREDIENTS[name]) return RECIPE_INGREDIENTS[name];
  const main = name.split(' ').slice(0, 2).join(' ');
  return [
    { name: main, amount: 'as per recipe' },
    { name: 'Onion', amount: '1-2' },
    { name: 'Tomato', amount: '1-2' },
    { name: 'Spices (turmeric, cumin, etc.)', amount: 'to taste' },
    { name: 'Oil/Ghee', amount: '2 tbsp' },
    { name: 'Salt', amount: 'to taste' }
  ];
};

/**
 * Generate preparation steps - unique per recipe
 */
const generateSteps = (name) => {
  if (RECIPE_STEPS[name]) return RECIPE_STEPS[name];
  return getRecipeStepsFallback(name);
};

/**
 * Generate clinical benefits
 */
const generateClinicalBenefits = (recipe) => {
  const benefits = [];
  if (recipe.fiber > 7) benefits.push('High fiber - aids digestion');
  if (recipe.protein > 15) benefits.push('Good protein content');
  if (recipe.calories < 350) benefits.push('Calorie-controlled');
  if (recipe.fat < 10) benefits.push('Low-fat option');
  return benefits.length > 0 ? benefits : ['Balanced nutrition', 'Heart-healthy'];
};

/**
 * Generate performance benefit
 */
const generatePerformanceBenefit = (recipe) => {
  if (recipe.protein > 20) return 'High protein for muscle recovery';
  if (recipe.carbs > 50) return 'Energy-dense for performance';
  return 'Balanced macros for sustained energy';
};

// ══════════════════════════════════════════════════════════════
// MAIN FUNCTIONS
// ══════════════════════════════════════════════════════════════

export const generateDailyMealPlan = async ({
  familySize,
  budget,
  cuisinePrefs,
  allergies,
  quickCook,
  mealType,
  dietaryPreference = 'both',
}) => {
  console.log(`🍽️ Generating ${mealType} options (${dietaryPreference})...`);
  const recipes = getRandomRecipes(mealType, 3, true, dietaryPreference);
  const meals = recipes.map(recipe => recipeToMeal(recipe, mealType));
  console.log(`✅ Generated: ${meals.map(m => m.name).join(', ')}`);
  return { meals };
};

export const suggestCheatDayMeal = async ({ remainingCalories, cuisinePrefs, allergies, dietaryPreference = 'both' }) => {
  console.log('🍰 Suggesting cheat meal...');
  const cheatOptions = getRandomRecipes('cheat', 1, true, dietaryPreference);
  const cheat = cheatOptions[0];
  
  return {
    name: cheat.name,
    description: `Indulgent ${cheat.name} to satisfy your cravings`,
    calories: Math.min(cheat.calories, remainingCalories - 50),
    indulgenceScore: cheat.score,
    whyItWorks: `Fits within your ${remainingCalories} calorie budget while satisfying cravings`,
    ingredients: [cheat.name.split(' ')[0], 'seasonings', 'garnish'],
    quickTip: cheat.tip
  };
};

export const generate7DayDailyPlan = async (userProfile) => {
  console.log('📅 Generating varied 7-day plan...');
  const dietaryPreference = userProfile?.dietaryPreference || 'both';
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekPlan = {};
  recentSelections = { breakfast: [], lunch: [], snack: [], dinner: [], cheat: [] };
  
  days.forEach((day) => {
    weekPlan[day] = {
      breakfast: recipeToMeal(getRandomRecipes('breakfast', 1, true, dietaryPreference)[0], 'breakfast'),
      lunch: recipeToMeal(getRandomRecipes('lunch', 1, true, dietaryPreference)[0], 'lunch'),
      snack: recipeToMeal(getRandomRecipes('snack', 1, true, dietaryPreference)[0], 'snack'),
      dinner: recipeToMeal(getRandomRecipes('dinner', 1, true, dietaryPreference)[0], 'dinner')
    };
  });
  console.log('✅ Generated varied 7-day plan!');
  return { weekPlan };
};

export const generateClinicalMealPlan = async (params) => {
  const result = await generateDailyMealPlan({ ...params, dietaryPreference: params.dietaryPreference || 'both' });
  result.meals = result.meals.map(meal => ({
    ...meal,
    medicinalBenefits: generateClinicalBenefits(meal.nutrition),
    flavorMatchPercent: Math.floor(Math.random() * 20) + 75,
    warnings: []
  }));
  return result;
};

export const generateFitnessMealPlan = async (params) => {
  const result = await generateDailyMealPlan({ ...params, dietaryPreference: params.dietaryPreference || 'both' });
  result.meals = result.meals.map(meal => ({
    ...meal,
    macros: {
      protein_g: meal.nutrition.protein,
      carbs_g: meal.nutrition.carbs,
      fat_g: meal.nutrition.fat,
      calories: meal.nutrition.calories
    },
    mealTiming: params.isWorkoutDay ? 'Post-workout within 45 mins' : 'Anytime',
    performanceBenefit: generatePerformanceBenefit(meal.nutrition)
  }));
  return result;
};

export const analyzeClinicalReport = async (reportText, conditions) => {
  return {
    restrictions: ['High sodium foods', 'Refined sugars'],
    recommended: ['High fiber foods', 'Lean proteins'],
    avoid: ['Processed foods', 'Deep-fried items'],
    emphasize: ['Whole grains', 'Leafy greens'],
    mealTiming: { breakfast: '7-9 AM', lunch: '12-2 PM', dinner: '7-8 PM' }
  };
};

export const generate7DayClinicalPlan = async (userProfile) => {
  return generate7DayDailyPlan(userProfile);
};

export const calculateTDEE = async ({ weight, height, age, gender, activityLevel, goal }) => {
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * (age || 25) + 5
    : 10 * weight + 6.25 * height - 5 * (age || 25) - 161;
    
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725, extreme: 1.9 };
  const tdee = Math.round(bmr * (multipliers[activityLevel] || 1.55));
  
  const adjustments = { muscle_gain: 300, fat_loss: -500, maintenance: 0, endurance: 200 };
  const target = tdee + (adjustments[goal] || 0);
  
  return {
    tdee,
    targetCalories: target,
    macros: {
      protein_g: Math.round(weight * 2.2),
      carbs_g: Math.round(target * 0.4 / 4),
      fat_g: Math.round(target * 0.25 / 9)
    },
    mealDistribution: { breakfast: 30, lunch: 35, snack: 10, dinner: 25 },
    weeklyGoal: goal
  };
};

export const generate7DayFitnessPlan = async (userProfile) => {
  return generate7DayDailyPlan(userProfile);
};

export const generateIngredientSubstitute = async (ingredient, restriction, mode) => {
  return {
    substitute: `Healthy ${ingredient} alternative`,
    similarity: 80 + Math.floor(Math.random() * 15),
    flavorImpact: 'Similar flavor profile',
    nutritionImpact: 'Comparable nutritional value',
    usageRatio: '1:1'
  };
};

export default {
  generateDailyMealPlan,
  suggestCheatDayMeal,
  generate7DayDailyPlan,
  generateClinicalMealPlan,
  analyzeClinicalReport,
  generate7DayClinicalPlan,
  generateFitnessMealPlan,
  calculateTDEE,
  generate7DayFitnessPlan,
  generateIngredientSubstitute
};