import convertToCsv, { convertToCsvRows } from "./convertToCsv";

describe("convertToCsvRows", () => {
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

    const fullResult = convertToCsvRows(sample);
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

    const result = convertToCsvRows(sample);
    expect(result.length).toBe(3);
  });

  describe("convertToCsv", () => {
    it("returns a single string representing the whole table", () => {
      const sample = [
        {
          output: 0,
          source: "Παῦλος",
          target: "Paulie",
          "f:sLang": "gk",
          "f:tLang": "eng",
          "f:confidence": 0.3,
        },

        {
          output: 0,
          source: "Παῦλος",
          target: "Pharisee of Pharisees",
          "f:sLang": "gk",
          "f:tLang": "eng",
          "f:confidence": 0.4,
        },

        {
          output: 1,
          source: "Παῦλος",
          target: "Paul",
          "f:sLang": "gk",
          "f:tLang": "eng",
          "f:confidence": 0.8675309,
        },
      ];

      const result = convertToCsv(sample);

      expect(result).toBe(`output,source,target,f:sLang,f:tLang,f:confidence
0,Παῦλος,Paulie,gk,eng,0.3
0,Παῦλος,Pharisee of Pharisees,gk,eng,0.4
1,Παῦλος,Paul,gk,eng,0.8675309`);
    });
  });
});
