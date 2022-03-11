import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import {getJsonFile} from "./wordMapOps";
import {initialEngineWeights} from "./iterateWordMap";

/**
 * calculate y=m*x+b for each element of x
 * @param {tf.variable} m
 * @param {tf.tensor} x
 * @param {tf.variable} b
 * @return {*}
 */
function equation(m, x, b) {
  return x.mul(m).add(b);
}

/**
 * calculate error squared between expected and predicted values arrays
 * @param {tf.tensor} y_expected
 * @param {tf.tensor} y_predicted
 * @return {*}
 */
function errorSq(y_expected, y_predicted) {
  return y_expected.sub(y_predicted).square().mean();
}

function printProgress(i, m, b, ys, xs) {
  let error_sq = errorSq(tf.tensor(ys), equation(tf.tensor(m), tf.tensor(xs), tf.tensor(b))).dataSync();
  console.log(`step ${i}: m=${m}, b=${b}, error sqd=${error_sq}`);
  return error_sq;
}

export async function lrRun(passes, errorFunc, initialAlignmentPosition) {
  // tf.setBackend('cpu'); // to run in CPU
  const alignmentPosition = tf.variable(tf.scalar(initialAlignmentPosition));
  const learningRate = 0.01;
  const optimizer = tf.train.sgd(learningRate);
  // tfvis.show.modelSummary({ name: "Model Summary" }, optimizer);

  console.log('alignmentPosition initial', alignmentPosition.dataSync());
  // let history = [];
  for (let i = 0; i < passes; i++) {
    tf.tidy(() => { // automatically clean up tensors from the GPU
      optimizer.minimize(() => {
        const alignmentPositionValue = alignmentPosition.dataSync();
        const error_sq = errorFunc(alignmentPositionValue[0], i); // this causes a runtime error since the error function was not written in tensorflow
        const err_sq = tf.scalar(error_sq);
        return err_sq;
      });
    });
  }

}

function round(num, digits = 4) {
  const mult = Math.pow(10, digits);
  var m = Number((Math.abs(num) * mult).toPrecision(15));
  return Math.round(m) / mult * Math.sign(num);
}

function addTableRow(style, key, value) {
  const text = `<tr ${style}><td ${style}>${key}</td><td ${style}>${value}</td></tr>`;
  return text;
}

export async function plotWordMapData() {
  const bookID = 'luk';
  const targetLang = 'en';
  const doAlignments = false;
  const alignmentsStr = `(running ${doAlignments ? 'with' : 'without'} alignment data)`;
  document.getElementById(`header`).innerHTML = `Word Map Tuning for ${bookID} in ${targetLang}<br>${alignmentsStr}`;
  const engineWeights = Object.keys(initialEngineWeights).sort();
  const parameter = '-';
  const surface = {name: `Visualizing effects of changes to`, tab: `Optimizing`};
  for (let i = 0; i < engineWeights.length; i++ ) {
    const parameter= engineWeights[i];
    const folderType = doAlignments ? 'withAlignment' : 'withoutAlignment';
    const filePath = `./analysisData/${targetLang}/${folderType}_${bookID}/${parameter}.json`;
    const history = await getJsonFile(filePath);
    if (history) {
      // build chart
      let correctSeries = [];
      let partialSeries = [];
      let partialRatioSeries = [];
      let errorSeries = [];
      let suggestionsRatioSeries = [];
      let seconds = 0;
      for (let i = 0; i < history.length; i++) {
        const item = history[i];
        const step = item.pass;
        partialRatioSeries.push({
          x: step,
          y: (item.partialRatioMatches / item.totalAlignments),
        })
        correctSeries.push({
          x: step,
          y: (item.correctMatches / item.totalAlignments),
        })
        partialSeries.push({
          x: step,
          y: (item.partialMatches / item.totalAlignments),
        })
        errorSeries.push({
          x: step,
          y: (item.error),
        })
        suggestionsRatioSeries.push({
          x: step,
          y: (item.totalSuggestions / item.totalAlignments),
        })
        seconds += item.elapsedSecs;
      }

      const firstRow = history[0];
      const lastRow = history[history.length-1];
      const key = firstRow.parameter;
      const startParam = firstRow[key];
      const endParam = lastRow[key];
      const series = ['correct alignments', 'partial alignments', 'partial ratio', 'error', 'suggestions ratio'];
      const data = {values: [correctSeries, partialSeries, partialRatioSeries, errorSeries, suggestionsRatioSeries], series};
      const opts = {
        xLabel: parameter,
        yLabel: 'value',
        zoomToFit: true,
        height: 400,
      };
      const style = 'style="border: 1px solid black;border-collapse: collapse; margin-left: auto; margin-right: auto;"';

      // report trends in table
      let label = `<table ${style}><tr ${style}>`;
      let headers = ['parameter', 'min', 'max', 'delta', 'start', 'end', 'slope'];
      for (const header of headers) {
        label += `<th ${style}>${header}</th>`;
      }
      label += `</tr>`;
      for (let i = 0; i < series.length; i++) {
        label += `<tr ${style}>`;
        const key = series[i];
        label += `<td ${style}>${key}</td> `;
        const values = data.values[i].map(item => item.y);
        const min = Math.min(...values);
        label += `<td ${style}>${round(min)}</td> `;
        const max = Math.max(...values);
        label += `<td ${style}>${round(max)}</td> `;
        const delta = max - min;
        label += `<td ${style}>${round(delta, 8)}</td> `;
        const startValue = values[0];
        const endValue = values[values.length-1];
        label += `<td ${style}>${round(startValue)}</td> `;
        label += `<td ${style}>${round(endValue)}</td> `;
        const slope = (endValue - startValue) / (endParam - startParam);
        label += `<td ${style}>${round(slope, 8)}</td> `;
        label += `</tr>`
      }
      label += '</table>';

      // report totals in table
      label += `<br><br><table ${style}><tr ${style}>`;
      headers = ['name', 'value'];
      for (const header of headers) {
        label += `<th ${style}>${header}</th>`;
      }
      label += `</tr>`;
      label += addTableRow(style, 'Parameter Default', `${firstRow.parameterInitial}`);
      label += addTableRow(style, 'Total Time', `${(round(seconds / 60 / 60, 2))} hrs`);
      label += addTableRow(style, 'Verse Count', `${firstRow.verseCount}`);
      label += addTableRow(style, 'Total Alignments', `${firstRow.totalAlignments}`);
      label += '</table>';

      document.getElementById(`label${i}`).innerHTML = `<br/><div>${parameter}</div>${label}<br/><br/>`;

      await tfvis.render.linechart(document.getElementById(`plot${i}`), data, opts);
    } else {
      console.log(`could not read ${filePath}`);
    }
  }
}

// document.addEventListener("DOMContentLoaded", lrRun);
