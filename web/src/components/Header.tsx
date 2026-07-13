import { Link, useNavigate } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export function Header() {
  const { account, roles, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const isAdminSomewhere = roles.some((r) => r.name === "admin");
  const isApprenantSomewhere = roles.some((r) => r.name === "apprenant");

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
              {isApprenantSomewhere && (
                <Link
                  to="/my-trainings"
                  className="transition-colors hover:text-foreground"
                >
                  Mes formations
                </Link>
              )}
              <Link
                to="/referral"
                className="transition-colors hover:text-foreground"
              >
                Parrainer
              </Link>
              {isAdminSomewhere && (
                <Link
                  to="/admin"
                  className="transition-colors hover:text-foreground"
                >
                  Administration
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Basculer le thème"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
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
