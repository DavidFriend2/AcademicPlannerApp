from django.contrib import admin
from .models import Course, Assignment, Exam

# This tells Django to show these tables in the admin panel
admin.site.register(Course)
admin.site.register(Assignment)
admin.site.register(Exam)