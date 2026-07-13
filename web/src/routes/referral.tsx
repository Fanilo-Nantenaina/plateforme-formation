import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/referral")({
  component: () => (
    <RequireAuth>
      <ReferralPage />
    </RequireAuth>
  ),
});

function ReferralPage() {
  const { account } = useAuth();
  const [referredId, setReferredId] = useState("");
  const [centerId, setCenterId] = useState("");

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    refer.mutate();
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
              <Label htmlFor="referred">Identifiant du filleul</Label>
              <Input
                id="referred"
                value={referredId}
                onChange={(e) => setReferredId(e.target.value)}
                placeholder="UUID du compte parrainé"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="center">Identifiant du centre</Label>
              <Input
                id="center"
                value={centerId}
                onChange={(e) => setCenterId(e.target.value)}
                placeholder="UUID du centre"
                required
              />
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

            <Button type="submit" disabled={refer.isPending} className="w-fit">
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
