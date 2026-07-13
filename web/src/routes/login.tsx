import {
  createFileRoute,
  useNavigate,
  Link,
  Navigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "#/components/Loader";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { account, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <Loader />;
  if (account) return <Navigate to="/trainings" />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(phone, password);
      navigate({ to: "/trainings" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex justify-center pt-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Accédez à votre espace avec votre numéro de téléphone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+261 32 70 498 50"
                autoComplete="tel"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Connexion…" : "Se connecter"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Pas de compte ?{" "}
              <Link
                to="/register"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Créer un compte
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
