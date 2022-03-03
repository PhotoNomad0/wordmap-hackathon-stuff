import {
  initCorpusFromTargetAndSource,
  initWordMap,
  loadTargetAndSource,
  predictCorpus,
} from "./wordMapOps";
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

const initialEngineWeights = {
  "alignmentPosition": 0.7,
  "ngramLength": 0.2,
  "characterLength": 0.3,
  "alignmentOccurrences": 0.4,
  "lemmaAlignmentOccurrences": 0.4,
  "uniqueness": 0.5,
  "lemmaUniqueness": 0.500001,

  "sourceCorpusPermutationsFrequencyRatio": 0.7,
  "sourceCorpusLemmaPermutationsFrequencyRatio": 0.7,
  "targetCorpusPermutationsFrequencyRatio": 0.7,
  "targetCorpusLemmaPermutationsFrequencyRatio": 0.7,

  "sourceAlignmentMemoryFrequencyRatio": 0.8,
  "sourceAlignmentMemoryLemmaFrequencyRatio": 0.7,
  "targetAlignmentMemoryFrequencyRatio": 0.7,
  "targetAlignmentMemoryLemmaFrequencyRatio": 0.7
};


async function iterateWordMap(target, source, bookId, chapterCount, wordMapOpts) {
  const { map } = await initWordMap(alignment_data, wordMapOpts);
  const corpus = initCorpusFromTargetAndSource(chapterCount, target, source, map, bookId);
  const results = predictCorpus(map, corpus, alignment_data);
  return results;
}

export async function doWordMapIterations() {
  const chapterCount = 6;
  const bookId = 'eph';
  const passes = 1;
  const recording = [];
  const wordMapOpts = {
    targetNgramLength: 5,
    warnings: false,
    engineWeights: initialEngineWeights,
  };
  let start = new Date();
  const {target, source} = await loadTargetAndSource('.', bookId, chapterCount);
  for (let pass = 0; pass < passes; pass++) {
    const results = await iterateWordMap(target, source, bookId, chapterCount, wordMapOpts);
    let end = new Date();
    let wordMapTime = (end.getTime() - start.getTime()) / 1000;
    console.log(`pass ${pass}, elapsed ${wordMapTime} sec:`, results);
    start = end;
    const data = {
      pass,
      results,
      wordMapTime,
      wordMapOpts
    }
    recording.push(data);
    console.log(`cumulative status:`, JSON.stringify(recording));
  }
}

