"""Custom domain exceptions and HTTP error mappings for the platform."""

from fastapi import HTTPException, status


class DomainException(Exception):
    """Base domain exception."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class EntityNotFoundError(DomainException):
    """Raised when a requested resource is not found."""
    pass


class AuthenticationError(DomainException):
    """Raised when authentication fails."""
    pass


class AuthorizationError(DomainException):
    """Raised when user lacks permission to access a resource."""
    pass


class CloudServiceError(DomainException):
    """Raised when an external cloud provider (RDS, Cosmos, Firebase, Gemini) fails."""
    pass


def not_found_exception(entity_name: str, identifier: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{entity_name} with identifier '{identifier}' was not found.",
    )


def auth_exception(detail: str = "Could not validate credentials") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def forbidden_exception(detail: str = "Operation not permitted") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail,
    )


def bad_request_exception(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail,
    )
