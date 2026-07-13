import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import "../styles.css";
import { AuthProvider } from "#/auth/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "#/components/header";

const queryClient = new QueryClient();
export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="min-h-screen bg-muted/30">
            <Header />
            <main className="mx-auto max-w-4xl px-4 py-8">
              <Outlet />
            </main>
          </div>
        </AuthProvider>
      </QueryClientProvider>
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
