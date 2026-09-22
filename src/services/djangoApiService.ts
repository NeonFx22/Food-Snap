/**
 * Client service for interacting with the Django REST Framework backend.
 * Provides unified methods for food recognition, recipe indexing,
 * scan history, and system status.
 */

export interface DjangoHealthStatus {
  available: boolean;
  url: string;
  backend: string;
  message?: string;
  endpoints?: string[];
  details?: {
    status: string;
    framework: string;
    version: string;
    stats?: {
      indexed_dishes: number;
      total_scans: number;
    };
    database?: string;
  };
  error?: string;
}

export interface DjangoRecognitionResult {
  success: boolean;
  scanId?: string;
  dishName?: string;
  recipeId?: string;
  confidence?: number;
  category?: string;
  origin?: string;
  detectedVisualCues?: string[];
  visibleIngredients?: string[];
  alternativeCandidates?: Array<{ dishName: string; recipeId: string; confidence: number }>;
  culinaryNotes?: string;
  engine?: string;
  recipe?: any;
  error?: string;
}

export async function checkDjangoStatus(): Promise<DjangoHealthStatus> {
  try {
    const res = await fetch('/api/django/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Ignore fetch error
  }
  return {
    available: false,
    url: 'http://localhost:8000',
    backend: 'Django REST Framework',
    message: 'Django REST Framework backend configured at /backend.',
    endpoints: [
      '/api/recognize/',
      '/api/recipes/',
      '/api/scans/',
      '/api/favorites/',
      '/api/auth/register/',
      '/api/auth/login/',
    ],
  };
}

export async function fetchDjangoRecipes(params?: { category?: string; search?: string }): Promise<any[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/django/recipes/?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : data.results || [];
    }
  } catch (err) {
    console.warn('Failed to fetch recipes from Django REST Framework:', err);
  }
  return [];
}

export async function recognizeFoodDjango(imageBase64: string): Promise<DjangoRecognitionResult> {
  try {
    const res = await fetch('/api/django/recognize/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_base64: imageBase64,
      }),
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      error: errData.error || errData.detail || 'Django vision recognition failed',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Django server unreachable',
    };
  }
}
