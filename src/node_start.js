// run in node;
const fs = require('fs-extra');
const path = require('path-extra');
const {doWordMapIterations, elapsedSecs, initialEngineWeights, indexFolder, arrayToStr} = require("./iterateWordMap");

const args = process.argv.slice(2);
const PUBLIC_DATA = './public';

function saveIndex(folderPath) {
  const index = indexFolder(folderPath);
  fs.writeJsonSync(path.join(folderPath, 'index.json'), index);
}

async function doParameterAnalysis(targetLang, parameter, start, end, stepSize) {
  const startTime = new Date();
  console.log(`testing '${parameter}'`);
  const results = await doWordMapIterations(targetLang, parameter, start, end, stepSize);
  const books = results[0].bookId;
  const bookStr = arrayToStr(books);
  const doAlignments = results[0].doAlignments;
  const alignmentStr = doAlignments ? 'withAlignment_' : 'withoutAlignment_';
  const outputFolder = path.join('./public/analysisData', targetLang, `${alignmentStr}${bookStr}`);
  fs.ensureDirSync(outputFolder);
  fs.writeJsonSync(path.join(outputFolder, `${parameter}.json`), results);
  const endTime = new Date();
  const elapsedSecs_ = elapsedSecs(startTime, endTime);
  console.log(`wordMap processed ${parameter}, elapsed ${elapsedSecs_} sec:`);
}

async function doRun() {
  saveIndex(PUBLIC_DATA); // make sure changes are updated before long run
  const targetLang = 'en';
  const startTime = new Date();
  const engineWeights = Object.keys(initialEngineWeights).sort();
  for (const parameter of engineWeights) {
    const start = 0, end = 1.51, stepSize = 0.1;
    await doParameterAnalysis(targetLang, parameter, start, end, stepSize);
  }
  const endTime = new Date();
  const elapsedSecs_ = elapsedSecs(startTime, endTime);
  saveIndex(PUBLIC_DATA);
  console.log(`total run time: ${elapsedSecs_} sec:`);
}

if (args.includes('--index_only')) {
  saveIndex(PUBLIC_DATA);
} else {
  doRun().then(() => {
    console.log('DONE');
  });
}
