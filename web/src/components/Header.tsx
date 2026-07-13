import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";

export function Header() {
  const { account, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold tracking-tight">
            Plateforme Formation
          </Link>
          {account && (
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link
                to="/trainings"
                className="transition-colors hover:text-foreground"
              >
                Catalogue
              </Link>
              <Link
                to="/referral"
                className="transition-colors hover:text-foreground"
              >
                Parrainer
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {account ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {account.full_name}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Déconnexion
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Se connecter</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
