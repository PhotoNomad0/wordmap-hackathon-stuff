import * as MorphUtils from "./MorphUtils.js";

export const parseMorph = (morphString) => {
  return MorphUtils.getMorphLocalizationKeys(morphString);
};

export default parseMorph;
