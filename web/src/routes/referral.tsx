import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "@/components/Loader";

export const Route = createFileRoute("/referral")({
  component: () => (
    <RequireAuth>
      <ReferralPage />
    </RequireAuth>
  ),
});

type AccountOption = { id: string; full_name: string };
type CenterOption = { id: string; name: string; city: string | null };

function ReferralPage() {
  const { account } = useAuth();
  const [referredId, setReferredId] = useState("");
  const [centerId, setCenterId] = useState("");

  // Les deux listes qui alimentent les selects — plus aucun UUID à saisir.
  const accounts = useQuery({
    queryKey: ["accounts"],
    queryFn: () => apiFetch("/accounts"),
  });
  const centers = useQuery({
    queryKey: ["centers"],
    queryFn: () => apiFetch("/centers"),
  });

  const refer = useMutation({
    mutationFn: () =>
      apiFetch("/referrals", {
        method: "POST",
        body: JSON.stringify({
          referrer_id: account!.id,
          referred_id: referredId,
          center_id: centerId,
        }),
      }),
  });

  if (accounts.isLoading || centers.isLoading) {
    return <Loader label="Chargement des listes…" />;
  }

  if (accounts.error || centers.error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Impossible de charger les données. Réessayez.
        </AlertDescription>
      </Alert>
    );
  }

  const accountOptions: AccountOption[] = accounts.data?.data ?? [];
  const centerOptions: CenterOption[] = centers.data?.data ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (referredId && centerId) refer.mutate();
  }

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
          Parrainer une personne
        </h1>
        <p className="text-sm text-muted-foreground">
          La récompense se déclenche uniquement à la première inscription du
          filleul dans le centre.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Nouveau parrainage</CardTitle>
          <CardDescription>
            Vous parrainez en tant que <strong>{account?.full_name}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Filleul</Label>
              <Select value={referredId} onValueChange={setReferredId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir la personne à parrainer" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      Aucun autre compte disponible.
                    </p>
                  ) : (
                    accountOptions.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.full_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Centre</Label>
              <Select value={centerId} onValueChange={setCenterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le centre" />
                </SelectTrigger>
                <SelectContent>
                  {centerOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.city ? ` — ${c.city}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {refer.isSuccess && (
              <Alert>
                <AlertDescription>
                  ✓ Parrainage enregistré. Récompense en attente de la première
                  inscription.
                </AlertDescription>
              </Alert>
            )}
            {refer.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {refer.error instanceof Error
                    ? refer.error.message
                    : "Erreur"}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={refer.isPending || !referredId || !centerId}
              className="w-fit"
            >
              {refer.isPending
                ? "Enregistrement…"
                : "Enregistrer le parrainage"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
