from django.test import TestCase

# Create your tests here.
from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Course, Assignment, Exam


class CalendarAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )

        self.other_user = User.objects.create_user(
            username="otheruser",
            password="otherpass123"
        )

        self.course = Course.objects.create(
            user=self.user,
            course_id="CS3704",
            course_name="Software Engineering"
        )

        self.other_course = Course.objects.create(
            user=self.other_user,
            course_id="MATH101",
            course_name="Math"
        )

        self.assignment = Assignment.objects.create(
            title="Assignment 1",
            due_date=timezone.now() + timedelta(days=1),
            related_course=self.course,
            is_completed=False
        )

        self.exam = Exam.objects.create(
            title="Exam 1",
            date=timezone.now() + timedelta(days=2),
            location="Room 101",
            duration_minutes=90,
            related_course=self.course
        )

        self.other_assignment = Assignment.objects.create(
            title="Other Assignment",
            due_date=timezone.now() + timedelta(days=3),
            related_course=self.other_course,
            is_completed=False
        )

        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

        self.calendar_url = "/api/calendar/"
        self.export_url = "/api/calendar/export/"

    def authenticate(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_calendar_requires_authentication(self):
        response = self.client.get(self.calendar_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_calendar_returns_only_logged_in_users_events(self):
        self.authenticate()
        response = self.client.get(self.calendar_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        titles = [event["title"] for event in response.data]
        self.assertIn("Assignment 1", titles)
        self.assertIn("Exam 1", titles)
        self.assertNotIn("Other Assignment", titles)

    def test_calendar_contains_assignment_and_exam_types(self):
        self.authenticate()
        response = self.client.get(self.calendar_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        event_types = [event["type"] for event in response.data]
        self.assertIn("assignment", event_types)
        self.assertIn("exam", event_types)

    def test_calendar_export_requires_authentication(self):
        response = self.client.get(self.export_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_calendar_export_returns_ics_file(self):
        self.authenticate()
        response = self.client.get(self.export_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("text/calendar", response["Content-Type"])

        content = response.content.decode("utf-8")
        self.assertIn("BEGIN:VCALENDAR", content)
        self.assertIn("END:VCALENDAR", content)
        self.assertIn("SUMMARY:Assignment 1", content)
        self.assertIn("SUMMARY:Exam 1", content)
        self.assertNotIn("Other Assignment", content)