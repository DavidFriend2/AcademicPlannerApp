from django.db import models

class Course(models.Model):
    course_id = models.CharField(max_length=20)
    course_name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.course_name

class Assignment(models.Model):
    title = models.CharField(max_length=200)
    due_date = models.DateTimeField()
    # This links the assignment to a specific course
    related_course = models.ForeignKey(Course, on_delete=models.CASCADE) 
    is_completed = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.title} - {self.related_course.course_id}"

class Exam(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateTimeField()
    location = models.CharField(max_length=200, blank=True, null=True)
    duration_minutes = models.IntegerField(default=50)
    # This links the exam to the Course table, just like assignments!
    related_course = models.ForeignKey(Course, on_delete=models.CASCADE) 
    
    def __str__(self):
        return f"{self.title} - {self.related_course.course_id}"