import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";

const ProtectedRoute = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  const user = localStorage.getItem("user");
  const [cookies, setCookie] = useCookies(['accessToken']);
  console.log(cookies);
  
  
  const location = useLocation();

  return (user) ? (
    children ? <>{children}</> : <Outlet />
  ) : (
    <Navigate to="/auth/sign-in" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;
