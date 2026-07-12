import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import "../styles.css";
import { AuthProvider } from "#/auth/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Outlet />
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
