import app from "./firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import type { UserRole } from "./types";

const fns = getFunctions(app); // region bawaan us-central1, sama dengan deploy

export const adminPing = httpsCallable<
  void,
  { ok: boolean; uid: string; email: string | null }
>(fns, "adminPing");

export const setUserRole = httpsCallable<
  { uid: string; role: UserRole },
  { changed: boolean; role: UserRole }
>(fns, "setUserRole");
