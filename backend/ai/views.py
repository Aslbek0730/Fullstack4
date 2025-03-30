from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from rest_framework.parsers import JSONParser
from rest_framework.exceptions import ValidationError, APIException
from openai import OpenAI, OpenAIError, AuthenticationError
import os
import logging
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie

# Configure logging
logger = logging.getLogger(__name__)

class ChatRateThrottle(UserRateThrottle):
    rate = '5/minute'

class CourseRateThrottle(UserRateThrottle):
    rate = '3/hour'

class OpenAIAPIError(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'OpenAI API service is currently unavailable'

def get_openai_client():
    if not settings.OPENAI_API_KEY:
        logger.error("OpenAI API key is not configured")
        raise ImproperlyConfigured('OpenAI API key is not configured')
    return OpenAI(api_key=settings.OPENAI_API_KEY)

class ChatView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ChatRateThrottle]
    parser_classes = [JSONParser]
    
    def post(self, request):
        try:
            message = request.data.get('message', '').strip()
            
            if not message:
                logger.warning(f"Empty message received from user {request.user.id}")
                return Response(
                    {'error': 'Message is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if we have a cached response
            cache_key = f"chat_{request.user.id}_{message}"
            cached_response = cache.get(cache_key)
            if cached_response:
                logger.info(f"Cache hit for user {request.user.id}")
                return Response(cached_response)

            logger.info(f"Processing chat request for user {request.user.id}")
            client = get_openai_client()
            
            try:
                completion = client.chat.completions.create(
                    model='gpt-3.5-turbo',
                    messages=[
                        {
                            'role': 'system',
                            'content': '''You are an AI assistant for Shams Academy Inventors School. 
                            You can help users with:
                            1. Course selection and recommendations
                            2. Programming questions and explanations
                            3. Payment and subscription information
                            4. General questions about the platform
                            
                            Be friendly, professional, and concise in your responses.'''
                        },
                        {
                            'role': 'user',
                            'content': message,
                        },
                    ],
                    temperature=0.7,
                    max_tokens=150,
                )
            except AuthenticationError as e:
                logger.error(f"OpenAI API authentication error: {str(e)}")
                raise ImproperlyConfigured('Invalid OpenAI API key')
            except OpenAIError as e:
                logger.error(f"OpenAI API error for user {request.user.id}: {str(e)}")
                raise OpenAIAPIError(detail=str(e))

            response_data = {
                'response': completion.choices[0].message.content
            }
            
            # Cache the response for 5 minutes
            cache.set(cache_key, response_data, 300)
            logger.info(f"Successfully processed chat request for user {request.user.id}")
            
            return Response(response_data)
            
        except OpenAIAPIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=e.status_code
            )
        except ImproperlyConfigured as e:
            logger.error(f"Configuration error: {str(e)}")
            return Response(
                {'error': 'Service is not properly configured'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except ValidationError as e:
            logger.warning(f"Validation error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GenerateCourseView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [CourseRateThrottle]
    parser_classes = [JSONParser]
    
    def post(self, request):
        try:
            topic = request.data.get('topic', '').strip()
            level = request.data.get('level', '').strip()
            
            if not topic or not level:
                logger.warning(f"Missing required fields from user {request.user.id}")
                return Response(
                    {'error': 'Topic and level are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate level
            valid_levels = ['beginner', 'intermediate', 'advanced']
            if level.lower() not in valid_levels:
                logger.warning(f"Invalid level '{level}' from user {request.user.id}")
                return Response(
                    {'error': f'Level must be one of: {", ".join(valid_levels)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if we have a cached response
            cache_key = f"course_{request.user.id}_{topic}_{level}"
            cached_response = cache.get(cache_key)
            if cached_response:
                logger.info(f"Cache hit for user {request.user.id}")
                return Response(cached_response)

            logger.info(f"Processing course generation request for user {request.user.id}")
            client = get_openai_client()
            
            try:
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {
                            "role": "system",
                            "content": f"You are a professional course content creator. Create a detailed course outline for a {level} level course on {topic}."
                        }
                    ],
                    temperature=0.7,
                    max_tokens=1000,
                )
            except AuthenticationError as e:
                logger.error(f"OpenAI API authentication error: {str(e)}")
                raise ImproperlyConfigured('Invalid OpenAI API key')
            except OpenAIError as e:
                logger.error(f"OpenAI API error for user {request.user.id}: {str(e)}")
                raise OpenAIAPIError(detail=str(e))

            response_data = {
                'content': response.choices[0].message.content
            }
            
            # Cache the response for 1 hour
            cache.set(cache_key, response_data, 3600)
            logger.info(f"Successfully processed course generation request for user {request.user.id}")
            
            return Response(response_data)
            
        except OpenAIAPIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=e.status_code
            )
        except ImproperlyConfigured as e:
            logger.error(f"Configuration error: {str(e)}")
            return Response(
                {'error': 'Service is not properly configured'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except ValidationError as e:
            logger.warning(f"Validation error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 