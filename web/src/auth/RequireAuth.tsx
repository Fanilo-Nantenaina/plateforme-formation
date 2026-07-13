import { type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "./AuthContext";
import { Loader } from "@/components/Loader";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { account, loading } = useAuth();

  if (loading) return <Loader label="Vérification de la session…" />;

  if (!account) return <Navigate to="/login" />;

  return <>{children}</>;
}
