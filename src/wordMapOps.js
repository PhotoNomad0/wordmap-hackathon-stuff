import WordMap, { Alignment, Ngram } from "wordmap";
import {removeMarker, jsonToUSFM} from "usfm-js";

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

async function getJsonFile(filePath) {
  try {
    const response = await fetch(filePath);
    const jsonData = await response.json();
    console.log(jsonData);
    return jsonData;
  } catch (e) {
    console.log(`error reading ${filePath}:`, e);
  }
  return null;
}

async function getBibleContent(folder, chapterCount) {
  const target = {};
  for (let chapter = 1; chapter <= chapterCount; chapter++) {
    const targetChapter = {};
    const targetChapterPath = `${folder}/${chapter}.json`;
    const verses = await getJsonFile(targetChapterPath);

    for (const verse of Object.keys(verses)) {
      let verseData = verses[verse];
      let verseStr;
      if (typeof verseData !== 'string') {
        verseStr = jsonToUSFM(verseData, {chunk: true});
      }
      verseStr = removeMarker(verseStr);
      targetChapter[verse] = verseStr;
    }
    target[chapter] = targetChapter;
  }
  return target;
}

export async function initCorpus(map) {
  const target = await getTargetSource('./en/eph');
  console.log(target);
}