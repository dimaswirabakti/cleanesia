const test = require("node:test");
const assert = require("node:assert/strict");
const { pickLatestVisible, toCellDoc } = require("./cellLogic");

const R = (id, extra = {}) => ({
  id,
  severity: 3,
  createdAt: id,
  types: [],
  ...extra,
});

test("tanpa laporan tersembunyi: ambil yang terbaru", () => {
  assert.equal(pickLatestVisible([R("c"), R("b"), R("a")]).id, "c");
});
test("laporan terbaru tersembunyi: turun ke berikutnya", () => {
  assert.equal(pickLatestVisible([R("c", { hidden: true }), R("b")]).id, "b");
});
test("semua tersembunyi: null (sel dihapus)", () => {
  assert.equal(pickLatestVisible([R("b", { hidden: true })]), null);
  assert.equal(pickLatestVisible([]), null);
});
test("override menyembunyikan laporan terbaru", () => {
  assert.equal(
    pickLatestVisible([R("c"), R("b")], { id: "c", hidden: true }).id,
    "b",
  );
});
test("override memulihkan laporan yang tersembunyi", () => {
  assert.equal(
    pickLatestVisible([R("c", { hidden: true }), R("b")], {
      id: "c",
      hidden: false,
    }).id,
    "c",
  );
});
test("override pada laporan lain tidak mengubah hasil", () => {
  assert.equal(
    pickLatestVisible([R("c"), R("b")], { id: "b", hidden: true }).id,
    "c",
  );
});
test("toCellDoc: bentuk sama dengan agregasiLaporan, default severity 3", () => {
  assert.deepEqual(toCellDoc("1_2", { createdAt: "t" }), {
    cellId: "1_2",
    latestSeverity: 3,
    latestReportAt: "t",
    types: [],
  });
});
