import { Alignment, Ngram } from "wordmap";

/**
 * Returns predictions based on the word map
 * @param {WordMap} map
 * @param sourceVerseText
 * @param targetVerseText
 * @return {Promise<*>}
 */
export const getPredictions = (map, sourceVerseText, targetVerseText) => new Promise(resolve => {
  setTimeout(() => {
    const suggestions = map.predict(sourceVerseText, targetVerseText);

    if (suggestions[0]) {
      resolve(suggestions[0].predictions);
    }
    resolve();
  }, 0);
});

/**
 * 
 * @param {WordMap} map
 * @param {Array} alignment_data
 */
export function initAlignmentMemory(map, alignment_data) {
  for (const a of alignment_data) {
    console.log(a);
    map.appendAlignmentMemory(new Alignment(new Ngram(a.sourceNgram), new Ngram(a.targetNgram)));
  }
}
