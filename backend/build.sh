#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Applying database migrations..."
python manage.py migrate

echo "Seeding authentic African and international culinary recipes..."
python manage.py seed_dishes

echo "Django build completed successfully!"
