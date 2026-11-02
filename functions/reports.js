const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { FieldValue } = require("firebase-admin/firestore");
const { db, requireAdmin, writeAudit } = require("./adminHelpers");
const { pickLatestVisible, toCellDoc } = require("./cellLogic");

const MAX_SCAN = 200; // laporan terbaru per sel yang dipindai

exports.setReportHidden = onCall(async (request) => {
  const actor = await requireAdmin(request);

  const { reportId, hidden } = request.data ?? {};
  const reason =
    typeof request.data?.reason === "string" ? request.data.reason.trim() : "";
  if (
    typeof reportId !== "string" ||
    !reportId ||
    typeof hidden !== "boolean"
  ) {
    throw new HttpsError(
      "invalid-argument",
      "reportId atau hidden tidak valid.",
    );
  }
  if (hidden && (reason.length < 3 || reason.length > 200)) {
    throw new HttpsError(
      "invalid-argument",
      "Alasan wajib diisi (3–200 karakter).",
    );
  }

  const reportRef = db.collection("reports").doc(reportId);

  const changed = await db.runTransaction(async (tx) => {
    // semua pembacaan dulu, baru penulisan
    const snap = await tx.get(reportRef);
    if (!snap.exists)
      throw new HttpsError("not-found", "Laporan tidak ditemukan.");
    const r = snap.data();
    if ((r.hidden === true) === hidden) return false; // sudah di status itu

    const cellId = r.cellId;
    if (!cellId) {
      throw new HttpsError(
        "failed-precondition",
        "Laporan tidak punya cellId.",
      );
    }

    const scan = await tx.get(
      db
        .collection("reports")
        .where("cellId", "==", cellId)
        .orderBy("createdAt", "desc")
        .limit(MAX_SCAN),
    );
    const docs = scan.docs.map((d) => ({ id: d.id, ...d.data() }));
    const latest = pickLatestVisible(docs, { id: reportId, hidden });
    if (!latest && docs.length >= MAX_SCAN) {
      throw new HttpsError(
        "failed-precondition",
        "Terlalu banyak laporan tersembunyi berurutan di sel ini.",
      );
    }

    tx.update(
      reportRef,
      hidden
        ? {
            hidden: true,
            hiddenBy: actor.uid,
            hiddenAt: FieldValue.serverTimestamp(),
            hiddenReason: reason,
          }
        : {
            hidden: false,
            hiddenBy: FieldValue.delete(),
            hiddenAt: FieldValue.delete(),
            hiddenReason: FieldValue.delete(),
          },
    );

    const cellRef = db.collection("cells").doc(cellId);
    if (latest) tx.set(cellRef, toCellDoc(cellId, latest));
    else tx.delete(cellRef);

    await writeAudit(
      actor,
      hidden ? "hideReport" : "restoreReport",
      { reportId, cellId },
      hidden ? { reason } : {},
      tx,
    );
    return true;
  });

  return { changed, hidden };
});
