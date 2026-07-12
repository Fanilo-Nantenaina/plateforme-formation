import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    setError("");
    setBusy(true);
    try {
      await signIn(phone, password);
      navigate({ to: "/trainings" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 320 }}>
      <h1>Connexion</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Téléphone (+261…)"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Mot de passe"
        />
        <button onClick={handleLogin} disabled={busy}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </div>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}
