"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUserDoc, getUserDoc } from "@/lib/users";
import type { AppUser } from "@/lib/types";

type AuthState = {
  user: User | null;
  profile: AppUser | null;
  /** true bila token memuat claim admin (sumber kebenaran role). Hanya untuk UI; server tetap memverifikasi sendiri. */
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  /** Paksa ambil token baru, dipakai setelah role berubah. */
  refreshClaims: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  refreshProfile: async () => {},
  refreshClaims: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          await ensureUserDoc(u);
          setProfile(await getUserDoc(u.uid));
          setIsAdmin((await u.getIdTokenResult()).claims.admin === true);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }),
    [],
  );

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) setProfile(await getUserDoc(auth.currentUser.uid));
  }, []);

  const refreshClaims = useCallback(async () => {
    const u = auth.currentUser;
    if (!u) return;
    setIsAdmin((await u.getIdTokenResult(true)).claims.admin === true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        refreshProfile,
        refreshClaims,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
