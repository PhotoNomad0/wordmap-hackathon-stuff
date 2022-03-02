import * as MorphUtils from "./MorphUtils.js";

import allMorphologyKeys from "./morphAttrs.js";

const BLANK_MORPHOLOGY = Object.assign(
  ...allMorphologyKeys.map((morphKey) => {
    return { [morphKey]: false };
  })
);

export const parseMorph = (morphString) => {
  return MorphUtils.getMorphLocalizationKeys(morphString);
};

export const expandMorphology = (morphologyAttributes) => {
  const _morphology = Object.assign({}, BLANK_MORPHOLOGY);

  for (const key of parseMorph(morphologyAttributes)) {
    _morphology[key] = true;
  }

  return _morphology;
};

export default parseMorph;
