// run in node;
const fs = require('fs-extra');
const path = require('path-extra');
const {doWordMapIterations, elapsedSecs} = require("./iterateWordMap");

async function doRun() {
  const startTime = new Date();
  const parameter = 'alignmentPosition';
  const start = 0, end = 1, stepSize = 0.1;
  const results = await doWordMapIterations(parameter, start, end, stepSize);
  const outputFolder = './public/analysisData';
  fs.ensureDirSync(outputFolder);
  fs.writeJsonSync(path.join(outputFolder, `${parameter}.json`), results);
  const endTime = new Date();
  const elapsedSecs = elapsedSecs(startTime, endTime);
  console.log(`wordMap processed ${parameter}, elapsed ${results.elapsedSecs} sec:`, elapsedSecs);
}

doRun().then(() => {
  console.log('DONE');
});

