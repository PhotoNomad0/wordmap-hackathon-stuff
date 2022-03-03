import {
  initCorpusFromTargetAndSource,
  initWordMap,
  loadTargetAndSource,
  predictCorpus,
} from "./wordMapOps";
const alignment_data = require("./resources/alignments_for_eph.json");

async function iterate(target, source, bookId, chapterCount) {
  const { map } = await initWordMap(alignment_data);
  const corpus = initCorpusFromTargetAndSource(chapterCount, target, source, map, bookId);
  const results = predictCorpus(map, corpus, alignment_data);
  return results;
}

export async function doWordMapIterations() {
  const chapterCount = 6;
  const bookId = 'eph';
  const passes = 1;
  let start = new Date();
  const {target, source} = await loadTargetAndSource('.', bookId, chapterCount);
  for (let pass = 0; pass < passes; pass++) {
    const results = await iterate(target, source, bookId, chapterCount);
    let end = new Date();
    let seconds = (end.getTime() - start.getTime()) / 1000;
    console.log(`pass ${pass}, elapsed ${seconds} sec:`, results);
    start = end;
  }
}

