import WordMap, { Alignment, Ngram } from "wordmap";
import {removeMarker, toUSFM} from "usfm-js";

export async function initWordMap(alignment_data, corpusBaseFolder, corpusBookId, chapterCount = 0) {
  const opts = {targetNgramLength: 5, warnings: false};
  const map = new WordMap(opts);
  if (alignment_data) {
    initAlignmentMemory(map, alignment_data);
  }
  const {target, source, corpus} = await initCorpus(map, corpusBaseFolder, corpusBookId, chapterCount);
  return {map, target, source, corpus};
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
    
    if (suggestions) {
      resolve(suggestions);
    }
    resolve();
  }, 0);
});

/**
 * Returns prediction suggestions based on the word map
 * @param {WordMap} map
 * @param sourceVerseText
 * @param targetVerseText
 * @return {Promise<*>}
 */
export const getSuggestions = (map, sourceVerseText, targetVerseText) => new Promise(resolve => {
  setTimeout(() => {
    const suggestions = map.predict(sourceVerseText, targetVerseText);

    if (suggestions[0]) {
      resolve(suggestions[0].predictions);
    }
    resolve();
  }, 0);
});

export const predictCorpus = (map, sourceVerseText, targetVerseText) => new Promise(resolve => {
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
  map.appendAlignmentMemory(alignment_data);
}

async function getJsonFile(filePath) {
  try {
    const response = await fetch(filePath);
    const jsonData = await response.json();
    // console.log(jsonData);
    return jsonData;
  } catch (e) {
    console.error(`error reading ${filePath}:`, e);
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
        const outputData = {
          'chapters': {},
          'headers': [],
          'verses': { '1': verseData },
        };
        const usfm = toUSFM(outputData, {chunk: true});
        const [, verseText ] = usfm.split('\\v 1');
        verseStr = verseText || '';
      } else {
        verseStr = verseData;
      }
      verseStr = removeMarker(verseStr).trim().replaceAll('\n', ' ');
      targetChapter[verse] = verseStr;
    }
    target[chapter] = targetChapter;
  }
  return target;
}

export async function initCorpus(map, baseFolder, bookId, chapterCount) {
  if (baseFolder) {
    const corpus = [];
    const target = await getBibleContent(`${baseFolder}/en/${bookId}`, chapterCount);
    const source = await getBibleContent(`${baseFolder}/ugnt/${bookId}`, chapterCount);
    for (let chapter = 1; chapter <= chapterCount; chapter++) {
      const targetChapter = target[chapter];
      const sourceChapter = source[chapter];
      for (let verse of Object.keys(sourceChapter)) {
        const verseNum = parseInt(verse);
        if (isNaN(verseNum)) {
          continue;
        }
        const sourceVerse = sourceChapter[verse];
        const targetVerse = targetChapter[verse];
        try {
          map.appendCorpusString(sourceVerse, targetVerse);
          corpus.push({
            sourceVerse,
            targetVerse,
            reference: {
              bookId,
              chapter,
              verse,
            }
          })
        } catch (e) {
          console.error(`error adding corpus ${chapter}:${verse}:\n${sourceVerse}\n${targetVerse}`, e);
        }
      }
    }
    return {target, source, corpus};
  }
  return {};
}