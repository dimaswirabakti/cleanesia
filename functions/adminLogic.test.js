const test = require("node:test");
const assert = require("node:assert/strict");
const { isSuperAdmin, roleChangeBlockReason } = require("./adminLogic");

test("isSuperAdmin: hanya true persis yang dihitung", () => {
  assert.equal(isSuperAdmin({ admin: true, superAdmin: true }), true);
  assert.equal(isSuperAdmin({ admin: true }), false);
  assert.equal(isSuperAdmin({ superAdmin: false }), false);
  assert.equal(isSuperAdmin({ superAdmin: "true" }), false);
  assert.equal(isSuperAdmin(undefined), false);
  assert.equal(isSuperAdmin(null), false);
});

test("Super Admin tidak boleh diubah lewat dasbor", () => {
  assert.equal(
    roleChangeBlockReason({ admin: true, superAdmin: true }),
    "Super admin tidak dapat diubah.",
  );
});

test("admin biasa dan pemantau boleh diubah", () => {
  assert.equal(roleChangeBlockReason({ admin: true }), null);
  assert.equal(roleChangeBlockReason({}), null);
  assert.equal(roleChangeBlockReason(undefined), null);
});
