console.log("Optimization");

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
}

async function run() {
  console.log("tf", tf);
  const m_init = 0 ;
  const m = tf.variable(tf.scalar(m_init));
  const b_init = 0 ;
  const b = tf.variable(tf.scalar(b_init));
  const xs = tf.tensor([1, 2, 3, 4, 5]);
  const ys = xs.add(0.5);

  const tries = 400;
  let numberOfSteps = 20;
  const stepSize = Math.floor(tries/ numberOfSteps);
  console.log(`sample frequency: ${stepSize}`);
  const learningRate = 0.005;
  const optimizer = tf.train.sgd(learningRate);
  // tfvis.show.modelSummary({ name: "Model Summary" }, optimizer);

  console.log('m initial', m.dataSync());
  console.log('b initial', b.dataSync());
  let history = [];
  for (let i = 0; i < tries; i++) {
    tf.tidy(() => { // automatically clean up tensors from the GPU
      if (!(i % stepSize)) {
        history.push({
          i,
          m: m.dataSync(),
          b: b.dataSync(),
          xs: xs.dataSync(),
          ys: ys.dataSync(),
        });
      }
      optimizer.minimize(() => {
        const y_new = equation(m, xs, b);
        const error_sq = errorSq(ys, y_new);
        return error_sq;
      });
    });
  }

  
  tf.tidy(() => { // automatically clean up tensors from the GPU
    history.push({
      i: tries,
      m: m.dataSync(),
      b: b.dataSync(),
      xs: xs.dataSync(),
      ys: ys.dataSync(),
    });

    let mSeries = [];
    let bSeries = [];
    for (let i = 0; i < history.length; i++) {
      const item = history[i];
      printProgress(item.i, item.m, item.b, item.ys, item.xs);
      mSeries.push({
        x: item.i,
        y: item.m,
      })
      bSeries.push({
        x: item.i,
        y: item.b,
      })
    }

    const series = ['m guess', 'b guess'];
    const data = { values: [mSeries, bSeries], series};
    const opts = { xLabel: 'step', yLabel: 'parameter'}
    const surface = { name: `Solving for m and b in y=m*x+b`, tab: 'Parameter Optimization'};
    tfvis.render.linechart(surface, data, opts);
    mSeries = [];
    history = [];
  });
  
}

document.addEventListener("DOMContentLoaded", run);
