import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, role, allowRoles = [], redirectPath = '/login' }) => {
  if (!isAuthenticated || (allowRoles.length && !allowRoles.includes(role))) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};  

export default ProtectedRoute;