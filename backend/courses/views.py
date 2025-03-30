from rest_framework import generics, status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
    Course, Module, Video, Enrollment, Test, Question, Choice,
    TestAttempt, QuestionAttempt, ChoiceAttempt, Certificate, Achievement
)
from .serializers import (
    CourseSerializer,
    CourseCreateSerializer,
    ModuleSerializer,
    VideoSerializer,
    EnrollmentSerializer,
    EnrollmentCreateSerializer,
    TestSerializer,
    QuestionSerializer,
    ChoiceSerializer,
    TestAttemptSerializer,
    QuestionAttemptSerializer,
    ChoiceAttemptSerializer,
    CertificateSerializer,
    AchievementSerializer
)

class IsInstructorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.user_type == 'instructor'

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsInstructorOrReadOnly]
    serializer_class = CourseSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return CourseCreateSerializer
        return CourseSerializer

    def get_queryset(self):
        queryset = Course.objects.all()
        level = self.request.query_params.get('level', None)
        is_paid = self.request.query_params.get('is_paid', None)
        instructor = self.request.query_params.get('instructor', None)

        if level:
            queryset = queryset.filter(level=level)
        if is_paid is not None:
            queryset = queryset.filter(is_paid=is_paid.lower() == 'true')
        if instructor:
            queryset = queryset.filter(instructor_id=instructor)

        return queryset

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        if course.enrolled_students.filter(id=request.user.id).exists():
            return Response(
                {'error': 'You are already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = EnrollmentCreateSerializer(data={'course': course.id})
        if serializer.is_valid():
            serializer.save(student=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsInstructorOrReadOnly]

    def get_queryset(self):
        return Module.objects.filter(course_id=self.kwargs['course_pk'])

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs['course_pk'])
        serializer.save(course=course)

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsInstructorOrReadOnly]

    def get_queryset(self):
        return Video.objects.filter(module_id=self.kwargs['module_pk'])

    def perform_create(self, serializer):
        module = get_object_or_404(Module, pk=self.kwargs['module_pk'])
        serializer.save(module=module)

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return EnrollmentCreateSerializer
        return EnrollmentSerializer

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=serializer.validated_data['course'].id)
        if course.enrolled_students.filter(id=self.request.user.id).exists():
            raise serializers.ValidationError('You are already enrolled in this course')
        serializer.save(student=self.request.user)

class TestViewSet(viewsets.ModelViewSet):
    serializer_class = TestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs.get('course_pk')
        return Test.objects.filter(course_id=course_id)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

class TestAttemptViewSet(viewsets.ModelViewSet):
    serializer_class = TestAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        test_id = self.kwargs.get('test_pk')
        return TestAttempt.objects.filter(
            test_id=test_id,
            student=self.request.user
        )

    def create(self, request, *args, **kwargs):
        test = get_object_or_404(Test, pk=kwargs.get('test_pk'))
        
        # Check if user is enrolled in the course
        enrollment = get_object_or_404(
            Enrollment,
            course=test.course,
            student=request.user
        )

        # Check if there's an active attempt
        active_attempt = TestAttempt.objects.filter(
            test=test,
            student=request.user,
            status='in_progress'
        ).first()

        if active_attempt:
            return Response(
                {'error': 'You already have an active attempt'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create new attempt
        attempt = TestAttempt.objects.create(
            test=test,
            student=request.user
        )

        # Create question attempts
        for question in test.questions.all():
            QuestionAttempt.objects.create(
                test_attempt=attempt,
                question=question
            )

        serializer = self.get_serializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        attempt = self.get_object()
        
        if attempt.status != 'in_progress':
            return Response(
                {'error': 'This attempt is not in progress'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate score
        total_points = 0
        earned_points = 0

        for question_attempt in attempt.question_attempts.all():
            question = question_attempt.question
            total_points += question.points

            if question.question_type in ['multiple_choice', 'single_choice']:
                selected_choices = question_attempt.choice_attempts.filter(is_selected=True)
                correct_choices = question.choices.filter(is_correct=True)
                
                if set(selected_choices.values_list('choice_id', flat=True)) == \
                   set(correct_choices.values_list('id', flat=True)):
                    earned_points += question.points
                    question_attempt.is_correct = True
                    question_attempt.points_earned = question.points
                else:
                    question_attempt.is_correct = False
                    question_attempt.points_earned = 0

            elif question.question_type == 'text':
                # Implement text answer validation logic here
                question_attempt.is_correct = True
                question_attempt.points_earned = question.points
                earned_points += question.points

            elif question.question_type == 'code':
                # Implement code submission validation logic here
                question_attempt.is_correct = True
                question_attempt.points_earned = question.points
                earned_points += question.points

            question_attempt.save()

        # Calculate final score
        score = int((earned_points / total_points) * 100) if total_points > 0 else 0
        attempt.score = score
        attempt.status = 'completed'
        attempt.completed_at = timezone.now()
        attempt.time_taken = (attempt.completed_at - attempt.started_at).total_seconds()
        attempt.save()

        # Check if test is passed and create certificate if it's a final test
        if attempt.test.is_final and score >= attempt.test.passing_score:
            self._create_certificate(attempt)
            self._create_achievements(attempt)

        return Response({
            'score': score,
            'total_points': total_points,
            'earned_points': earned_points,
            'passed': score >= attempt.test.passing_score
        })

    def _create_certificate(self, attempt):
        # Generate certificate ID
        certificate_id = f"CERT-{attempt.student.id}-{attempt.test.course.id}-{attempt.id}"
        
        # Determine grade based on score
        if attempt.score >= 90:
            grade = 'A'
        elif attempt.score >= 80:
            grade = 'B'
        elif attempt.score >= 70:
            grade = 'C'
        else:
            grade = 'D'

        Certificate.objects.create(
            student=attempt.student,
            course=attempt.test.course,
            test_attempt=attempt,
            certificate_id=certificate_id,
            grade=grade
        )

    def _create_achievements(self, attempt):
        # Create certificate achievement
        Achievement.objects.create(
            student=attempt.student,
            type='certificate',
            title=f'Certificate for {attempt.test.course.title}',
            description=f'Successfully completed {attempt.test.course.title} with grade {attempt.score}%'
        )

        # Create discount achievement for high scores
        if attempt.score >= 90:
            Achievement.objects.create(
                student=attempt.student,
                type='discount',
                title='High Performance Discount',
                description='Earned 10% discount on next course for achieving 90% or higher',
                value=10.00
            )

class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Achievement.objects.filter(
            student=self.request.user,
            is_active=True
        ).select_related('student') 