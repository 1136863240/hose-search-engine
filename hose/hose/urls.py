"""hose URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

import sys
sys.path.append(".")

from django.urls import path
from . import views

urlpatterns = [
    path('lex/', views.lex),
    path('add/', views.add),
    path('search/', views.search),
    path('save_path/', views.save_path),
    path('get_saved_paths/', views.get_saved_paths),
    path('del_save_path/', views.del_save_path),
]
