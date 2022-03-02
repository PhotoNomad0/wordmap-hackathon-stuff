const calculateFields = (sample) => {
  const baseFields = ["output", "source", "target"];
  const additionalFields = Object.keys(sample).filter((key) => key.startsWith("f:"));
  return baseFields.concat(additionalFields);
};

export const convertToCsv = (stuffToConvert) => {
  const fields = calculateFields(stuffToConvert[0]);

  const header = fields.reduce((previous, current) => {
    return `${previous},${current}`;
  });

  const tabularized =  stuffToConvert.map((thingToConvert) => {
    return ``;
  });

  return [].concat(header, tabularized);
};

export default convertToCsv;
