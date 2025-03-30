from rest_framework import serializers
from .models import (
    Course, Module, Video, Enrollment, Test, Question, Choice,
    TestAttempt, QuestionAttempt, ChoiceAttempt, Certificate, Achievement
)
from users.serializers import UserSerializer

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'title', 'description', 'video_url', 'duration', 'order']

class ModuleSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'order', 'videos']

class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'image', 'price', 'duration',
            'instructor', 'level', 'is_paid', 'created_at', 'updated_at',
            'modules', 'is_enrolled'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrolled_students.filter(id=request.user.id).exists()
        return False

class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['title', 'description', 'image', 'price', 'duration', 'level', 'is_paid']

    def create(self, validated_data):
        validated_data['instructor'] = self.context['request'].user
        return super().create(validated_data)

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    student = UserSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'student', 'enrolled_at', 'is_completed', 'payment_status', 'payment_id']
        read_only_fields = ['enrolled_at', 'payment_status', 'payment_id']

class EnrollmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['course']

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'order']
        read_only_fields = ['is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_type', 'text', 'points', 'order', 'choices']
        read_only_fields = ['test']

class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    total_points = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = [
            'id', 'title', 'description', 'passing_score', 'time_limit',
            'is_final', 'questions', 'total_points', 'created_at', 'updated_at'
        ]
        read_only_fields = ['course']

    def get_total_points(self, obj):
        return sum(question.points for question in obj.questions.all())

class ChoiceAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoiceAttempt
        fields = ['id', 'choice', 'is_selected']

class QuestionAttemptSerializer(serializers.ModelSerializer):
    choice_attempts = ChoiceAttemptSerializer(many=True, read_only=True)

    class Meta:
        model = QuestionAttempt
        fields = [
            'id', 'question', 'answer_text', 'code_submission',
            'points_earned', 'is_correct', 'choice_attempts'
        ]
        read_only_fields = ['test_attempt']

class TestAttemptSerializer(serializers.ModelSerializer):
    question_attempts = QuestionAttemptSerializer(many=True, read_only=True)
    student_name = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = TestAttempt
        fields = [
            'id', 'test', 'student', 'student_name', 'course_title',
            'status', 'score', 'started_at', 'completed_at',
            'time_taken', 'question_attempts'
        ]
        read_only_fields = ['student']

    def get_student_name(self, obj):
        return obj.student.get_full_name()

    def get_course_title(self, obj):
        return obj.test.course.title

class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 'student', 'student_name', 'course', 'course_title',
            'test_attempt', 'issued_at', 'certificate_id', 'grade', 'is_valid'
        ]
        read_only_fields = ['student', 'certificate_id']

    def get_student_name(self, obj):
        return obj.student.get_full_name()

    def get_course_title(self, obj):
        return obj.course.title

class AchievementSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = [
            'id', 'student', 'student_name', 'type', 'title',
            'description', 'value', 'earned_at', 'expires_at', 'is_active'
        ]
        read_only_fields = ['student']

    def get_student_name(self, obj):
        return obj.student.get_full_name() 