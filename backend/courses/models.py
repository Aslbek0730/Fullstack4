from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Course(models.Model):
    LEVEL_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='courses/')
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    duration = models.DurationField()  # Course duration in hours
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    is_paid = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    enrolled_students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='Enrollment',
        related_name='enrolled_courses'
    )

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    payment_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ['student', 'course']
        ordering = ['-enrolled_at']

class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        unique_together = ['course', 'order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Video(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    description = models.TextField()
    video_url = models.URLField()
    duration = models.DurationField()  # Video duration in minutes
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        unique_together = ['module', 'order']

    def __str__(self):
        return f"{self.module.title} - {self.title}"

class Test(models.Model):
    QUESTION_TYPES = (
        ('multiple_choice', 'Multiple Choice'),
        ('single_choice', 'Single Choice'),
        ('text', 'Text Answer'),
        ('code', 'Code Submission'),
    )

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tests')
    title = models.CharField(max_length=200)
    description = models.TextField()
    passing_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=70
    )
    time_limit = models.IntegerField(help_text='Time limit in minutes', null=True, blank=True)
    is_final = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=Test.QUESTION_TYPES)
    text = models.TextField()
    points = models.IntegerField(default=1)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.test.title} - Question {self.order}"

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.question.text[:50]} - Choice {self.order}"

class TestAttempt(models.Model):
    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('timeout', 'Timeout'),
    )

    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    score = models.IntegerField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_taken = models.IntegerField(null=True, blank=True)  # in seconds

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.test.title}"

class QuestionAttempt(models.Model):
    test_attempt = models.ForeignKey(TestAttempt, on_delete=models.CASCADE, related_name='question_attempts')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField(null=True, blank=True)
    code_submission = models.TextField(null=True, blank=True)
    points_earned = models.IntegerField(default=0)
    is_correct = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.test_attempt.student.get_full_name()} - {self.question.text[:50]}"

class ChoiceAttempt(models.Model):
    question_attempt = models.ForeignKey(QuestionAttempt, on_delete=models.CASCADE, related_name='choice_attempts')
    choice = models.ForeignKey(Choice, on_delete=models.CASCADE)
    is_selected = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.question_attempt.test_attempt.student.get_full_name()} - {self.choice.text[:50]}"

class Certificate(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    test_attempt = models.ForeignKey(TestAttempt, on_delete=models.CASCADE)
    issued_at = models.DateTimeField(auto_now_add=True)
    certificate_id = models.CharField(max_length=50, unique=True)
    grade = models.CharField(max_length=2)  # A, B, C, etc.
    is_valid = models.BooleanField(default=True)

    class Meta:
        ordering = ['-issued_at']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.course.title}"

class Achievement(models.Model):
    ACHIEVEMENT_TYPES = (
        ('certificate', 'Course Certificate'),
        ('discount', 'Course Discount'),
        ('badge', 'Achievement Badge'),
    )

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    value = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # For discounts
    earned_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.title}" 