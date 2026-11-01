const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getAuth } = require("firebase-admin/auth");
const { db, requireAdmin, writeAudit } = require("./adminHelpers");

const ROLES = ["pemantau", "admin"];

// Uji cepat rantai auth -> claim -> server (aman dihapus nanti, atau dijadikan health check)
exports.adminPing = onCall(async (request) => {
  const admin = await requireAdmin(request);
  return { ok: true, uid: admin.uid, email: admin.email ?? null };
});

exports.setUserRole = onCall(async (request) => {
  const actor = await requireAdmin(request);

  const { uid, role } = request.data ?? {};
  if (typeof uid !== "string" || !uid || !ROLES.includes(role)) {
    throw new HttpsError("invalid-argument", "uid atau role tidak valid.");
  }

  const target = await getAuth()
    .getUser(uid)
    .catch(() => {
      throw new HttpsError("not-found", "Pengguna tidak ditemukan.");
    });
  const userRef = db.collection("users").doc(uid);
  if (!(await userRef.get()).exists) {
    throw new HttpsError("not-found", "Pengguna belum punya profil dashboard.");
  }

  const wasAdmin = target.customClaims?.admin === true;
  const makeAdmin = role === "admin";
  if (wasAdmin === makeAdmin) return { changed: false, role };

  if (!makeAdmin) {
    const n = (
      await db.collection("users").where("role", "==", "admin").count().get()
    ).data().count;
    if (n <= 1) {
      throw new HttpsError(
        "failed-precondition",
        "Tidak boleh mencabut admin terakhir.",
      );
    }
  }

  const claims = { ...(target.customClaims ?? {}) };
  if (makeAdmin) claims.admin = true;
  else delete claims.admin;

  await getAuth().setCustomUserClaims(uid, claims);
  await userRef.update({ role }); // cermin untuk tampilan; sumber kebenaran tetap claim
  if (!makeAdmin) await getAuth().revokeRefreshTokens(uid);

  await writeAudit(
    actor,
    "setUserRole",
    { uid, email: target.email ?? null },
    {
      from: wasAdmin ? "admin" : "pemantau",
      to: role,
    },
  );
  return { changed: true, role };
});
