import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentAdmin } from "../utils/api";

const ProtectedRoute = ({ children, requiredRole = "ADMIN" }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const role = localStorage.getItem("role");
        
        if (!role || role !== requiredRole) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        await getCurrentAdmin();
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("role");
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.13_0.005_260)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[oklch(0.7_0.18_45)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[oklch(0.98_0_0)]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

