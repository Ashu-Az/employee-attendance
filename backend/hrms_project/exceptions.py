from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Normalise every DRF error into {"message": "..."} so the frontend
    doesn't have to parse different shapes depending on the error type.
    """
    response = exception_handler(exc, context)

    if response is None:
        return response

    # Flatten whatever DRF gave us into a list of plain strings
    errors = []

    if isinstance(response.data, dict):
        for key, value in response.data.items():
            if isinstance(value, list):
                errors.extend(str(v) for v in value)
            else:
                errors.append(str(value))
    elif isinstance(response.data, list):
        errors = [str(v) for v in response.data]

    # Return only the first error – keeps it simple for the UI
    if errors:
        response.data = {'message': errors[0]}

    return response
