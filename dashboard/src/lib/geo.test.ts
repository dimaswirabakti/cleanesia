import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { computeCellId, cellBounds } from "./geo";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
  readFileSync(resolve(here, "../../../shared/geo-fixtures.json"), "utf-8"),
) as {
  computeCellId: { lat: number; lng: number; cellId: string }[];
  cellBounds: {
    cellId: string;
    latLo: number;
    latHi: number;
    lngLo: number;
    lngHi: number;
  }[];
};

const EPS = 1e-9;

describe("computeCellId — paritas dengan Dart & functions", () => {
  for (const c of fixture.computeCellId) {
    it(`(${c.lat}, ${c.lng}) -> ${c.cellId}`, () => {
      expect(computeCellId(c.lat, c.lng)).toBe(c.cellId);
    });
  }
});

describe("cellBounds — nilai akurat", () => {
  for (const b of fixture.cellBounds) {
    it(`bounds ${b.cellId}`, () => {
      const r = cellBounds(b.cellId);
      expect(r.latLo).toBeCloseTo(b.latLo, 9);
      expect(r.latHi).toBeCloseTo(b.latHi, 9);
      expect(r.lngLo).toBeCloseTo(b.lngLo, 9);
      expect(r.lngHi).toBeCloseTo(b.lngHi, 9);
    });
  }
});

describe("round-trip — titik selalu di dalam sel-nya", () => {
  for (const c of fixture.computeCellId) {
    it(`(${c.lat}, ${c.lng}) berada di dalam ${c.cellId}`, () => {
      const b = cellBounds(computeCellId(c.lat, c.lng));
      expect(c.lat).toBeGreaterThanOrEqual(b.latLo - EPS);
      expect(c.lat).toBeLessThan(b.latHi + EPS);
      expect(c.lng).toBeGreaterThanOrEqual(b.lngLo - EPS);
      expect(c.lng).toBeLessThan(b.lngHi + EPS);
    });
  }
});
