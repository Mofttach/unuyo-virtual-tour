from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Custom exception handler that wraps all DRF errors in a standard format:
    {
        "status": "error",
        "code": 400,
        "detail": "...",
        "errors": [...]
    }
    """
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # If response is None, it's an unexpected server error (500)
    # The standard Django 500 handler will catch it, or we could handle it here
    if response is not None:
        custom_data = {
            "status": "error",
            "code": response.status_code,
            "detail": "An error occurred",
        }
        
        # Extract detail message
        if isinstance(response.data, dict):
            if "detail" in response.data:
                custom_data["detail"] = response.data["detail"]
            else:
                custom_data["errors"] = response.data
                custom_data["detail"] = "Validation error"
        elif isinstance(response.data, list):
             custom_data["errors"] = response.data
             custom_data["detail"] = "Multiple errors occurred"
             
        response.data = custom_data

    return response
