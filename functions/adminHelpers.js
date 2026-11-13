const { getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { HttpsError } = require("firebase-functions/v2/https");
const { isSuperAdmin } = require("./adminLogic");

if (!getApps().length) initializeApp();
const db = getFirestore();

/**
 * Pastikan pemanggil adalah admin. Dicek langsung ke Firebase Auth,
 * bukan hanya dari token, supaya pencabutan role berlaku seketika
 * (token bisa basi hingga 1 jam).
 */
async function requireAdmin(request) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Harus login.");
  const rec = await getAuth().getUser(request.auth.uid);
  if (rec.customClaims?.admin !== true) {
    throw new HttpsError("permission-denied", "Khusus admin.");
  }
  return rec;
}

/** Seperti requireAdmin, tetapi hanya untuk Super Admin (mengelola peran admin). */
async function requireSuperAdmin(request) {
  const rec = await requireAdmin(request);
  if (!isSuperAdmin(rec.customClaims)) {
    throw new HttpsError("permission-denied", "Khusus super admin.");
  }
  return rec;
}

/** Catat aksi admin ke auditLogs. Bila `tx` diberikan, ditulis dalam transaksi itu. */
async function writeAudit(actor, action, target, details = {}, tx = null) {
  const ref = db.collection("auditLogs").doc();
  const data = {
    actorUid: actor.uid,
    actorEmail: actor.email ?? null,
    action,
    target,
    details,
    at: FieldValue.serverTimestamp(),
  };
  if (tx) tx.set(ref, data);
  else await ref.set(data);
}

module.exports = { db, requireAdmin, requireSuperAdmin, writeAudit };
