import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute/ProtectedRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { GamesListPage } from "@/features/games/pages/GamesListPage";
import { GameFormPage } from "@/features/games/pages/GameFormPage";
import { ServicesListPage } from "@/features/services/pages/ServicesListPage";
import { ServiceFormPage } from "@/features/services/pages/ServiceFormPage";
import { OrdersListPage } from "@/features/orders/pages/OrdersListPage";
import { OrderDetailPage } from "@/features/orders/pages/OrderDetailPage";
import { ClientsListPage } from "@/features/clients/pages/ClientsListPage";
import { ClientDetailPage } from "@/features/clients/pages/ClientDetailPage";
import { ReviewsListPage } from "@/features/reviews/pages/ReviewsListPage";
import { ReviewFormPage } from "@/features/reviews/pages/ReviewFormPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { Spinner } from "@/components/ui/Spinner/Spinner";

// Dashboard pulls in recharts (~113 KB gzipped). Lazy-load it so other
// routes don't pay that cost on first paint.
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);

function PageFallback() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <Spinner size="lg" />
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<PageFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      { path: "games", element: <GamesListPage /> },
      { path: "games/new", element: <GameFormPage /> },
      { path: "games/:id/edit", element: <GameFormPage /> },
      { path: "services", element: <ServicesListPage /> },
      { path: "services/new", element: <ServiceFormPage /> },
      { path: "services/:id/edit", element: <ServiceFormPage /> },
      { path: "orders", element: <OrdersListPage /> },
      { path: "orders/:id", element: <OrderDetailPage /> },
      { path: "clients", element: <ClientsListPage /> },
      { path: "clients/:id", element: <ClientDetailPage /> },
      { path: "reviews", element: <ReviewsListPage /> },
      { path: "reviews/new", element: <ReviewFormPage /> },
      { path: "reviews/:id/edit", element: <ReviewFormPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
