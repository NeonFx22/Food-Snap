"""WSGI entrypoint for the FoodSnap project."""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "foodsnap.settings")

application = get_wsgi_application()
