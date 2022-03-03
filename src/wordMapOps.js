import isEqual from 'deep-equal';
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
export function getSuggestions(map, sourceVerseText, targetVerseText) {
  const suggestions = map.predict(sourceVerseText, targetVerseText);

  if (suggestions[0]) {
    return suggestions[0].predictions;
  }
  return null;
}

export function getAlignmentsByVerse(alignment_data) {
  const alignmentsByVerse = {};
  for (const a of alignment_data) {
    const reference = a.reference;
    let chapterAlign = alignmentsByVerse[reference.chapter];
    if (!chapterAlign) {
      chapterAlign = {};
      alignmentsByVerse[reference.chapter] = chapterAlign;
    }
    let verseAlign = chapterAlign[reference.verse];
    if (!verseAlign) {
      verseAlign = [];
      chapterAlign[reference.verse] = verseAlign;
    }
    verseAlign.push(a);
  }
  return alignmentsByVerse;
}

function getTokensFromNgram(nGram) {
  const tokens = [];
  if (nGram?.tokens) { // if tokens array, use it
    nGram = nGram?.tokens;
  }
  const len = nGram?.length || 0;
  for (let i = 0; i < len; i++) {
    const { text, occurrence, tokenOccurrence } = nGram[i];
    tokens.push({
      text,
      occurrence: tokenOccurrence ?? occurrence,
    })
  }
  return tokens;
}

function getNgramTokens(alignment) {
  const {sourceNgram, targetNgram} = alignment || {};
  return {
    sourceNgram: getTokensFromNgram(sourceNgram),
    targetNgram: getTokensFromNgram(targetNgram),
  }
}

function compareTokens(a, b) {
  const same = isEqual(a, b);
  return same;
}

function compareNgrams(a, b) {
  const aNgrams = getNgramTokens(a);
  const bNgrams = getNgramTokens(b);
  const same = compareTokens(aNgrams.sourceNgram, bNgrams.sourceNgram) &&
    compareTokens(aNgrams.targetNgram, bNgrams.targetNgram);
  return same;
}

function compareSourceNgrams(a, b) {
  const aNgrams = getNgramTokens(a);
  const bNgrams = getNgramTokens(b);
  const same = compareTokens(aNgrams.sourceNgram, bNgrams.sourceNgram);
  return same;
}

function compareTargetNgrams(a, b) {
  const aNgrams = getNgramTokens(a);
  const bNgrams = getNgramTokens(b);
  const same = compareTokens(aNgrams.targetNgram, bNgrams.targetNgram);
  return same;
}

/**
 * suggestion?.predictedAlignment?.sourceNgram?.tokens?.tokenOccurrence
 */
function sameAlignment(alignment, suggestion) {
  const suggestedAlignment = suggestion?.predictedAlignment;
  const same = compareNgrams(alignment, suggestedAlignment);
  return same;
}

function sameSource(alignment, suggestion) {
  const suggestedAlignment = suggestion?.predictedAlignment;
  const same = compareSourceNgrams(alignment, suggestedAlignment);
  return same;
}

function sameTarget(alignment, suggestion) {
  const suggestedAlignment = suggestion?.predictedAlignment;
  const same = compareTargetNgrams(alignment, suggestedAlignment);
  return same;
}

function containsToken(token, tokens) {
  tokens = tokens || [];
  const pos = tokens.findIndex(t => (isEqual(t, token)));
  return pos >= 0;
}

function partialSourceMatch(alignment, suggestion) {
  const suggestedAlignment = suggestion?.predictedAlignment;
  const aNgrams = getNgramTokens(alignment);
  const bNgrams = getNgramTokens(suggestedAlignment);
  for (let token of aNgrams.sourceNgram) {
    let match = containsToken(token, bNgrams.sourceNgram);
    if (match) {
      return match;
    }
  }
  return false;
}

function partialTargetMatch(alignment, suggestion) {
  const suggestedAlignment = suggestion?.predictedAlignment;
  const aNgrams = getNgramTokens(alignment);
  const bNgrams = getNgramTokens(suggestedAlignment);
  for (let token of aNgrams.targetNgram) {
    let match = containsToken(token, bNgrams.targetNgram);
    if (match) {
      return match;
    }
  }
  return false;
}

function tokensToString(nGram) {
  let output = '';
  for (let token of nGram) {
    output += `${token.text}:${token.occurrence},`;
  }
  return output;
}

function alignmentsToString(alignment) {
  const {sourceNgram, targetNgram} = getNgramTokens(alignment);
  let output = `sourceNgram=${tokensToString(sourceNgram)}  `;
  output += `targetNgram=${tokensToString(targetNgram)}`;
  return output;
}

function targetToString(alignment) {
  const {sourceNgram, targetNgram} = getNgramTokens(alignment);
  let output = `targetNgram=${tokensToString(targetNgram)}`;
  return output;
}

function sourceToString(alignment) {
  const {sourceNgram, targetNgram} = getNgramTokens(alignment);
  let output = `targetNgram=${tokensToString(sourceNgram)}`;
  return output;
}

export function predictCorpus(map, corpus, alignment_data, verbose = false) {
  const alignmentsByVerse = getAlignmentsByVerse(alignment_data);
  let totalMismatches = 0;
  let partialMatches = 0;
  let totalCorpus = -1;
  let totalAlignments = -1;
  let correctMatches = 0;
  for (const c of corpus) {
    totalCorpus++;
    verbose && console.log(`${totalCorpus} - corpus`, JSON.stringify(c));
    const suggestions = getSuggestions(map, c.sourceVerse, c.targetVerse) || [];
    const alignments = alignmentsByVerse?.[c.reference.chapter]?.[c.reference.verse] || [];
    let notMatchedSuggestion = [...suggestions];
    verbose && console.log(`alignments.length: ${alignments.length}`);
    verbose && console.log(`suggestions.length: ${suggestions.length}`);
    let suggestionMisCount = 0;
    let notMatchedAlignment = [];
    for (let i = 0; i < alignments.length; i++) {
      totalAlignments++;
      const alignment = alignments[i];
      const matchIndex = notMatchedSuggestion.findIndex(suggestion => (sameAlignment(alignment, suggestion)));
      if (matchIndex >= 0) {
        notMatchedSuggestion.splice(matchIndex,1); // remove match
        correctMatches++;
      } else {
        notMatchedAlignment.push({...alignment, index: i});
      }
    }

    // do partial source match
    for (let i = 0; i < notMatchedAlignment.length; i++) {
      const alignment = notMatchedAlignment[i];
      let matchIndex = notMatchedSuggestion.findIndex(suggestion => (sameSource(alignment, suggestion)));
      if (matchIndex >= 0) {
        const suggestion = notMatchedSuggestion[matchIndex];
        verbose && console.log(`c${totalCorpus} - alignment ${alignment.index} `, alignmentsToString(alignment));
        verbose && console.log(`   has different suggestion:`, targetToString(suggestion?.predictedAlignment));
        notMatchedAlignment.splice(i, 1);
        notMatchedSuggestion.splice(matchIndex, 1);
        i--;
        totalMismatches++;
        partialMatches++;
      } else {
        matchIndex = notMatchedSuggestion.findIndex(suggestion => (partialSourceMatch(alignment, suggestion)));
        if (matchIndex >= 0) {
          const suggestion = notMatchedSuggestion[matchIndex];
          verbose && console.log(`c${totalCorpus} - alignment ${alignment.index} `, alignmentsToString(alignment));
          verbose && console.log(`   partial match with suggestion:`, alignmentsToString(suggestion?.predictedAlignment));
          notMatchedAlignment.splice(i, 1);
          notMatchedSuggestion.splice(matchIndex, 1);
          i--;
          totalMismatches++;
          partialMatches++;
        }
      }
    }
    
    // do partial target match
    for (let i = 0; i < notMatchedAlignment.length; i++) {
      const alignment = notMatchedAlignment[i];
      let matchIndex = notMatchedSuggestion.findIndex(suggestion => (sameTarget(alignment, suggestion)));
      if (matchIndex >= 0) {
        const suggestion = notMatchedSuggestion[matchIndex];
        verbose && console.log(`c${totalCorpus} - alignment ${alignment.index} `, alignmentsToString(alignment));
        verbose && console.log(`   has different suggestion:`, sourceToString(suggestion?.predictedAlignment));
        notMatchedAlignment.splice(i, 1);
        notMatchedSuggestion.splice(matchIndex, 1);
        i--;
        totalMismatches++;
        partialMatches++;
      } else {
        matchIndex = notMatchedSuggestion.findIndex(suggestion => (partialTargetMatch(alignment, suggestion)));
        if (matchIndex >= 0) {
          const suggestion = notMatchedSuggestion[matchIndex];
          verbose && console.log(`c${totalCorpus} - alignment ${alignment.index} `, alignmentsToString(alignment));
          verbose && console.log(`   partial match with suggestion:`, alignmentsToString(suggestion?.predictedAlignment));
          notMatchedAlignment.splice(i, 1);
          notMatchedSuggestion.splice(matchIndex, 1);
          i--;
          totalMismatches++;
          partialMatches++;
        }
      }
    }

    for (let alignment of notMatchedAlignment) {
      verbose && console.log(`c${totalCorpus} - alignment ${alignment.index} not matched`, alignmentsToString(alignment));
    }
    
    const notMatchedSuggestionLen = notMatchedSuggestion.length;
    if (notMatchedSuggestionLen) {
      for (let i = 0; i < notMatchedSuggestionLen; i++) {
        const suggestion = notMatchedSuggestion[i];
        verbose && console.log(`c${totalCorpus} - suggestion mismatch ${++suggestionMisCount}`, alignmentsToString(suggestion?.predictedAlignment));
      }
    }

    totalMismatches += notMatchedSuggestionLen + notMatchedAlignment.length;
  }
  const results = {verseCount: totalCorpus, totalMismatches, partialMatches, totalAlignments, correctMatches};
  return results;
}

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

export function initCorpusFromTargetAndSource(chapterCount, target, source, map, bookId) {
  const corpus = [];
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
            chapter: chapter + '',
            verse,
          }
        })
      } catch (e) {
        console.error(`error adding corpus ${chapter}:${verse}:\n${sourceVerse}\n${targetVerse}`, e);
      }
    }
  }
  return corpus;
}

export async function loadTargetAndSource(baseFolder, bookId, chapterCount) {
  if (baseFolder) {
    const target = await getBibleContent(`${baseFolder}/en/${bookId}`, chapterCount);
    const source = await getBibleContent(`${baseFolder}/ugnt/${bookId}`, chapterCount);
    return {target, source};
  }
  return {};
}

export async function initCorpus(map, baseFolder, bookId, chapterCount) {
  if (baseFolder) {
    const {target, source} = await loadTargetAndSource(baseFolder, bookId, chapterCount);
    const corpus = initCorpusFromTargetAndSource(chapterCount, target, source, map, bookId);
    return {target, source, corpus};
  }
  return {};
}