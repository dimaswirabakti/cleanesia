const { test } = require("node:test");
const assert = require("node:assert/strict");
const { computeCellId } = require("./geo");
const fixture = require("../shared/geo-fixtures.json");

test("computeCellId cocok dengan fixture emas", () => {
  for (const c of fixture.computeCellId) {
    assert.equal(
      computeCellId(c.lat, c.lng),
      c.cellId,
      `(${c.lat}, ${c.lng}) seharusnya ${c.cellId}`,
    );
  }
});
