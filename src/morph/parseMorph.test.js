import parseMorph from "./parseMorph.js";

describe("parseMorph", () => {
  it("returns full morphology", () => {
    const result = parseMorph("Gr,V,IAA3,,S,");
    expect(result.length).toBe(6);
    expect(result).toEqual([
      "verb",
      "indicative",
      "aorist",
      "active",
      "third",
      "singular",
    ]);
  });
});
