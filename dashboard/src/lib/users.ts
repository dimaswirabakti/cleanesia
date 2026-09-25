import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { updateProfile, type User } from "firebase/auth";
import { db } from "./firebase";
import type { AppUser, UserRole } from "./types";

export async function ensureUserDoc(user: User, displayName?: string) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const name =
    displayName ?? user.displayName ?? user.email?.split("@")[0] ?? "Pemantau";
  await setDoc(ref, {
    uid: user.uid,
    displayName: name,
    email: user.email ?? "",
    role: "pemantau" as UserRole,
    createdAt: serverTimestamp(),
  });
  if (!user.displayName) await updateProfile(user, { displayName: name });
}

export async function getUserDoc(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid: d.uid ?? uid,
    displayName: d.displayName ?? "",
    email: d.email ?? "",
    role: (d.role ?? "pemantau") as UserRole,
    createdAt: d.createdAt?.toDate?.() ?? new Date(0),
  };
}
