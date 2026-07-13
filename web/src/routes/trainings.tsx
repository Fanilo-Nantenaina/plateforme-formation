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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@/components/Loader";

export const Route = createFileRoute("/trainings")({
  component: () => (
    <RequireAuth>
      <TrainingsPage />
    </RequireAuth>
  ),
});

type Training = {
  id: string;
  title: string;
  description: string | null;
  center_id: string;
};

function TrainingsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["trainings"],
    queryFn: () => apiFetch("/trainings"),
  });

  if (isLoading) return <Loader label="Chargement du catalogue…" />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Impossible de charger le catalogue. Réessayez.
        </AlertDescription>
      </Alert>
    );
  }

  const trainings: Training[] = data.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Catalogue des formations
        </h1>
        <p className="text-sm text-muted-foreground">
          Les formations certifiantes proposées par les centres.
        </p>
      </div>

      {trainings.length === 0 ? (
        <p className="text-muted-foreground">
          Aucune formation disponible pour le moment.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trainings.map((t) => (
            <Card key={t.id} className="flex flex-col">
              <CardHeader className="flex-1">
                <CardTitle className="text-lg">{t.title}</CardTitle>
                {t.description && (
                  <CardDescription>{t.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link to="/trainings/$id" params={{ id: t.id }}>
                    Voir la formation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
