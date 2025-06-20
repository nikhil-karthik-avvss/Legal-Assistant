# models.py
from django.db import models

class OfficerPhoto(models.Model):
    officer_id = models.CharField(max_length=20, unique=True)
    photo = models.ImageField(upload_to='officer_photos/')

class CitizenPhoto(models.Model):
    citizen_id = models.CharField(max_length=100, primary_key=True)
    photo = models.ImageField(upload_to='citizen_photos/')

    def __str__(self):
        return self.citizen_id