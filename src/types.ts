export interface GlobalRecipe {
  id: string;
  name: string;
  cuisine: string;
  category: string;
  origin: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Master';
  calories: string;
  imageUrl: string;
  description: string;
  flavorProfile: string[];
  dietaryTags: string[];
  ingredientsList: {
    item: string;
    amount: string;
    notes?: string;
  }[];
  directions: string[];
  chefTips: string[];
  regionalVariations?: string[];
  nutrition?: {
    protein: string;
    carbs: string;
    fat: string;
    fiber?: string;
  };
  source?: 'Curated Global Database' | 'TheMealDB Global API' | 'Wikipedia Culinary Encyclopedia' | 'User Input Research' | string;
}

export interface CookingStep {
  stepNumber: number;
  title: string;
  instruction: string;
  durationSeconds: number; // e.g. 120 for 2 mins, 900 for 15 mins
  formattedDuration: string; // e.g. "2 mins", "15 mins", "45 secs"
  tip?: string;
  actionType: 'prep' | 'boil' | 'fry' | 'simmer' | 'steam' | 'grill' | 'blend' | 'bake' | 'rest' | 'toss';
  scienceWhy?: string;
  visualCue?: string;
  soundCue?: string;
  aromaCue?: string;
  flameLevel?: 'Low Heat' | 'Medium-Low' | 'Medium Heat' | 'Medium-High' | 'High Heat' | 'Off / Prep';
  stepIngredients?: string[];
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  calories: string;
  cooking_time: string;
  servings: string;
  difficulty: string;
  origin: string;
  ingredients: string;
  directions: string;
  tags: string[];
  referenceImages: string[];
  imagePlaceholderColor?: string;
  isCustom?: boolean;
  steps?: CookingStep[];
}

export interface MatchResult {
  recipe: Recipe;
  confidence: number; // 0 to 100%
  similarityScore: number; // 0.0 to 1.0
  sourceSample: string;
}

export interface FeatureVector {
  spatialGrid: number[][]; // 4x4 array of [R, G, B]
  hsvHistogram: {
    hue: number[]; // 24 bins
    saturation: number[]; // 4 bins
    value: number[]; // 4 bins
  };
  rawVector: number[]; // 80 dimensions
}

export interface UploadHistoryItem {
  id: string;
  timestamp: string;
  imagePreview: string;
  topMatchName: string;
  confidence: number;
  inferenceMs: number;
  recipeId: string;
}

export interface BenchmarkItemResult {
  filename: string;
  expectedName: string;
  predictedName: string;
  confidence: number;
  isCorrect: boolean;
  isTop3: boolean;
  isTop1Match: boolean;
  isTop3Match: boolean;
  latencyMs: number;
}

export interface BenchmarkResult {
  totalTested: number;
  top1Accuracy: number;
  top3Accuracy: number;
  avgLatencyMs: number;
  itemResults?: BenchmarkItemResult[];
}
