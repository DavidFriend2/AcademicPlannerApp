from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, AssignmentViewSet, ExamViewSet

# A router automatically generates all the standard URL paths for us
router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'exams', ExamViewSet)

urlpatterns = [
    path('', include(router.urls)),
]