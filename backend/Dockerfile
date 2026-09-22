# FoodSnap Django REST Framework Container
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 8000

WORKDIR /app

# Install system dependencies for Pillow and image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY . /app/

# Collect static files and create db migrations
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Run gunicorn WSGI server
CMD ["gunicorn", "foodsnap_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
