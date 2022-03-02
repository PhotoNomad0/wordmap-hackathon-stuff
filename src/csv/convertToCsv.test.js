import convertToCsv from "./convertToCsv";

describe("convertToCsv", () => {
  it("creates a header row with base fields followed by additional features.", () => {
    const sample = [
      {
        output: 0,
        source: "Παῦλος",
        target: "Paul",
        "f:sLang": "gk",
        "f:tLang": "eng",
        "f:phrase": 0.9,
      },
    ];

    const fullResult = convertToCsv(sample);
    const headerResult = fullResult[0];

    expect(headerResult).toBe("output,source,target,f:sLang,f:tLang,f:phrase");
  });

  it("number of records is sample length + 1", () => {
    const sample = [
      {
        output: 0,
        source: "Παῦλος",
        target: "Paulie",
        "f:sLang": "gk",
        "f:tLang": "eng",
        "f:phrase": 0.9,
      },

      {
        output: 1,
        source: "Παῦλος",
        target: "Paul",
        "f:sLang": "gk",
        "f:tLang": "eng",
        "f:phrase": 0.9,
      },
    ];

    const fullResult = convertToCsv(sample);
    expect(fullResult.length).toBe(3);
  });
});