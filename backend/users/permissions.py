from rest_framework.permissions import BasePermission


class IsAdminOrManager(BasePermission):
    """Permite acesso apenas a usuários com role ADMIN ou MANAGER."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ("ADMIN", "MANAGER")
        )


class IsAdmin(BasePermission):
    """Permite acesso apenas a usuários com role ADMIN."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMIN"
        )
