import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import {getJsonFile} from "./wordMapOps";

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

export async function plotWordMapData(filePath, parameter) {
  const history = await getJsonFile(filePath);
  console.log(history);

    // build chart
    let correctSeries = [];
    let partialSeries = [];
    let errorSeries = [];
    for (let i = 0; i < history.length; i++) {
      const item = history[i];
      const step = item.pass;
      correctSeries.push({
        x: step,
        y: (item.correctMatches/item.totalAlignments),
      })
      partialSeries.push({
        x: step,
        y: (item.partialMatches/item.totalAlignments),
      })
      errorSeries.push({
        x: step,
        y: (item.error),
      })
    }

    const series = ['correct', 'partial', 'error'];
    const data = { values: [correctSeries, partialSeries, errorSeries], series};
    const opts = { xLabel: parameter, yLabel: 'value', yAxisDomain: [0, 1.1]};
    const surface = { name: `Optimizing ${parameter}`, tab: `${parameter} effects`};
    await tfvis.render.linechart(surface, data, opts);
}

// document.addEventListener("DOMContentLoaded", lrRun);
