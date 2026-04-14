from rest_framework import serializers
from .models import Course, Assignment, Exam

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__' # This tells includes all columns (id, name, etc.)
        read_only_fields = ['user']

class AssignmentSerializer(serializers.ModelSerializer):
    is_overdue = serializers.ReadOnlyField()
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'due_date', 'related_course', 'is_completed', 'is_overdue']

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'