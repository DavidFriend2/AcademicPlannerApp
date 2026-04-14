from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# This is the Course table and stores basic info about each class
class Course(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course_id = models.CharField(max_length=20)
    course_name = models.CharField(max_length=100)
    
    def __str__(self):
        # Shows course name
        return self.course_name 
# This table stores assignments and links each one to their respective course
class Assignment(models.Model):
    title = models.CharField(max_length=200)
    due_date = models.DateTimeField()
    # This links the assignment to a specific course
    related_course = models.ForeignKey(Course, on_delete=models.CASCADE) 
    is_completed = models.BooleanField(default=False)
    @property
    def is_overdue(self):
        return not self.is_completed and self.due_date < timezone.now()
    
    def __str__(self):
        return f"{self.title} - {self.related_course.course_id}"
# This table stores exams and also links to their course
class Exam(models.Model):
    title = models.CharField(max_length=200) # Exam name
    date = models.DateTimeField() # Exam Date/time
    location = models.CharField(max_length=200, blank=True, null=True) # (Optional) location of exam
    duration_minutes = models.IntegerField(default=50) # Default exam time (50 mins)
    # This links the exam to the Course table, just like assignments
    related_course = models.ForeignKey(Course, on_delete=models.CASCADE) 
    
    def __str__(self):
        return f"{self.title} - {self.related_course.course_id}" # Shows exam and course