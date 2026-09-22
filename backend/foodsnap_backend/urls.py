"""
URL configuration for foodsnap_backend project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from foodsnap_api.views import HealthCheckView

urlpatterns = [
    path('', HealthCheckView.as_view(), name='root-health'),
    path('admin/', admin.site.urls),
    path('api/', include('foodsnap_api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
