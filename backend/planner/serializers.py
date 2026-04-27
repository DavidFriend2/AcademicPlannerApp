from rest_framework import serializers
from .models import Course, Assignment, Exam
from django.contrib.auth.models import User
from rest_framework import serializers


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


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "is_completed"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )