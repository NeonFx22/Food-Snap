# FoodSnap - Django REST Framework Backend 🍲🤖

Production-ready Django REST Framework backend for **FoodSnap**: AI-powered food image recognition, culinary matching, and nutrition profiling.

---

## Features
- **Food Recognition API (`/api/recognize/`)**:
  - Accepts food photos via Multipart Form Data or Base64 URI.
  - Color space (RGB/HSV), texture, and regional culinary feature extraction.
  - Multimodal Gemini AI Vision integration with graceful heuristic fallback.
- **Culinary Recipes API (`/api/recipes/`)**:
  - Full CRUD & Search filtering across West African & international dishes.
  - Step-by-step instructions, ingredients, macros, and cooking time.
  - Specialized action: `/api/recipes/<id>/nutrition/`.
- **Scan History (`/api/scans/`)**:
  - Persists and tracks image scans, confidence ratings, and cues.
- **Bookmarks & Favorites (`/api/favorites/`)**:
  - Enables users to save recipes to their personal collection.
- **User Authentication (`/api/auth/register/`, `/api/auth/login/`)**:
  - Django User and extended UserProfile management.

---

## Quickstart Guide

### 1. Create and Activate Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Migrations & Seed Dishes
```bash
python manage.py makemigrations foodsnap_api
python manage.py migrate
python manage.py seed_dishes
```

### 4. Create an Admin Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 5. Start the Server
```bash
python manage.py runserver 8000
```
Visit the interactive Django REST Framework browsable API at:
👉 **`http://localhost:8000/api/`**
Or the Django Admin at:
👉 **`http://localhost:8000/admin/`**

---

## Docker Quickstart

```bash
docker-compose up --build
```
The API will be accessible on `http://localhost:8000/api/`.
