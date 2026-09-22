#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Creating and applying database migrations..."
python manage.py makemigrations foodsnap_api --noinput || true
python manage.py migrate --noinput

echo "Seeding authentic African and international culinary recipes..."
python manage.py seed_dishes || echo "Seeding completed or skipped"

echo "Django build completed successfully!"
