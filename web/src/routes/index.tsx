import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "../auth/AuthContext";

export const Route = createFileRoute("/")({ component: IndexPage });

function IndexPage() {
  const { account, loading } = useAuth();

  if (loading) return <p style={{ padding: 24 }}>Chargement…</p>;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 480 }}>
      <h1>Plateforme de formation</h1>
      {account ? (
        <p>
          Connecté en tant que <strong>{account.full_name}</strong>.{" "}
          <Link to="/trainings">Voir le catalogue →</Link>
        </p>
      ) : (
        <p>
          <Link to="/login">Se connecter</Link> pour accéder au catalogue.
        </p>
      )}
    </div>
  );
}
