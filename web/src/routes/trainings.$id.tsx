import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const { account, hasRole } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["trainings"],
    queryFn: () => apiFetch("/trainings"),
  });

  const training = data?.data.find((t: any) => t.id === id);
  const estFormateur = training
    ? hasRole("formateur", training.center_id)
    : false;
  const estApprenant = training
    ? hasRole("apprenant", training.center_id)
    : false;

  const enroll = useMutation({
    mutationFn: () =>
      apiFetch("/enrollments", {
        method: "POST",
        body: JSON.stringify({ account_id: account!.id, training_id: id }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["enrollments", id] }),
  });

  if (isLoading) return <p style={{ padding: 24 }}>Chargement…</p>;
  if (!training) return <p style={{ padding: 24 }}>Formation introuvable.</p>;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 640 }}>
      <Link to="/trainings" style={{ fontSize: 14 }}>
        ← Catalogue
      </Link>
      <h1>{training.title}</h1>
      <p style={{ color: "#666" }}>{training.description}</p>

      {estFormateur && <FormateurPanel trainingId={id} />}

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
          {enroll.isSuccess ? (
            <p style={{ color: "#16a34a" }}>✓ Inscription réussie !</p>
          ) : (
            <>
              <p>Vous pouvez vous inscrire à cette formation.</p>
              <button
                onClick={() => enroll.mutate()}
                disabled={enroll.isPending}
              >
                {enroll.isPending ? "Inscription…" : "S'inscrire"}
              </button>
              {enroll.isError && (
                <p style={{ color: "crimson" }}>
                  {enroll.error instanceof Error
                    ? enroll.error.message
                    : "Erreur"}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {!estFormateur && !estApprenant && (
        <p style={{ color: "#888" }}>Vous n'avez pas de rôle dans ce centre.</p>
      )}
    </div>
  );
}

function FormateurPanel({ trainingId }: { trainingId: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["enrollments", trainingId],
    queryFn: () => apiFetch(`/trainings/${trainingId}/enrollments`),
  });

  const complete = useMutation({
    mutationFn: (enrollmentId: string) =>
      apiFetch(`/enrollments/${enrollmentId}/complete`, { method: "POST" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["enrollments", trainingId] }),
  });

  return (
    <div
      style={{
        border: "1px solid #d97706",
        background: "#fffbeb",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <strong>Espace formateur — inscrits</strong>
      {isLoading ? (
        <p>Chargement des inscrits…</p>
      ) : data.data.length === 0 ? (
        <p style={{ color: "#888" }}>Aucun inscrit pour l'instant.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
          {data.data.map((e: any) => (
            <li
              key={e.enrollment_id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid #f0e5c0",
              }}
            >
              <span>
                {e.apprenant} — <em style={{ color: "#999" }}>{e.status}</em>
              </span>
              {e.status === "completed" ? (
                <a
                  href={`/verify/${e.public_code}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 14 }}
                >
                  Voir le certificat ↗
                </a>
              ) : (
                <button
                  onClick={() => complete.mutate(e.enrollment_id)}
                  disabled={complete.isPending}
                >
                  Terminer &amp; certifier
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
