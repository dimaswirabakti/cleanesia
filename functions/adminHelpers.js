const { getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { HttpsError } = require("firebase-functions/v2/https");

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

/** Catat setiap aksi admin ke auditLogs (hanya bisa ditulis server). */
async function writeAudit(actor, action, target, details = {}) {
  await db.collection("auditLogs").add({
    actorUid: actor.uid,
    actorEmail: actor.email ?? null,
    action,
    target,
    details,
    at: FieldValue.serverTimestamp(),
  });
}

module.exports = { db, requireAdmin, writeAudit };
