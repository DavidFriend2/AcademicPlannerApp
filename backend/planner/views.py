from datetime import timedelta
from django.http import HttpResponse
from django.utils import timezone
from icalendar import Calendar, Event

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

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
    serializer_class = AssignmentSerializer

    # Only gives assignments that are from the specific user, sorts by due_date (closest first)
    def get_queryset(self):
        return Assignment.objects.filter(related_course__user=self.request.user).order_by('due_date')

class ExamViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ExamSerializer

    # Only gives exams that are from the specific user, sorts by date (closest first)
    def get_queryset(self):
        return Exam.objects.filter(related_course__user=self.request.user).order_by('date')
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def calendar_events(request):
    assignments = Assignment.objects.filter(
        related_course__user=request.user
    ).order_by("due_date")

    exams = Exam.objects.filter(
        related_course__user=request.user
    ).order_by("date")

    events = []

    for assignment in assignments:
        events.append({
            "id": f"assignment-{assignment.id}",
            "type": "assignment",
            "title": assignment.title,
            "course_id": assignment.related_course.course_id,
            "course_name": assignment.related_course.course_name,
            "start": assignment.due_date,
            "end": assignment.due_date + timedelta(hours=1),
            "is_completed": assignment.is_completed,
        })

    for exam in exams:
        events.append({
            "id": f"exam-{exam.id}",
            "type": "exam",
            "title": exam.title,
            "course_id": exam.related_course.course_id,
            "course_name": exam.related_course.course_name,
            "start": exam.date,
            "end": exam.date + timedelta(minutes=exam.duration_minutes),
            "location": exam.location,
            "duration_minutes": exam.duration_minutes,
        })

    events.sort(key=lambda x: x["start"])
    return Response(events)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def calendar_export_ics(request):
    # Only gets assignments/exams assigned to user
    assignments = Assignment.objects.filter(related_course__user=request.user).order_by("due_date")
    exams = Exam.objects.filter(related_course__user=request.user).order_by("date")

    cal = Calendar()
    cal.add("prodid", "-//Academic Planner//Calendar Export//EN")
    cal.add("version", "2.0")

    for assignment in assignments:
        event = Event()
        event.add("uid", f"assignment-{assignment.id}@academicplanner")
        event.add("summary", assignment.title)
        event.add("description", f"Assignment for {assignment.related_course.course_id}")
        event.add("dtstart", assignment.due_date)
        event.add("dtend", assignment.due_date + timedelta(hours=1))
        event.add("dtstamp", timezone.now())
        cal.add_component(event)

    for exam in exams:
        event = Event()
        event.add("uid", f"exam-{exam.id}@academicplanner")
        event.add("summary", exam.title)
        event.add("description", f"Exam for {exam.related_course.course_id}")
        if exam.location:
            event.add("location", exam.location)
        event.add("dtstart", exam.date)
        event.add("dtend", exam.date + timedelta(minutes=exam.duration_minutes))
        event.add("dtstamp", timezone.now())
        cal.add_component(event)

    response = HttpResponse(cal.to_ical(), content_type="text/calendar")
    response["Content-Disposition"] = 'attachment; filename="calendar.ics"'
    return response