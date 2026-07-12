async function getCsrfCookie(): Promise<void> {
  await fetch("/sanctum/csrf-cookie", { credentials: "include" });
}

function getXsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": getXsrfToken(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `Erreur ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function login(phone: string, password: string) {
  await getCsrfCookie();
  return apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  });
}
