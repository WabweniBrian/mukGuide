# mukGuide/urls.py
from django.urls import path
from . import views

app_name = 'mukGuide'

urlpatterns = [
    path('', views.index, name='index'),
    # Add other URL patterns for your app as needed
]
