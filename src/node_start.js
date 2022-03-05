// run in node;
const fs = require('fs-extra');
const path = require('path-extra');
const {doWordMapIterations} = require("./iterateWordMap");

async function doRun() {
  const parameter = 'alignmentPosition';
  const start = 0, end = 1, stepSize = 0.1;
  const results = await doWordMapIterations(parameter, start, end, stepSize);
  const outputFolder = './public/analysisData';
  fs.ensureDirSync(outputFolder);
  fs.writeJsonSync(path.join(outputFolder, `${parameter}.json`), results);
}

doRun().then(() => {
  console.log('DONE');
});

