import { parseMorph, expandMorphology } from "./morph.js";

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

describe("expandMorphology", () => {
  it("can return a full blank morphology", () => {
    const result = expandMorphology([]);

    expect(Object.keys(result).length).toBe(154);
    for (const key of Object.keys(result)) {
      expect(result[key]).toBe(false);
    }
  });

  it("includes all fields when expanding", () => {
    const result = expandMorphology("Gr,V,IAA3,,S,");

    expect(Object.keys(result).length).toBe(154);
  });

  it("toggles only the correct fields", () => {
    const expectedFlags = [
      "verb",
      "indicative",
      "aorist",
      "active",
      "third",
      "singular",
    ];

    const result = expandMorphology("Gr,V,IAA3,,S,");

    const expectedFilledMorphology = expectedFlags
      .map((expectedFlag) => {
        return { [expectedFlag]: result[expectedFlag] };
      })
      .reduce((previous, current) => {
        return { ...previous, ...current };
      });

    expect(expectedFilledMorphology).toStrictEqual({
      verb: true,
      indicative: true,
      aorist: true,
      active: true,
      third: true,
      singular: true,
    });

    const nonExpectedMorphology = Object.keys(result)
      .filter((key) => !expectedFlags.includes(key))
      .map((key) => {
        return { [key]: result[key] };
      });

    expect(
      nonExpectedMorphology.every((thing) => {
        return Boolean(Object.values(thing)[0]) === false;
      })
    ).toBe(true);
  });
});
