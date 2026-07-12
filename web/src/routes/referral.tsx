import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { RequireAuth } from "../auth/RequireAuth";

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

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 420 }}>
      <Link to="/trainings" style={{ fontSize: 14 }}>
        ← Catalogue
      </Link>
      <h1>Parrainer une personne</h1>
      <p style={{ color: "#666" }}>
        En tant que <strong>{account?.full_name}</strong>, enregistrez un
        filleul. La récompense se déclenchera à sa première inscription dans le
        centre.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          value={referredId}
          onChange={(e) => setReferredId(e.target.value)}
          placeholder="Identifiant du filleul (UUID)"
        />
        <input
          value={centerId}
          onChange={(e) => setCenterId(e.target.value)}
          placeholder="Identifiant du centre (UUID)"
        />
        <button onClick={() => refer.mutate()} disabled={refer.isPending}>
          {refer.isPending ? "Enregistrement…" : "Enregistrer le parrainage"}
        </button>
      </div>

      {refer.isSuccess && (
        <p style={{ color: "#16a34a" }}>
          ✓ Parrainage enregistré. Récompense en attente de la première
          inscription.
        </p>
      )}
      {refer.isError && (
        <p style={{ color: "crimson" }}>
          {refer.error instanceof Error ? refer.error.message : "Erreur"}
        </p>
      )}
    </div>
  );
}
