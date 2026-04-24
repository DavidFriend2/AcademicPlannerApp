from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from .models import Course, Assignment
from rest_framework.test import APIClient
from rest_framework import status

# checks @proporty to see if assignment is overdue
class AssignmentModelTests(TestCase):
    def test_is_overdue_property(self):
        """Unit Test: Check if an assignment due yesterday is marked as overdue."""
        # Create a fake user FIRST
        test_user = User.objects.create_user(username="teststudent", password="password")
        
        # Create the course, linking it to the test_user and using 'course_name'
        test_course = Course.objects.create(user=test_user, course_id="CS 101", course_name="Intro")
        yesterday = timezone.now() - timedelta(days=1)
        
        test_assignment = Assignment.objects.create(
            title="Late Homework",
            due_date=yesterday,
            is_completed=False,
            related_course=test_course
        )
        
        # Check if the model correctly calculates it as overdue
        self.assertTrue(test_assignment.is_overdue)
# Generate a Django integration test that verifies /api/assignments endpoint returns OK status
class APIIntegrationTests(TestCase):
    def test_get_assignments_api(self):
        """Integration Test: Ensure the API endpoint connects to the database and returns data."""
        client = APIClient()
        
        # Create a fake user 
        test_user = User.objects.create_user(username="teststudent", password="password")
        # Gives user ID Badge
        client.force_authenticate(user=test_user)

        # Create the course, linking it to the test_user
        test_course = Course.objects.create(user=test_user, course_id="CS 101", course_name="Intro")
        Assignment.objects.create(title="Test HW", due_date=timezone.now(), related_course=test_course)
        
        # Simulate the React frontend asking for data
        response = client.get('/api/assignments/')
        
        # Verify the waiter brought the food (Status 200 OK)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify the data list isn't empty
        self.assertGreater(len(response.data), 0)