const calculateFields = (sample) => {
  const baseFields = ["output", "source", "target"];
  const additionalFields = Object.keys(sample).filter((key) =>
    key.startsWith("f:")
  );
  return baseFields.concat(additionalFields);
};

// Output: string representing a CSV file.
export const convertToCsvRows = (stuffToConvert) => {
  const fields = calculateFields(stuffToConvert[0]);

  const header = fields.reduce((previous, current) => {
    return `${previous},${current}`;
  });

  const tabularized = stuffToConvert.map((thingToConvert) => {
    return fields
      .map((fieldName) => {
        return thingToConvert[fieldName];
      })
      .join(",");
  });

  return [].concat(header, tabularized);
};

export const convertToCsv = (stuffToConvert) => {
  const csvRows = convertToCsvRows(stuffToConvert);
  return csvRows.join('\n');
};

export default convertToCsv;
