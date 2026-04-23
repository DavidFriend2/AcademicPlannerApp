from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from .models import Course, Assignment
from django.utils import timezone

class CalendarExportTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # creates two distinct users
        self.user_david = User.objects.create_user(username="david", password="password")
        self.user_dave = User.objects.create_user(username="dave", password="password")

        # creates a course for each user
        self.course_david = Course.objects.create(user=self.user_david, course_id="CS 3704", course_name="Software Engineering")
        self.course_dave = Course.objects.create(user=self.user_dave, course_id="CS 3114", course_name="Data Structures and Algorithms")

        # creates an assignment for each user
        self.assignment_david = Assignment.objects.create(title="Project", due_date=timezone.now(), related_course=self.course_david)
        self.assignment_dave = Assignment.objects.create(title="Homework", due_date=timezone.now(), related_course=self.course_dave)

    def test_ics_export_user_filtering(self): # integration test to ensure calendar export contains only users data 
        # authenticate as the user David
        self.client.force_authenticate(user=self.user_david)
        
        response = self.client.get('/api/calendar/export/')
        # ensure a correct response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/calendar')

        # decode .ics file to text
        content = response.content.decode()

        # ensure the user Davids course is in the file and the user Daves is not
        self.assertIn("CS 3704", content)
        self.assertNotIn("CS 3114", content)

        # ensure the user Davids assignment is in the file and the user Daves is not
        self.assertIn("Project", content)
        self.assertNotIn("Homework", content)

    def test_ics_export_authentication(self): # unit test to ensure unauthed users are not allowed to use export function
        client = APIClient()
        
        response = client.get('/api/calendar/export/')
        
        # ensure 401 unauthed status code
        self.assertEqual(response.status_code, 401)
