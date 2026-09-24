"use client";

import { create } from "zustand";
import type { AuthUser } from "@/types/auth";

const STORAGE_KEY = "v2005-store-user";
const ME_TIMEOUT_MS = 12_000;
const GUEST_UNLOCK_MS = 900;

type AuthState = {
  user: AuthUser | null;
  hydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
};

function readCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures.
  }
}

async function fetchMe(): Promise<Response> {
  return fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal: AbortSignal.timeout(ME_TIMEOUT_MS),
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  setUser: (user) => {
    writeCachedUser(user);
    set({ user });
  },
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    const cachedUser = readCachedUser();

    if (cachedUser) {
      set({ user: cachedUser, hydrated: true });
    }

    const mePromise = fetchMe()
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          writeCachedUser(null);
          set({ user: null, hydrated: true });
          return;
        }

        if (!response.ok) {
          set({
            user: get().user ?? cachedUser,
            hydrated: true,
          });
          return;
        }

        const payload = await response.json();
        const user = (payload?.data?.user as AuthUser | null) ?? null;
        writeCachedUser(user);
        set({ user, hydrated: true });
      })
      .catch(() => {
        set({
          user: get().user ?? cachedUser,
          hydrated: true,
        });
      });

    if (!cachedUser) {
      await Promise.race([
        mePromise,
        new Promise<void>((resolve) => {
          window.setTimeout(() => {
            if (!get().hydrated) {
              set({ user: null, hydrated: true });
            }
            resolve();
          }, GUEST_UNLOCK_MS);
        }),
      ]);
    }

    await mePromise;
  },
  logout: async () => {
    writeCachedUser(null);
    await fetch("/api/auth/login", {
      method: "DELETE",
      credentials: "include",
    });
    set({ user: null });
  },
}));
