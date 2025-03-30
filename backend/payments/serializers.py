from rest_framework import serializers
from .models import Payment
from courses.serializers import CourseSerializer

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['enrollment', 'payment_method', 'card_type']

    def validate(self, attrs):
        enrollment = attrs['enrollment']
        if enrollment.payment_status == 'completed':
            raise serializers.ValidationError('This enrollment has already been paid')
        if enrollment.payment_status == 'pending':
            raise serializers.ValidationError('A payment is already pending for this enrollment')
        return attrs

class PaymentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(source='enrollment.course', read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'enrollment', 'course', 'student_name', 'amount',
            'payment_method', 'card_type', 'status', 'transaction_id',
            'payment_id', 'created_at', 'updated_at', 'error_message'
        ]
        read_only_fields = [
            'amount', 'status', 'transaction_id', 'payment_id',
            'created_at', 'updated_at', 'error_message'
        ]

    def get_student_name(self, obj):
        return f"{obj.enrollment.student.first_name} {obj.enrollment.student.last_name}"

class PaymentWebhookSerializer(serializers.Serializer):
    transaction_id = serializers.CharField()
    payment_id = serializers.CharField()
    status = serializers.CharField()
    error_message = serializers.CharField(required=False, allow_null=True) 