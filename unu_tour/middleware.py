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
