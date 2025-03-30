from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    ModuleViewSet,
    VideoViewSet,
    EnrollmentViewSet,
    TestViewSet,
    TestAttemptViewSet,
    AchievementViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

course_router = DefaultRouter()
course_router.register(r'modules', ModuleViewSet, basename='module')
course_router.register(r'tests', TestViewSet, basename='test')

module_router = DefaultRouter()
module_router.register(r'videos', VideoViewSet, basename='video')

test_router = DefaultRouter()
test_router.register(r'attempts', TestAttemptViewSet, basename='test-attempt')

urlpatterns = [
    path('', include(router.urls)),
    path('courses/<int:course_pk>/', include(course_router.urls)),
    path('courses/<int:course_pk>/modules/<int:module_pk>/', include(module_router.urls)),
    path('courses/<int:course_pk>/tests/<int:test_pk>/', include(test_router.urls)),
    path('achievements/', AchievementViewSet.as_view({'get': 'list'}), name='achievement-list'),
] 