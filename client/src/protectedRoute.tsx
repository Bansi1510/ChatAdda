import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUserStore from "./store/useUserStore";
import { checkUserAutheticatedAPI } from "./services/user.service";
import Loader from "./utils/Loader";

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  const { isAuthenticated, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await checkUserAutheticatedAPI();

        if (res?.user) {
          setUser(res.user);
        } else {
          clearUser();
        }
      } catch (error) {
        console.log(error);
        clearUser();
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [clearUser, setUser]);

  if (isChecking) return <Loader />;

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  }

  return <Outlet />;
};

export const PublicRoute: React.FC = () => {
  const { isAuthenticated } = useUserStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};


export default ProtectedRoute;