from django.db import connections, OperationalError
from django.http import HttpResponse

class DatabaseErrorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except OperationalError as e:
            # Check if it's a connection error
            if 'connection to server' in str(e) or 'Tenant or user not found' in str(e):
                return HttpResponse(
                    f"<h1>Database Connection Error</h1>"
                    f"<p>Could not connect to the database. Please check your credentials.</p>"
                    f"<pre>{e}</pre>"
                    f"<p><strong>Troubleshooting:</strong><br>"
                    f"1. Check if the 'DATABASE_URL' is correct.<br>"
                    f"2. Ensure username includes project ref (e.g. postgres.projectref).<br>"
                    f"3. Check if password includes special characters (must be URL encoded).</p>",
                    status=503
                )
            raise e

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        from django.conf import settings
        print("="*30)
        print("DEBUG REQUEST HEADERS:")
        print(f"Path: {request.path}")
        print(f"Scheme: {request.scheme}")
        print(f"Host: {request.get_host()}")
        print(f"Referer: {request.META.get('HTTP_REFERER', 'None')}")
        print(f"Origin: {request.META.get('HTTP_ORIGIN', 'None')}")
        print(f"X-Forwarded-Proto: {request.META.get('HTTP_X_FORWARDED_PROTO', 'None')}")
        print(f"CSRF_TRUSTED_ORIGINS (Active): {settings.CSRF_TRUSTED_ORIGINS}")
        print("="*30)
        
        response = self.get_response(request)
        return response

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log Headers relevant to CSRF
        print("DEBUG REQUEST HEADERS:")
        print(f"Scheme: {request.scheme}")
        print(f"Host: {request.get_host()}")
        print(f"Referer: {request.META.get('HTTP_REFERER', 'None')}")
        print(f"Origin: {request.META.get('HTTP_ORIGIN', 'None')}")
        print(f"X-Forwarded-Proto: {request.META.get('HTTP_X_FORWARDED_PROTO', 'None')}")
        
        response = self.get_response(request)
        return response
