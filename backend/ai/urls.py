from django.urls import path
from .views import ChatView, GenerateCourseView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='ai-chat'),
    path('generate-course/', GenerateCourseView.as_view(), name='generate-course'),
] 