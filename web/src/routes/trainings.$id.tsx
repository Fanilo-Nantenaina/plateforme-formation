import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { RequireAuth } from "../auth/RequireAuth";

export const Route = createFileRoute("/trainings/$id")({
  component: () => (
    <RequireAuth>
      <TrainingDetail />
    </RequireAuth>
  ),
});

function TrainingDetail() {
  const { id } = useParams({ from: "/trainings/$id" });
  const { hasRole } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["training", id],
    queryFn: () => apiFetch("/trainings"),
  });

  if (isLoading) return <p style={{ padding: 24 }}>Chargement…</p>;

  const training = data.data.find((t: any) => t.id === id);
  if (!training) return <p style={{ padding: 24 }}>Formation introuvable.</p>;

  const estFormateur = hasRole("formateur", training.center_id);
  const estApprenant = hasRole("apprenant", training.center_id);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 560 }}>
      <h1>{training.title}</h1>
      <p style={{ color: "#666" }}>{training.description}</p>

      {estFormateur && (
        <div
          style={{
            border: "1px solid #d97706",
            background: "#fffbeb",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <strong>Espace formateur</strong>
          <p>
            Gérer les inscrits, marquer les formations terminées, émettre les
            certificats.
          </p>
        </div>
      )}

      {estApprenant && !estFormateur && (
        <div
          style={{
            border: "1px solid #16a34a",
            background: "#f0fdf4",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <strong>Espace apprenant</strong>
          <p>Vous pouvez vous inscrire à cette formation.</p>
          <button>S'inscrire</button>
        </div>
      )}

      {!estFormateur && !estApprenant && (
        <p style={{ color: "#888" }}>Vous n'avez pas de rôle dans ce centre.</p>
      )}
    </div>
  );
}
