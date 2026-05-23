import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { login, getMe, logoutApi } from "@/features/auth/services/auth.api";

const ROLE_LEVEL = {
  viewer: 1,
  manager: 2,
  admin: 3,
  superadmin: 4,
};

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (credentials) => login(credentials),
    onSuccess: (data) => {
      setAuth({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user,
      });
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    },
  });
}

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const data = await getMe();
      setUser(data);
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => logoutApi(),
    onSettled: () => {
      logout();
      navigate("/login", { replace: true });
    },
  });
}

export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}

export function useHasRole(minRole) {
  const role = useAuthStore((s) => s.user?.role);
  if (!role) return false;
  const userLevel = ROLE_LEVEL[role] ?? 0;
  const requiredLevel = ROLE_LEVEL[minRole] ?? 0;
  return userLevel >= requiredLevel;
}

export function useCanManageGames() {
  return useHasRole("manager");
}

export function useCanDeleteGames() {
  return useHasRole("admin");
}

export function useCanReadOrders() {
  return useHasRole("viewer");
}

export function useCanUpdateOrders() {
  return useHasRole("manager");
}

export function useCanReadClients() {
  return useHasRole("viewer");
}

export function useCanUpdateClients() {
  return useHasRole("manager");
}

export function useCanReadReviews() {
  return useHasRole("viewer");
}

export function useCanManageReviews() {
  return useHasRole("manager");
}

export function useCanDeleteReviews() {
  return useHasRole("admin");
}

export function useCanReadFaqs() {
  return useHasRole("viewer");
}

export function useCanManageFaqs() {
  return useHasRole("manager");
}

export function useCanDeleteFaqs() {
  return useHasRole("admin");
}
