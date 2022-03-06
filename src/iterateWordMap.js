import {
  initAlignmentMemory,
  initCorpusFromTargetAndSource,
  initWordMap,
  loadTargetAndSource,
  predictCorpus,
} from "./wordMapOps";
import {lrRun} from "./linearRegression";
import WordMap from "wordmap";
const alignment_data = require("./resources/alignments_for_eph.json");

/**
 * defaultWeights: NumberObject = {
 *         "alignmentPosition": 0.7,
 *         "ngramLength": 0.2,
 *         "characterLength": 0.3,
 *         "alignmentOccurrences": 0.4,
 *         "lemmaAlignmentOccurrences": 0.4,
 *         "uniqueness": 0.5,
 *         "lemmaUniqueness": 0.5,
 *
 *         "sourceCorpusPermutationsFrequencyRatio": 0.7,
 *         "sourceCorpusLemmaPermutationsFrequencyRatio": 0.7,
 *         "targetCorpusPermutationsFrequencyRatio": 0.7,
 *         "targetCorpusLemmaPermutationsFrequencyRatio": 0.7,
 *
 *         "sourceAlignmentMemoryFrequencyRatio": 0.8,
 *         "sourceAlignmentMemoryLemmaFrequencyRatio": 0.7,
 *         "targetAlignmentMemoryFrequencyRatio": 0.7,
 *         "targetAlignmentMemoryLemmaFrequencyRatio": 0.7
 *     };
 */

export const initialEngineWeights = {
  "alignmentPosition": 0.7,
  "ngramLength": 0.2,
  "characterLength": 0.3,
  "alignmentOccurrences": 0.4,
  "lemmaAlignmentOccurrences": 0.4,
  "uniqueness": 0.5,
  "lemmaUniqueness": 0.5,

  "sourceCorpusPermutationsFrequencyRatio": 0.7,
  "sourceCorpusLemmaPermutationsFrequencyRatio": 0.7,
  "targetCorpusPermutationsFrequencyRatio": 0.7,
  "targetCorpusLemmaPermutationsFrequencyRatio": 0.7,

  "sourceAlignmentMemoryFrequencyRatio": 0.8,
  "sourceAlignmentMemoryLemmaFrequencyRatio": 0.7,
  "targetAlignmentMemoryFrequencyRatio": 0.7,
  "targetAlignmentMemoryLemmaFrequencyRatio": 0.7
};


function iterateWordMap(target, source, bookId, chapterCount, wordMapOpts, pass) {
  let start = new Date();
  const map = new WordMap(wordMapOpts);
  initAlignmentMemory(map, alignment_data);
  const corpus = initCorpusFromTargetAndSource(chapterCount, target, source, map, bookId);
  const results = predictCorpus(map, corpus, alignment_data);
  let end = new Date();
  const elapsedSecs_ = elapsedSecs(start, end);
  const error = results.totalMismatches/results.totalAlignments;
  const error_sq = error * error;
  const data = {
    pass,
    error,
    error_sq,
    ...results,
    elapsedSecs: elapsedSecs_,
    wordMapOpts
  }
  console.log(`wordMap pass ${pass}, elapsed ${elapsedSecs_} sec:`, data);
  return data;
}

function elapsedSecs(start, end) {
  let wordMapTime = (end.getTime() - start.getTime()) / 1000;
  return wordMapTime;
}

export async function doWordMapIterations() {
  const chapterCount = 6;
  const bookId = 'eph';
  const passes = 100;
  const recording = [];
  const wordMapOpts = {
    targetNgramLength: 5,
    warnings: false,
    engineWeights: initialEngineWeights,
  };
  const {target, source} = await loadTargetAndSource('.', bookId, chapterCount);

  function wordMapErrorFunction(alignmentPosition, pass) {
    const results = iterateWordMap(target, source, bookId, chapterCount, wordMapOpts, pass);
    const wordMapResults = {
      ...results,
      alignmentPosition
    }
    recording.push(wordMapResults);
    return results.error_sq;
  }

  await lrRun(passes, wordMapErrorFunction, wordMapOpts.engineWeights.alignmentPosition);

  console.log("DONE");
}

