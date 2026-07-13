import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
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
import { Loader } from "@/components/Loader";

export const Route = createFileRoute("/my-trainings")({
  component: () => (
    <RequireAuth>
      <MyTrainingsPage />
    </RequireAuth>
  ),
});

type MyEnrollment = {
  enrollment_id: string;
  training_id: string;
  training: string;
  status: "active" | "completed";
  completed_at: string | null;
  public_code: string | null;
};

function MyTrainingsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["me", "enrollments"],
    queryFn: () => apiFetch("/me/enrollments"),
  });

  if (isLoading) return <Loader label="Chargement de vos formations…" />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Impossible de charger vos formations.
        </AlertDescription>
      </Alert>
    );
  }

  const enrollments: MyEnrollment[] = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Mes formations
        </h1>
        <p className="text-sm text-muted-foreground">
          Vos inscriptions et vos certificats, au même endroit.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aucune inscription</CardTitle>
            <CardDescription>
              Parcourez le catalogue pour vous inscrire à votre première
              formation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/trainings">Voir le catalogue</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-4">
          {enrollments.map((e) => (
            <li key={e.enrollment_id}>
              <Card>
                <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{e.training}</span>
                    <Badge
                      variant={
                        e.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {e.status === "completed" ? "Terminée" : "En cours"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/trainings/$id" params={{ id: e.training_id }}>
                        Détails
                      </Link>
                    </Button>
                    {e.status === "completed" && e.public_code && (
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={`/verify/${e.public_code}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Mon certificat ↗
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
