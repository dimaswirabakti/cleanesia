import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  SEVERITY_COLOR,
  SEVERITY_LEVELS,
  UNMONITORED_COLOR,
} from "./palette";

const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8",
);

function token(name: string): string | undefined {
  return css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
}

describe("palette selaras dengan token CSS", () => {
  for (const l of SEVERITY_LEVELS) {
    it(`severity-${l}`, () => {
      expect(token(`severity-${l}`)?.toLowerCase()).toBe(
        SEVERITY_COLOR[l].toLowerCase(),
      );
    });
  }
  it("unmonitored", () => {
    expect(token("unmonitored")?.toLowerCase()).toBe(
      UNMONITORED_COLOR.toLowerCase(),
    );
  });
  it("danger sama dengan severity-5", () => {
    expect(token("danger")?.toLowerCase()).toBe(SEVERITY_COLOR[5].toLowerCase());
  });
});
