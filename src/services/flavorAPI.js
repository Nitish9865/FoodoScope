// ============================================================
// FLAVORDB & RECIPEDB API SERVICE
// Integrated with IIIT-Delhi Cosylab / Foodoscope
// Get API keys from: https://www.foodoscope.com/ (Profile dashboard)
// ============================================================

import { API_CONFIG, getRecipeDbUrl, getFlavorDbUrl } from '../config/apiConfig';

const FLAVOR_DB_BASE_URL = getFlavorDbUrl();
const RECIPE_DB_BASE_URL = getRecipeDbUrl();
const FLAVOR_DB_KEY = API_CONFIG.FLAVOR_DB_KEY || '';
const RECIPE_DB_KEY = API_CONFIG.RECIPE_DB_KEY || '';

// Shared header builder
const authHeaders = (key) => ({
  ...(key ? { Authorization: `Bearer ${key}` } : {}),
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

// ------------------------------------------------------------
// 1. FLAVORDB FUNCTIONS (The Science)
// Endpoints verified against FlavorDB_API_-_Complete_Collection
// Base: /flavordb
// ------------------------------------------------------------

/**
 * Search ingredient by name and category
 * GET /flavordb/entities/by-name-and-category
 */
export const searchIngredient = async (ingredientName, category = 'fruit', page = 0, size = 20) => {
  try {
    const url = `${FLAVOR_DB_BASE_URL}/entities/by-name-and-category?entity_alias=${encodeURIComponent(ingredientName)}&category=${encodeURIComponent(category)}&page=${page}&size=${size}`;
    const res = await fetch(url, { headers: authHeaders(FLAVOR_DB_KEY) });
    if (!res.ok) throw new Error(`FlavorDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('FlavorDB searchIngredient:', err);
    return [];
  }
};

/**
 * Search ingredient by human-readable name
 * GET /flavordb/entities/by-entity-alias-readable
 */
export const searchIngredientReadable = async (name, page = 0, size = 20) => {
  try {
    const url = `${FLAVOR_DB_BASE_URL}/entities/by-entity-alias-readable?entity_alias_readable=${encodeURIComponent(name)}&page=${page}&size=${size}`;
    const res = await fetch(url, { headers: authHeaders(FLAVOR_DB_KEY) });
    if (!res.ok) throw new Error(`FlavorDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('FlavorDB searchIngredientReadable:', err);
    return [];
  }
};

/**
 * Flavor pairing suggestions for an ingredient
 * GET /flavordb/food/by-alias?food_pair=mango
 */
export const getPairingSuggestions = async (ingredientName) => {
  try {
    const url = `${FLAVOR_DB_BASE_URL}/food/by-alias?food_pair=${encodeURIComponent(ingredientName)}`;
    const res = await fetch(url, { headers: authHeaders(FLAVOR_DB_KEY) });
    if (!res.ok) throw new Error(`Pairing fetch ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('FlavorDB getPairingSuggestions:', err);
    return [];
  }
};

/**
 * Get flavor molecules by profile (sweet, fruity, spicy…)
 * GET /flavordb/molecules_data/by-flavorProfile
 */
export const getMoleculesByFlavor = async (flavorProfile, page = 0, size = 20) => {
  try {
    const url = `${FLAVOR_DB_BASE_URL}/molecules_data/by-flavorProfile?flavor_profile=${encodeURIComponent(flavorProfile)}&page=${page}&size=${size}`;
    const res = await fetch(url, { headers: authHeaders(FLAVOR_DB_KEY) });
    if (!res.ok) throw new Error(`FlavorDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('FlavorDB getMoleculesByFlavor:', err);
    return [];
  }
};

/**
 * Search entities by natural source (e.g. "cattle", "coconut")
 * GET /flavordb/entities/by-natural-source
 */
export const searchByNaturalSource = async (naturalSource, page = 0, size = 20) => {
  try {
    const url = `${FLAVOR_DB_BASE_URL}/entities/by-natural-source?natural_source_name=${encodeURIComponent(naturalSource)}&page=${page}&size=${size}`;
    const res = await fetch(url, { headers: authHeaders(FLAVOR_DB_KEY) });
    if (!res.ok) throw new Error(`FlavorDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('FlavorDB searchByNaturalSource:', err);
    return [];
  }
};

// ------------------------------------------------------------
// 2. RECIPEDB FUNCTIONS (The Recipes)
// Endpoints verified against rdb2_postman_collection
// Base: /recipe2-api
// ------------------------------------------------------------

/**
 * List recipes with pagination
 * GET /recipe2-api/recipe/recipesinfo
 */
export const searchRecipes = async (page = 1, limit = 10) => {
  try {
    const url = `${RECIPE_DB_BASE_URL}/recipe/recipesinfo?page=${page}&limit=${limit}`;
    const res = await fetch(url, { headers: authHeaders(RECIPE_DB_KEY) });
    if (!res.ok) throw new Error(`RecipeDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('RecipeDB searchRecipes:', err);
    return [];
  }
};

/**
 * Get full recipe details by ID
 * GET /recipe2-api/search-recipe/:id
 */
export const getRecipeDetails = async (recipeId) => {
  try {
    const url = `${RECIPE_DB_BASE_URL}/search-recipe/${recipeId}`;
    const res = await fetch(url, { headers: authHeaders(RECIPE_DB_KEY) });
    if (!res.ok) throw new Error(`RecipeDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('RecipeDB getRecipeDetails:', err);
    return null;
  }
};

/**
 * Search recipes by title keyword
 * GET /recipe2-api/recipe-bytitle/recipeByTitle?title=Chicken
 */
export const searchRecipeByTitle = async (title) => {
  try {
    const url = `${RECIPE_DB_BASE_URL}/recipe-bytitle/recipeByTitle?title=${encodeURIComponent(title)}`;
    const res = await fetch(url, { headers: authHeaders(RECIPE_DB_KEY) });
    if (!res.ok) return null;
    const data = await res.json();
    const recipes = data?.payload?.data || data?.data || (Array.isArray(data) ? data : []);
    return recipes[0] || null;
  } catch (err) {
    console.warn('RecipeDB searchRecipeByTitle:', err);
    return null;
  }
};

/**
 * Search recipes by cuisine + region
 * GET /recipe2-api/recipes_cuisine/cuisine/:region
 *
 * ✅ FIXED: old code used wrong path /recipe/by-cuisine which doesn't exist
 *
 * @param {string} region      e.g. 'Indian', 'Italian'
 * @param {string} continent   e.g. 'Asian', 'European'
 * @param {string} subRegion   e.g. 'Indian', 'Mediterranean'
 * @param {number} page
 * @param {number} pageSize
 */
export const searchRecipesByCuisine = async (region = 'Indian', continent = 'Asian', subRegion = 'Indian', page = 1, pageSize = 10) => {
  try {
    const url = `${RECIPE_DB_BASE_URL}/recipes_cuisine/cuisine/${encodeURIComponent(region)}?continent=${encodeURIComponent(continent)}&subRegion=${encodeURIComponent(subRegion)}&page=${page}&page_size=${pageSize}`;
    const res = await fetch(url, { headers: authHeaders(RECIPE_DB_KEY) });
    if (!res.ok) throw new Error(`RecipeDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('RecipeDB searchRecipesByCuisine:', err);
    return [];
  }
};

/**
 * Filter recipes by diet type (vegan, vegetarian, pescetarian…)
 * GET /recipe2-api/recipe-diet/recipe-diet?diet=vegan
 * 
 * 🆕 NEW — very useful for Veg/Non-Veg toggle in Navbar
 */
export const searchRecipesByDiet = async (diet = 'vegetarian', limit = 10) => {
  try {
    const url = `${RECIPE_DB_BASE_URL}/recipe-diet/recipe-diet?diet=${encodeURIComponent(diet)}&limit=${limit}`;
    const res = await fetch(url, { headers: authHeaders(RECIPE_DB_KEY) });
    if (!res.ok) throw new Error(`RecipeDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('RecipeDB searchRecipesByDiet:', err);
    return [];
  }
};

/**
 * Filter recipes by calorie range
 * GET /recipe2-api/recipes-calories/calories?minCalories=100&maxCalories=500
 * 
 * 🆕 NEW — great for Clinical mode (low-cal) and Fitness mode (precision calories)
 */
export const searchRecipesByCalories = async (minCalories = 100, maxCalories = 600, limit = 10) => {
  try {
    const url = `${RECIPE_DB_BASE_URL}/recipes-calories/calories?minCalories=${minCalories}&maxCalories=${maxCalories}&limit=${limit}`;
    const res = await fetch(url, { headers: authHeaders(RECIPE_DB_KEY) });
    if (!res.ok) throw new Error(`RecipeDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('RecipeDB searchRecipesByCalories:', err);
    return [];
  }
};

/**
 * Filter recipes by protein range (grams)
 * GET /recipe2-api/protein/protein-range?min=30&max=60
 * 
 * 🆕 NEW — core feature for Fitness mode high-protein meal planning
 */
export const searchRecipesByProtein = async (min = 20, max = 60, page = 1, limit = 10) => {
  try {
    const url = `${RECIPE_DB_BASE_URL}/protein/protein-range?min=${min}&max=${max}&page=${page}&limit=${limit}`;
    const res = await fetch(url, { headers: authHeaders(RECIPE_DB_KEY) });
    if (!res.ok) throw new Error(`RecipeDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('RecipeDB searchRecipesByProtein:', err);
    return [];
  }
};

/**
 * Filter recipes by carb range (grams) — Low-GI helper for Clinical mode
 * GET /recipe2-api/recipe-carbo/recipes-by-carbs?minCarbs=10&maxCarbs=50
 * 
 * 🆕 NEW — use for diabetes-friendly filtering
 */
export const searchRecipesByCarbs = async (minCarbs = 0, maxCarbs = 40, limit = 10) => {
  try {
    const url = `${RECIPE_DB_BASE_URL}/recipe-carbo/recipes-by-carbs?minCarbs=${minCarbs}&maxCarbs=${maxCarbs}&limit=${limit}`;
    const res = await fetch(url, { headers: authHeaders(RECIPE_DB_KEY) });
    if (!res.ok) throw new Error(`RecipeDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('RecipeDB searchRecipesByCarbs:', err);
    return [];
  }
};

/**
 * Filter recipes by total cook time range (minutes)
 * GET /recipe2-api/recipes/range?field=total_time&min=10&max=30
 * 
 * 🆕 NEW — use for "Quick 30-min recipes" in Daily mode
 */
export const searchRecipesByTime = async (minMinutes = 5, maxMinutes = 30, page = 1, limit = 10) => {
  try {
    const url = `${RECIPE_DB_BASE_URL}/recipes/range?field=total_time&min=${minMinutes}&max=${maxMinutes}&page=${page}&limit=${limit}`;
    const res = await fetch(url, { headers: authHeaders(RECIPE_DB_KEY) });
    if (!res.ok) throw new Error(`RecipeDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('RecipeDB searchRecipesByTime:', err);
    return [];
  }
};

/**
 * Recipe of the day
 * GET /recipe2-api/recipe/recipeofday
 */
export const getRecipeOfTheDay = async () => {
  try {
    const url = `${RECIPE_DB_BASE_URL}/recipe/recipeofday`;
    const res = await fetch(url, { headers: authHeaders(RECIPE_DB_KEY) });
    if (!res.ok) throw new Error(`RecipeDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('RecipeDB getRecipeOfTheDay:', err);
    return null;
  }
};

/**
 * Get recipe preparation steps by recipe ID
 * GET /recipe2-api/instructions/:recipe_id
 */
export const getRecipeInstructions = async (recipeId) => {
  try {
    const url = `${RECIPE_DB_BASE_URL}/instructions/${recipeId}`;
    const res = await fetch(url, { headers: authHeaders(RECIPE_DB_KEY) });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.steps || (Array.isArray(data) ? data : null);
  } catch (err) {
    console.warn('RecipeDB getRecipeInstructions:', err);
    return null;
  }
};

/**
 * ★ THE KEY FEATURE: Auto-generate a multi-day meal plan
 * POST /recipe2-api/mealplan/meal-plan
 *
 * This is the CORE endpoint for Palate Planner's 7-day calendar generation.
 * It does the constraint-based optimization server-side.
 *
 * @param {object} options
 * @param {string}   options.diet_type          'vegan' | 'vegetarian' | 'non-vegetarian' | 'keto' etc.
 * @param {number}   options.days               Number of days (7 for a full week)
 * @param {number}   options.min_calories       e.g. 1500
 * @param {number}   options.max_calories       e.g. 2200
 * @param {string[]} options.exclude_ingredients e.g. ['pork', 'shellfish']
 *
 * Example usage:
 *   const plan = await generateMealPlan({
 *     diet_type: 'vegetarian',
 *     days: 7,
 *     min_calories: 1500,
 *     max_calories: 2000,
 *     exclude_ingredients: ['dairy'],
 *   });
 */
export const generateMealPlan = async ({
  diet_type = 'vegetarian',
  days = 7,
  min_calories = 1500,
  max_calories = 2200,
  exclude_ingredients = [],
} = {}) => {
  try {
    const excludeStr = exclude_ingredients.join(', ');
    const url = `${RECIPE_DB_BASE_URL}/mealplan/meal-plan?diet_type=${encodeURIComponent(diet_type)}&days=${days}&calories_per_day=${encodeURIComponent(JSON.stringify({ min: min_calories, max: max_calories }))}${excludeStr ? `&exclude_ingredients=${encodeURIComponent(excludeStr)}` : ''}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders(RECIPE_DB_KEY),
    });

    if (!res.ok) throw new Error(`RecipeDB meal plan ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('RecipeDB generateMealPlan:', err);
    return null;
  }
};

/**
 * Filter recipes by ingredients + categories + title (advanced search)
 * GET /recipe2-api/recipebyingredient/by-ingredients-categories-title
 * 
 * 🆕 NEW — use for "what can I cook with these ingredients?" / allergen exclusion
 *
 * @param {object} opts
 * @param {string[]} opts.includeIngredients  e.g. ['lemon juice', 'garlic']
 * @param {string[]} opts.excludeIngredients  e.g. ['butter', 'cream'] (allergen block)
 * @param {string[]} opts.excludeCategories   e.g. ['Dairy', 'Shellfish']
 * @param {string}   opts.title               partial title keyword
 */
export const searchRecipesByIngredients = async ({
  includeIngredients = [],
  excludeIngredients = [],
  includeCategories = [],
  excludeCategories = [],
  title = '',
  page = 1,
  limit = 10,
} = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (includeIngredients.length) params.set('includeIngredients', includeIngredients.join(','));
    if (excludeIngredients.length) params.set('excludeIngredients', excludeIngredients.join(','));
    if (includeCategories.length) params.set('includeCategories', includeCategories.join(','));
    if (excludeCategories.length) params.set('excludeCategories', excludeCategories.join(','));
    if (title) params.set('title', title);

    const url = `${RECIPE_DB_BASE_URL}/recipebyingredient/by-ingredients-categories-title?${params.toString()}`;
    const res = await fetch(url, { headers: authHeaders(RECIPE_DB_KEY) });
    if (!res.ok) throw new Error(`RecipeDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('RecipeDB searchRecipesByIngredients:', err);
    return [];
  }
};

// ------------------------------------------------------------
// 3. HELPER FUNCTIONS (Smart Substitutes — FlavorDB powered)
// ------------------------------------------------------------

/**
 * Find ingredient substitutes using FlavorDB flavor pairing
 * Falls back to curated local list if API is unreachable
 */
export const getSubstitutes = async (ingredientName) => {
  try {
    const url = `${FLAVOR_DB_BASE_URL}/food/by-alias?food_pair=${encodeURIComponent(ingredientName)}`;
    const res = await fetch(url, { headers: authHeaders(FLAVOR_DB_KEY) });

    if (!res.ok) return getSubstitutesFallback(ingredientName);
    const data = await res.json();

    let items = [];
    if (Array.isArray(data)) items = data;
    else if (data?.data) items = Array.isArray(data.data) ? data.data : [data.data];
    else if (data?.pairs) items = data.pairs;
    else if (data?.entities) items = data.entities;
    else if (data?.content) items = data.content;

    if (items.length > 0) {
      return items.slice(0, 8).map((item, i) => {
        const name = item?.name || item?.entity_alias || item?.entity_alias_readable || item?.title
          || (typeof item === 'string' ? item : 'Alternative');
        return {
          name: typeof name === 'string' ? name : (name?.name || 'Substitute'),
          flavor: item?.category || item?.flavor_profile || 'Similar flavor profile',
          similarity: Math.min(95, 75 + (i % 5) * 4),
          usageRatio: item?.ratio || '1:1',
        };
      });
    }
    return getSubstitutesFallback(ingredientName);
  } catch (err) {
    console.warn('FlavorDB getSubstitutes:', err);
    return getSubstitutesFallback(ingredientName);
  }
};

function getSubstitutesFallback(ingredientName) {
  const fallbacks = {
    butter: [
      { name: 'Ghee', flavor: 'Rich, nutty', similarity: 88, usageRatio: '1:1' },
      { name: 'Coconut oil', flavor: 'Mild, tropical', similarity: 72, usageRatio: '1:1' },
      { name: 'Olive oil', flavor: 'Fruity', similarity: 68, usageRatio: '3/4:1' },
    ],
    milk: [
      { name: 'Oat milk', flavor: 'Creamy, neutral', similarity: 85, usageRatio: '1:1' },
      { name: 'Almond milk', flavor: 'Nutty, light', similarity: 78, usageRatio: '1:1' },
      { name: 'Coconut milk', flavor: 'Rich, tropical', similarity: 75, usageRatio: '1:1' },
    ],
    cream: [
      { name: 'Greek yogurt', flavor: 'Tangy, thick', similarity: 82, usageRatio: '1:1' },
      { name: 'Coconut cream', flavor: 'Rich', similarity: 80, usageRatio: '1:1' },
    ],
    egg: [
      { name: 'Flax egg (1 tbsp ground flax + 3 tbsp water)', flavor: 'Neutral', similarity: 70, usageRatio: '1:1' },
      { name: 'Yogurt', flavor: 'Moist', similarity: 65, usageRatio: '1/4 cup : 1 egg' },
    ],
  };
  const key = ingredientName?.toLowerCase();
  for (const [k, v] of Object.entries(fallbacks)) {
    if (key?.includes(k)) return v;
  }
  return [
    { name: `${ingredientName} alternative`, flavor: 'Similar profile', similarity: 75, usageRatio: '1:1' },
    { name: 'Check pantry for similar item', flavor: 'Varies', similarity: 70, usageRatio: 'As needed' },
  ];
}

/** Alias kept for backwards compatibility */
export const getFlavorPairing = getPairingSuggestions;

export default {
  // FlavorDB
  searchIngredient,
  searchIngredientReadable,
  getPairingSuggestions,
  getMoleculesByFlavor,
  searchByNaturalSource,
  getFlavorPairing,
  getSubstitutes,
  // RecipeDB
  searchRecipes,
  getRecipeDetails,
  searchRecipeByTitle,
  searchRecipesByCuisine,
  searchRecipesByDiet,
  searchRecipesByCalories,
  searchRecipesByProtein,
  searchRecipesByCarbs,
  searchRecipesByTime,
  searchRecipesByIngredients,
  getRecipeOfTheDay,
  getRecipeInstructions,
  generateMealPlan,         // ← the big one
};