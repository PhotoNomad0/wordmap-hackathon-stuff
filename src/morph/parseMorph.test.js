import parseMorph from "./parseMorph.js";

describe("parseMorph", () => {
  it("returns full morphology for a greek example", () => {
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
