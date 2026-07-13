import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiFetch, login } from "@/lib/api";

export type Role = { name: string; center_id: string };
export type Account = { id: string; full_name: string; phone: string };

type AuthState = {
  account: Account | null;
  roles: Role[];
  loading: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (name: string, centerId: string) => boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/me")
      .then((data) => {
        setAccount(data.account);
        setRoles(data.roles ?? []);
      })
      .catch(() => {
        setAccount(null);
        setRoles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function signIn(phone: string, password: string) {
    await login(phone, password);
    const data = await apiFetch("/me");
    setAccount(data.account);
    setRoles(data.roles ?? []);
  }

  async function signOut() {
    await apiFetch("/logout", { method: "POST" });
    setAccount(null);
    setRoles([]);
  }

  function hasRole(name: string, centerId: string) {
    return roles.some((r) => r.name === name && r.center_id === centerId);
  }

  return (
    <AuthContext.Provider
      value={{ account, roles, loading, signIn, signOut, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
