import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: ({ user, accessToken, refreshToken }) => {
        set({
          user: user ?? get().user,
          accessToken: accessToken ?? get().accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
          isAuthenticated: Boolean(accessToken ?? get().accessToken),
        });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      refreshTokens: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          throw new Error("No refresh token");
        }
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );
        if (!data?.access_token) {
          throw new Error("Invalid refresh response");
        }
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token ?? refreshToken,
          user: data.user ?? get().user,
          isAuthenticated: true,
        });
        return data.access_token;
      },
    }),
    {
      name: "nanoboost-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
