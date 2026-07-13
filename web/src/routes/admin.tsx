import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/admin")({
    component: () => (
        <RequireAuth>
            <AdminPage />
        </RequireAuth>
    ),
});

type AccountOption = { id: string; full_name: string };
type CenterOption = { id: string; name: string; city: string | null };
type CertRow = {
    id: string;
    public_code: string;
    status: "valid" | "revoked";
    apprenant: string;
    formation: string;
    issued_at: string;
    revoked_at: string | null;
};

function AdminPage() {
    const { roles } = useAuth();
    const isAdminSomewhere = roles.some((r) => r.name === "admin");

    if (!isAdminSomewhere) {
        return (
            <Alert>
                <AlertDescription>
                    Cette page est réservée aux administrateurs de centre.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Administration
                </h1>
                <p className="text-sm text-muted-foreground">
                    Gestion des rôles et des certificats des centres que vous administrez.
                </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <AttribuerRole
                    adminCenterIds={roles
                        .filter((r) => r.name === "admin")
                        .map((r) => r.center_id)}
                />
                <Certificats />
            </div>
        </div>
    );
}

function AttribuerRole({ adminCenterIds }: { adminCenterIds: string[] }) {
    const [accountId, setAccountId] = useState("");
    const [centerId, setCenterId] = useState("");
    const [roleName, setRoleName] = useState("formateur");

    const accounts = useQuery({
        queryKey: ["accounts"],
        queryFn: () => apiFetch("/accounts"),
    });
    const centers = useQuery({
        queryKey: ["centers"],
        queryFn: () => apiFetch("/centers"),
    });

    const attach = useMutation({
        mutationFn: () =>
            apiFetch(`/accounts/${accountId}/roles`, {
                method: "POST",
                body: JSON.stringify({ role: roleName, center_id: centerId }),
            }),
    });

    if (accounts.isLoading || centers.isLoading) return <Loader />;

    const accountOptions: AccountOption[] = accounts.data?.data ?? [];
    const centerOptions: CenterOption[] = (centers.data?.data ?? []).filter(
        (c: CenterOption) => adminCenterIds.includes(c.id),
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Attribuer un rôle</CardTitle>
                <CardDescription>
                    Donnez le rôle formateur ou apprenant à un compte, dans un centre que
                    vous administrez.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (accountId && centerId) attach.mutate();
                    }}
                    className="flex flex-col gap-4"
                >
                    <div className="flex flex-col gap-1.5">
                        <Label>Compte</Label>
                        <Select value={accountId} onValueChange={setAccountId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir un compte" />
                            </SelectTrigger>
                            <SelectContent>
                                {accountOptions.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Rôle</Label>
                        <Select value={roleName} onValueChange={setRoleName}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="formateur">Formateur</SelectItem>
                                <SelectItem value="apprenant">Apprenant</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Centre</Label>
                        <Select value={centerId} onValueChange={setCenterId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir un centre" />
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

                    {attach.isSuccess && (
                        <Alert>
                            <AlertDescription>✓ Rôle attribué.</AlertDescription>
                        </Alert>
                    )}
                    {attach.isError && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {attach.error instanceof Error
                                    ? attach.error.message
                                    : "Erreur"}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        disabled={attach.isPending || !accountId || !centerId}
                        className="w-fit"
                    >
                        {attach.isPending ? "Attribution…" : "Attribuer le rôle"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function Certificats() {
    const queryClient = useQueryClient();
    const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
    const [reason, setReason] = useState("");

    const certs = useQuery({
        queryKey: ["admin", "certificates"],
        queryFn: () => apiFetch("/admin/certificates"),
    });

    const revoke = useMutation({
        mutationFn: (certId: string) =>
            apiFetch(`/certificates/${certId}/revoke`, {
                method: "POST",
                body: JSON.stringify({ reason }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "certificates"] });
            setRevokeTarget(null);
            setReason("");
        },
    });

    if (certs.isLoading) return <Loader label="Chargement des certificats…" />;

    const rows: CertRow[] = certs.data?.data ?? [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Certificats émis</CardTitle>
                <CardDescription>
                    Révocation événementielle uniquement (fraude, erreur d'émission) —
                    motif obligatoire.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Aucun certificat émis pour l'instant.
                    </p>
                ) : (
                    <ul className="divide-y">
                        {rows.map((c) => (
                            <li key={c.id} className="flex flex-col gap-2 py-3">
                                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 sm:grid-cols-[1.2fr_1fr_auto_auto_auto]">
                                    <span className="truncate font-medium">{c.apprenant}</span>
                                    <span className="hidden truncate text-sm text-muted-foreground sm:block">
                                        {c.formation}
                                    </span>
                                    <Badge
                                        variant={c.status === 'valid' ? 'default' : 'destructive'}
                                        className="justify-self-start"
                                    >
                                        {c.status === 'valid' ? 'Valide' : 'Révoqué'}
                                    </Badge>
                                    <Button asChild variant="ghost" size="sm">
                                        <a href={`/verify/${c.public_code}`} target="_blank" rel="noreferrer">
                                            Voir ↗
                                        </a>
                                    </Button>
                                    {c.status === 'valid' ? (
                                        <Button variant="destructive" size="sm" onClick={() => setRevokeTarget(c.id)}>
                                            Révoquer
                                        </Button>
                                    ) : (
                                        <span />
                                    )}
                                </div>

                                {revokeTarget === c.id && (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (reason.trim()) revoke.mutate(c.id);
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <Input
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Motif de révocation (obligatoire)"
                                            required
                                        />
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            size="sm"
                                            disabled={revoke.isPending || !reason.trim()}
                                        >
                                            {revoke.isPending ? "…" : "Confirmer"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setRevokeTarget(null);
                                                setReason("");
                                            }}
                                        >
                                            Annuler
                                        </Button>
                                    </form>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                {revoke.isError && (
                    <Alert variant="destructive" className="mt-3">
                        <AlertDescription>
                            {revoke.error instanceof Error ? revoke.error.message : "Erreur"}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
