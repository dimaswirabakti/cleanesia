import app from "./firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import type { AssignableRole } from "./types";

const fns = getFunctions(app); // region bawaan us-central1, sama dengan deploy

export const setUserRole = httpsCallable<
  { uid: string; role: AssignableRole },
  { changed: boolean; role: AssignableRole }
>(fns, "setUserRole");

export const setReportHidden = httpsCallable<
  { reportId: string; hidden: boolean; reason?: string },
  { changed: boolean; hidden: boolean }
>(fns, "setReportHidden");
