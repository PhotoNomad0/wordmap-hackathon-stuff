import * as tf from '@tensorflow/tfjs';
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
  const data = await getJsonFile(filePath);
  console.log(data);
  // tf.tidy(() => { // automatically clean up tensors from the GPU
  //   history.push({
  //     i: passes,
  //     m: m.dataSync(),
  //     b: b.dataSync(),
  //     xs: xs.dataSync(),
  //     ys: ys.dataSync(),
  //   });
  //
  //   // build chart
  //   let mSeries = [];
  //   let bSeries = [];
  //   let mError = [];
  //   let bError = [];
  //   let loss = [];
  //   for (let i = 0; i < history.length; i++) {
  //     const item = history[i];
  //     const step = item.i;
  //     const error_sq = printProgress(step, item.m, item.b, item.ys, item.xs);
  //     mSeries.push({
  //       x: step,
  //       y: item.m,
  //     })
  //     mError.push({
  //       x: step,
  //       y: Math.abs(item.m - m_actual),
  //     })
  //     bSeries.push({
  //       x: step,
  //       y: item.b,
  //     })
  //     bError.push({
  //       x: step,
  //       y: Math.abs(item.b - b_actual),
  //     })
  //     loss.push({
  //       x: step,
  //       y: error_sq,
  //     })
  //   }
  //
  //   const series = ['m guess', 'b guess', 'm error', 'b error', 'error sq'];
  //   const data = { values: [mSeries, bSeries, mError, bError, loss], series};
  //   const opts = { xLabel: 'step', yLabel: 'parameter', yAxisDomain: [0, 1.1]};
  //   const surface = { name: `Solving for m and b in y=m*x+b`, tab: 'Parameter Optimization'};
  //   tfvis.render.linechart(surface, data, opts);
  //   mSeries = [];
  //   bSeries = [];
  //   mError = [];
  //   bError = [];
  //   loss = [];
  //   history = [];
  // });

}

// document.addEventListener("DOMContentLoaded", lrRun);
