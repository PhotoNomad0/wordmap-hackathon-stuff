import _ from 'lodash';
import {
  getJsonFile,
  initAlignmentMemory,
  initCorpusFromTargetAndSource,
  initWordMap,
  predictCorpus,
} from "./wordMapOps";
import {lrRun} from "./linearRegression";
import WordMap from "wordmap";
import {removeMarker, toUSFM} from "usfm-js";
import fs from "fs-extra";
import * as path from "path-extra";
// const files = fs.readdirSync('.');

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

export function getJsonFiles(folderPath) {
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath)
      .filter(file => path.extname(file) === '.json');
    return files;
  }
  return null;
}

export function isFolder(folderPath) {
  return fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory();
}

export function getFolders(folderPath) {
  if (isFolder(folderPath)) {
    const files = fs.readdirSync(folderPath);
    const folders = files.filter(subfolder =>{
      if (subfolder !== '.DS_Store') {
        return isFolder(path.join(folderPath, subfolder));
      }
      return false;
    });
    if (folders.length) {
      return folders;
    }
  }
  return null;
}

export function indexFolder(folderPath) {
  if (isFolder(folderPath)) {
    let index = {};
    const folders = getFolders(folderPath);
    if (folders) {
      for (const folder of folders) {
        const fpath = path.join(folderPath, folder);
        const subIndex = indexFolder(fpath);
        if (subIndex) {
          index[folder] = {
            ...index[folder],
            ...subIndex
          }
        }
      }
    }
    const jsonFiles = getJsonFiles(folderPath);
    if (jsonFiles) {
      index = {
        ...index,
        files: jsonFiles.map(item => path.join(folderPath, item))
      }
    }
    return index;
  }
  return null;
}

function iterateWordMap(alignment_data, target, source, bookId, chapterCount, wordMapOpts, pass, doAlignments) {
  let start = new Date();
  const map = new WordMap(wordMapOpts);
  if (alignment_data && doAlignments) {
    initAlignmentMemory(map, alignment_data);
  }
  const corpus = initCorpusFromTargetAndSource(chapterCount, target, source, map, bookId);
  const results = predictCorpus(map, corpus, alignment_data);
  let end = new Date();
  const elapsedSecs_ = elapsedSecs(start, end);
  const error = results.totalMismatches/results.totalAlignments;
  const error_sq = error * error;
  const data = {
    pass,
    date: end.toISOString(),
    error,
    error_sq,
    ...results,
    elapsedSecs: elapsedSecs_,
    wordMapOpts: _.cloneDeep(wordMapOpts),
  }
  return data;
}

export function elapsedSecs(start, end) {
  let wordMapTime = (end.getTime() - start.getTime()) / 1000;
  return wordMapTime;
}

function getBibleContent(folder, chapterCount) {
  const target = {};
  for (let chapter = 1; chapter <= chapterCount; chapter++) {
    const targetChapter = {};
    const targetChapterPath = `${folder}/${chapter}.json`;
    const verses = fs.readJsonSync(targetChapterPath);

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

export function loadTargetAndSource(baseFolder, bookId, chapterCount) {
  if (baseFolder) {
    const target = getBibleContent(`${baseFolder}/en/${bookId}`, chapterCount);
    const source = getBibleContent(`${baseFolder}/ugnt/${bookId}`, chapterCount);
    return {target, source};
  }
  return {};
}

export async function doWordMapIterations(parameter = 'alignmentPosition', start = 0.1, end = 1, stepSize = 0.1) {
  const chapterCount = 24;
  const doAlignments = false;
  const bookId = 'luk';
  const recording = [];
  const wordMapOpts = {
    targetNgramLength: 5,
    warnings: false,
    engineWeights: initialEngineWeights,
  };
  const {target, source} = loadTargetAndSource('./public', bookId, chapterCount);
  const alignment_data = fs.readJsonSync(`./src/resources/alignments_for_${bookId}.json`);

  function wordMapErrorFunction(parameter, value) {
    const opts = _.cloneDeep(wordMapOpts); // initialize to defaults
    opts.engineWeights[parameter] = value; // set value for test parameter
    const results = iterateWordMap(alignment_data, target, source, bookId, chapterCount, opts, value, doAlignments);
    const wordMapResults = {
      ...results,
      doAlignments,
      bookId,
      parameter,
      [parameter]: value,
      parameterInitial: wordMapOpts.engineWeights[parameter],
    }
    recording.push(wordMapResults);
    console.log(`wordMap pass ${parameter}=${value}, elapsed ${results.elapsedSecs} sec:`, wordMapResults);
    return results.error_sq;
  }

  // await lrRun(passes, wordMapErrorFunction, wordMapOpts.engineWeights.alignmentPosition);
  for (let pass = start; pass <= end; pass += stepSize) {
    wordMapErrorFunction(parameter, pass);
  }

  console.log("DONE");
  return recording;
}

