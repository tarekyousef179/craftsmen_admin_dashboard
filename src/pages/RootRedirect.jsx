import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RootRedirect = () => {
  const { user } = useAuth();

  if (user && user.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RootRedirect;
