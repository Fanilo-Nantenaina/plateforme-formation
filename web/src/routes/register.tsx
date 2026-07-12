import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleRegister() {
    setError("");
    setBusy(true);
    try {
      await apiFetch("/accounts", {
        method: "POST",
        body: JSON.stringify({ full_name: fullName, phone, password }),
      });
      await signIn(phone, password);
      navigate({ to: "/trainings" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 340 }}>
      <h1>Créer un compte</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nom complet"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Téléphone (+261…)"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Mot de passe (min. 8 caractères)"
        />
        <button onClick={handleRegister} disabled={busy}>
          {busy ? "Création…" : "Créer mon compte"}
        </button>
      </div>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <p style={{ fontSize: 14, marginTop: 16 }}>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}
