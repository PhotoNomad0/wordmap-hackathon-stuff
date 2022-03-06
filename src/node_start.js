// run in node;
const fs = require('fs-extra');
const path = require('path-extra');
const {doWordMapIterations, elapsedSecs, initialEngineWeights} = require("./iterateWordMap");

async function doParameterAnalysis(parameter, start, end, stepSize, targetLang) {
  const startTime = new Date();
  console.log(`testing '${parameter}'`);
  const results = await doWordMapIterations(parameter, start, end, stepSize);
  const outputFolder = path.join('./public/analysisData', targetLang);
  fs.ensureDirSync(outputFolder);
  fs.writeJsonSync(path.join(outputFolder, `${parameter}.json`), results);
  const endTime = new Date();
  const elapsedSecs_ = elapsedSecs(startTime, endTime);
  console.log(`wordMap processed ${parameter}, elapsed ${elapsedSecs_} sec:`);
}

async function doRun() {
  const targetLang = 'en';
  const startTime = new Date();
  const engineWeights = Object.keys(initialEngineWeights).sort();
  for (const parameter of engineWeights) {
    const start = 0, end = 1.51, stepSize = 0.1;
    await doParameterAnalysis(parameter, start, end, stepSize, targetLang);
  }
  const endTime = new Date();
  const elapsedSecs_ = elapsedSecs(startTime, endTime);
  console.log(`total run time: ${elapsedSecs_} sec:`);
}

doRun().then(() => {
  console.log('DONE');
});

