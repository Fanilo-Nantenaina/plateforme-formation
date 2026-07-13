import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";
import { RequireAuth } from "@/auth/RequireAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@/components/Loader";

export const Route = createFileRoute("/trainings_/$id")({
  component: () => (
    <RequireAuth>
      <TrainingDetail />
    </RequireAuth>
  ),
});

type Training = {
  id: string;
  title: string;
  description: string | null;
  center_id: string;
};

function TrainingDetail() {
  const { id } = useParams({ from: "/trainings_/$id" });
  const { account, hasRole, refresh } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["trainings"],
    queryFn: () => apiFetch("/trainings"),
  });

  const enroll = useMutation({
    mutationFn: () =>
      apiFetch("/enrollments", {
        method: "POST",
        body: JSON.stringify({ account_id: account!.id, training_id: id }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["enrollments", id] }),
  });

  const joinCenter = useMutation({
    mutationFn: (centerId: string) =>
      apiFetch("/me/roles", {
        method: "POST",
        body: JSON.stringify({ center_id: centerId }),
      }),
    onSuccess: () => refresh(),
  });

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Impossible de charger la formation.{" "}
          <Link
            to="/trainings"
            className="font-medium underline underline-offset-4"
          >
            Retour au catalogue
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  const training: Training | undefined = data?.data?.find(
    (t: Training) => t.id === id,
  );

  if (!training) {
    return (
      <Alert>
        <AlertDescription>
          Formation introuvable.{" "}
          <Link
            to="/trainings"
            className="font-medium underline underline-offset-4"
          >
            Retour au catalogue
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  const estFormateur = hasRole("formateur", training.center_id);
  const estApprenant = hasRole("apprenant", training.center_id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/trainings"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Catalogue
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {training.title}
        </h1>
        {training.description && (
          <p className="mt-1 text-muted-foreground">{training.description}</p>
        )}
        <div className="mt-3 flex gap-2">
          {estFormateur && (
            <Badge variant="secondary">Formateur de ce centre</Badge>
          )}
          {estApprenant && (
            <Badge variant="outline">Apprenant de ce centre</Badge>
          )}
        </div>
      </div>

      <Separator />

      {estFormateur && <FormateurPanel trainingId={id} />}

      {estApprenant && !estFormateur && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inscription</CardTitle>
            <CardDescription>
              Inscrivez-vous à cette formation. Un certificat vérifiable sera
              émis à la fin.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {enroll.isSuccess ? (
              <Alert>
                <AlertDescription>
                  ✓ Inscription réussie. Bonne formation !
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Button
                  onClick={() => enroll.mutate()}
                  disabled={enroll.isPending}
                  className="w-fit"
                >
                  {enroll.isPending
                    ? "Inscription…"
                    : "S'inscrire à cette formation"}
                </Button>
                {enroll.isError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {enroll.error instanceof Error
                        ? enroll.error.message
                        : "Erreur"}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!estFormateur && !estApprenant && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rejoindre ce centre</CardTitle>
            <CardDescription>
              Vous n'avez pas encore de rôle dans ce centre. Rejoignez-le comme
              apprenant pour pouvoir vous inscrire à ses formations.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              onClick={() => joinCenter.mutate(training.center_id)}
              disabled={joinCenter.isPending}
              className="w-fit"
            >
              {joinCenter.isPending
                ? "Adhésion…"
                : "Rejoindre ce centre comme apprenant"}
            </Button>
            {joinCenter.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {joinCenter.error instanceof Error
                    ? joinCenter.error.message
                    : "Erreur"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type EnrollmentRow = {
  enrollment_id: string;
  account_id: string;
  apprenant: string;
  status: "active" | "completed";
  public_code: string | null;
};

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Espace formateur — inscrits</CardTitle>
        <CardDescription>
          Terminez une formation pour émettre automatiquement le certificat de
          l'apprenant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader label="Chargement des inscrits…" />
        ) : data?.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun inscrit pour l'instant.
          </p>
        ) : (
          <ul className="divide-y">
            {(data?.data as EnrollmentRow[] | undefined)?.map((e) => (
              <li
                key={e.enrollment_id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{e.apprenant}</span>
                  <Badge
                    variant={e.status === "completed" ? "default" : "secondary"}
                  >
                    {e.status === "completed" ? "Terminée" : "En cours"}
                  </Badge>
                </div>
                {e.status === "completed" && e.public_code ? (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`/verify/${e.public_code}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Voir le certificat ↗
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => complete.mutate(e.enrollment_id)}
                    disabled={complete.isPending}
                  >
                    {complete.isPending ? "Émission…" : "Terminer & certifier"}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        {complete.isError && (
          <Alert variant="destructive" className="mt-3">
            <AlertDescription>
              {complete.error instanceof Error
                ? complete.error.message
                : "Erreur"}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
