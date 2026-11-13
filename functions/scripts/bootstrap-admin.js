// Pakai:
//   node scripts/bootstrap-admin.js <email>          -> jadikan admin
//   node scripts/bootstrap-admin.js <email> --super  -> jadikan Super Admin (hanya boleh satu)
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const args = process.argv.slice(2);
const makeSuper = args.includes("--super");
const email = args.find((a) => !a.startsWith("--"));
if (!email) {
  console.error("Pakai: node scripts/bootstrap-admin.js <email> [--super]");
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId: "cleanesia" });

(async () => {
  const user = await getAuth().getUserByEmail(email);
  const db = getFirestore();
  const isSuperNow = user.customClaims?.superAdmin === true;

  if (isSuperNow && !makeSuper) {
    throw new Error(`${email} sudah Super Admin; tidak diturunkan lewat skrip ini.`);
  }

  if (makeSuper) {
    // Hanya boleh satu Super Admin.
    const existing = await db
      .collection("users")
      .where("role", "==", "superadmin")
      .get();
    const other = existing.docs.find((d) => d.id !== user.uid);
    if (other) {
      throw new Error(
        `Super Admin sudah ada (${other.data().email}). Hanya boleh satu.`,
      );
    }
  }

  await getAuth().setCustomUserClaims(user.uid, {
    ...(user.customClaims ?? {}),
    admin: true,
    ...(makeSuper ? { superAdmin: true } : {}),
  });
  await db
    .collection("users")
    .doc(user.uid)
    .update({ role: makeSuper ? "superadmin" : "admin" });
  await db.collection("auditLogs").add({
    actorUid: "bootstrap",
    actorEmail: null,
    action: makeSuper ? "bootstrapSuperAdmin" : "bootstrapAdmin",
    target: { uid: user.uid, email },
    details: {},
    at: FieldValue.serverTimestamp(),
  });
  console.log(
    `OK: ${email} (${user.uid}) sekarang ${makeSuper ? "Super Admin" : "admin"}.`,
  );
})().catch((e) => {
  console.error("Gagal:", e.message);
  process.exit(1);
});
