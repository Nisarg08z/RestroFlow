import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getCurrentAdmin, getCurrentRestaurant } from "../utils/api";

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

        if (requiredRole === "ADMIN") {
          await getCurrentAdmin();
        } else if (requiredRole === "RESTAURANT") {
          await getCurrentRestaurant();
        }

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath = requiredRole === "ADMIN" ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
