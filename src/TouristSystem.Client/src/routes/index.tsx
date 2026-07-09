import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../app/store';

/// <summary>
/// Restricts access to authenticated users only.
/// </summary>
export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

/// <summary>
/// Enforces role bounds (e.g. Admin/Owners) for specific dashboard paths.
/// </summary>
export function RoleRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
