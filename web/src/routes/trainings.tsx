import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { RequireAuth } from "../auth/RequireAuth";

export const Route = createFileRoute("/trainings")({
  component: () => (
    <RequireAuth>
      <TrainingsPage />
    </RequireAuth>
  ),
});

function TrainingsPage() {
  const { account, signOut } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["trainings"],
    queryFn: () => apiFetch("/trainings"),
  });

  if (isLoading) return <p style={{ padding: 24 }}>Chargement du catalogue…</p>;
  if (error)
    return (
      <p style={{ padding: 24, color: "crimson" }}>Erreur de chargement.</p>
    );

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 640 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Catalogue</h1>
        <div>
          <span style={{ color: "#666", marginRight: 12 }}>
            {account?.full_name}
          </span>
          <button onClick={signOut}>Déconnexion</button>
        </div>
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {data.data.map((t: any) => (
          <li
            key={t.id}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <strong>{t.title}</strong>
            <p style={{ color: "#666", margin: "4px 0 8px" }}>
              {t.description}
            </p>
            <Link
              to="/trainings/$id"
              params={{ id: t.id }}
              style={{ fontSize: 14 }}
            >
              Voir la formation →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
