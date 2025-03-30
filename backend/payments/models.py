from django.db import models
from django.conf import settings
from courses.models import Course, Enrollment

class Payment(models.Model):
    PAYMENT_METHODS = (
        ('click', 'Click'),
        ('payme', 'Payme'),
        ('uzum', 'Uzum Bank'),
    )

    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )

    CARD_TYPES = (
        ('uzcard', 'UzCard'),
        ('humo', 'Humo'),
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
    )

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    card_type = models.CharField(max_length=20, choices=CARD_TYPES)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    transaction_id = models.CharField(max_length=100, unique=True)
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.transaction_id} - {self.status}"

    def process_successful_payment(self):
        self.status = 'completed'
        self.save()
        self.enrollment.payment_status = 'completed'
        self.enrollment.payment_id = self.payment_id
        self.enrollment.save()

    def process_failed_payment(self, error_message):
        self.status = 'failed'
        self.error_message = error_message
        self.save()
        self.enrollment.payment_status = 'failed'
        self.enrollment.save() 