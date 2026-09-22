# How to Deploy FoodSnap to Render 🚀

FoodSnap can be deployed to [Render](https://render.com) using either **Render Blueprints (1-Click Automated)** or by setting up **Manual Web Services**.

---

## Option 1: Automated Blueprint Deployment (Recommended)

Because this repository contains a pre-configured `render.yaml` file, Render can set up both your **Django API** and **React Web App** automatically with zero guesswork:

1. Push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure Render deployment blueprint"
   git push origin main
   ```
2. Go to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** ➔ **Blueprint**.
4. Select your GitHub repository (**`NeonFx22/FoodSnap`**).
5. Render will automatically detect `render.yaml` and configure:
   - **`foodsnap-django-api`** (Python Django REST Framework service)
   - **`foodsnap-app`** (Node/React web frontend)
6. Click **Apply**. Render will automatically run migrations, seed authentic African recipes, compile the React build, and provide your live public URLs!

---

## Option 2: Manual Web Service Setup (Step-by-Step)

If you prefer to configure the services manually in Render:

### Part A: Deploy the Django REST Framework Backend
1. On your Render dashboard, click **New +** ➔ **Web Service**.
2. Connect your GitHub repository (`NeonFx22/FoodSnap`).
3. Fill in these settings:
   - **Name**: `foodsnap-django-api`
   - **Language / Runtime**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `./build.sh` (or `pip install -r requirements.txt && python manage.py migrate && python manage.py seed_dishes && python manage.py collectstatic --noinput`)
   - **Start Command**: `gunicorn foodsnap_backend.wsgi:application --bind 0.0.0.0:$PORT`
   - **Plan**: `Free`
4. Under **Environment Variables**, add:
   - `PYTHON_VERSION`: `3.10.12`
   - `DJANGO_DEBUG`: `False`
   - `DJANGO_SECRET_KEY`: *(click "Generate" or type a secret string)*
   - `GEMINI_API_KEY`: *(optional, from your Google AI Studio dashboard)*
5. Click **Create Web Service**. Copy the service URL once live (e.g., `https://foodsnap-django-api.onrender.com`).

---

### Part B: Deploy the React & Node Web App
1. On your Render dashboard, click **New +** ➔ **Web Service**.
2. Connect the same GitHub repository (`NeonFx22/FoodSnap`).
3. Fill in these settings:
   - **Name**: `foodsnap-app`
   - **Language / Runtime**: `Node`
   - **Root Directory**: *(leave blank for root)*
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.cjs`
   - **Plan**: `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `DJANGO_API_URL`: `https://foodsnap-django-api.onrender.com` *(use your Part A URL)*
   - `GEMINI_API_KEY`: *(optional, from your Google AI Studio dashboard)*
5. Click **Create Web Service**.

---

## Verifying the Deployment
Once deployed:
* Visit `https://foodsnap-django-api.onrender.com/api/` for the interactive Django REST Framework browsable API.
* Visit `https://foodsnap-django-api.onrender.com/admin/` to access the Django Admin.
* Visit your frontend URL to scan food photos, browse recipes, and track nutrition.
