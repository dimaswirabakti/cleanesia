// Pakai: node scripts/bootstrap-admin.js dimaswirba@gmail.com
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const email = process.argv[2];
if (!email) {
  console.error("Pakai: node scripts/bootstrap-admin.js <email>");
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId: "cleanesia" });

(async () => {
  const user = await getAuth().getUserByEmail(email);
  await getAuth().setCustomUserClaims(user.uid, {
    ...(user.customClaims ?? {}),
    admin: true,
  });
  const db = getFirestore();
  await db.collection("users").doc(user.uid).update({ role: "admin" });
  await db.collection("auditLogs").add({
    actorUid: "bootstrap",
    actorEmail: null,
    action: "bootstrapAdmin",
    target: { uid: user.uid, email },
    details: {},
    at: FieldValue.serverTimestamp(),
  });
  console.log(`OK: ${email} (${user.uid}) sekarang admin.`);
})().catch((e) => {
  console.error("Gagal:", e.message);
  process.exit(1);
});
