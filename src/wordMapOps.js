import WordMap, { Alignment, Ngram } from "wordmap";

export function initWordMap() {
  const opts = {targetNgramLength: 5, warnings: false};
  return new WordMap(opts);
}

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

    // if (suggestions[0]) {
    //   resolve(suggestions[0].predictions);
    // }
    if (suggestions) {
      resolve(suggestions);
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
  // for (const a of alignment_data) {
  //   // console.log(a);
  //   // const sourceNgram = new Ngram(a.sourceNgram);
  //   // const targetNgram = new Ngram(a.targetNgram);
  //   // const alignment = new Alignment(sourceNgram, targetNgram);
  //   // map.appendAlignmentMemory(alignment);
  //
  // }
  map.appendAlignmentMemory(alignment_data);
}
