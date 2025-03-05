import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  const user = localStorage.getItem("user");
  const location = useLocation();

  return user ? (
    children ? <>{children}</> : <Outlet />
  ) : (
    <Navigate to="/auth/sign-in" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;
