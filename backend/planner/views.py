from rest_framework import viewsets
from .models import Course, Assignment, Exam
from .serializers import CourseSerializer, AssignmentSerializer, ExamSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class AssignmentViewSet(viewsets.ModelViewSet):
    # This sorts by due_date (closest first)
    queryset = Assignment.objects.all().order_by('due_date')
    serializer_class = AssignmentSerializer

class ExamViewSet(viewsets.ModelViewSet):
    # This sorts by date (closest first)
    queryset = Exam.objects.all().order_by('date')
    serializer_class = ExamSerializer