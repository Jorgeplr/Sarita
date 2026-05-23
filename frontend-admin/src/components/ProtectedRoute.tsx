import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import FullPageSpinner from "./FullPageSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthed } = useAuth();

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
