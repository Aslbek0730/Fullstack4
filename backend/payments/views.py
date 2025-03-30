from rest_framework import viewsets, views, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Payment
from .serializers import (
    PaymentSerializer,
    PaymentCreateSerializer,
    PaymentWebhookSerializer,
)
from .services import get_payment_service

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(enrollment__student=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer

    def create(self, request, *args, **kwargs):
        serializer = PaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        payment = serializer.save()
        payment_service = get_payment_service(payment.payment_method)
        
        try:
            payment_data = payment_service.create_payment(payment)
            return Response(payment_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            payment.status = 'failed'
            payment.error_message = str(e)
            payment.save()
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        payment = self.get_object()
        payment_service = get_payment_service(payment.payment_method)
        
        try:
            is_valid = payment_service.verify_payment(payment)
            if is_valid:
                payment.process_success()
                return Response({'status': 'success'})
            else:
                payment.process_failure('Payment verification failed')
                return Response(
                    {'error': 'Payment verification failed'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            payment.process_failure(str(e))
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class PaymentWebhookView(views.APIView):
    def post(self, request):
        serializer = PaymentWebhookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        payment_id = serializer.validated_data.get('payment_id')
        status = serializer.validated_data.get('status')
        transaction_id = serializer.validated_data.get('transaction_id')
        
        try:
            payment = Payment.objects.get(payment_id=payment_id)
            if status == 'success':
                payment.process_success()
            else:
                payment.process_failure('Payment failed')
            return Response({'status': 'success'})
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            ) 