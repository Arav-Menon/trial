"use client";

import { create } from "zustand";
import type { User } from "@/types";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const { user, token } = await api.login({ email, password });
    api.setToken(token);
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },

  register: async (name: string, email: string, password: string) => {
    const { user, token } = await api.register({ name, email, password });
    api.setToken(token);
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    api.setToken(null);
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isLoading: false });
      return;
    }

    api.setToken(token);
    try {
      const { user } = await api.getMe();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("token");
      api.setToken(null);
      set({ isLoading: false });
    }
  },

  updateUser: (user: User) => {
    set({ user });
  },
}));
