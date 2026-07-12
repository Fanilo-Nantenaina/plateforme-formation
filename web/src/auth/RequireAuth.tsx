import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { account, loading } = useAuth();

  if (loading) return <p style={{ padding: 24 }}>Chargement…</p>;

  if (!account) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <p>Vous devez être connecté.</p>
        <Link to="/login">Se connecter</Link>
      </div>
    );
  }

  return <>{children}</>;
}
