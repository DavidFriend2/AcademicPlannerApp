from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Course, Assignment, Exam
from .serializers import CourseSerializer, AssignmentSerializer, ExamSerializer

class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer

    # Only gives courses that are from the specific user
    def get_queryset(self):
        return Course.objects.filter(user=self.request.user)
    
    # Attaches user to new course created
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AssignmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer

    # Only gives assignments that are from the specific user, sorts by due_date (closest first)
    def get_queryset(self):
        return Assignment.objects.filter(related_course__user=self.request.user).order_by('due_date')

class ExamViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer

    # Only gives exams that are from the specific user, sorts by date (closest first)
    def get_queryset(self):
        return Exam.objects.filter(related_course__user=self.request.user).order_by('date')
    