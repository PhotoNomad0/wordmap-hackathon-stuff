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
  const ys = xs.add(1);

  const tries = 400;
  let numberOfSteps = 10;
  const stepSize = Math.floor(tries/ numberOfSteps);
  console.log(`sample frequency: ${stepSize}`);
  const learningRate = 0.01;
  const optimizer = tf.train.sgd(learningRate);
  // tfvis.show.modelSummary({ name: "Model Summary" }, optimizer);

  console.log('m initial', m.dataSync());
  console.log('b initial', b.dataSync());
  let history = [];
  for (let i = 0; i < tries; i++) {
    tf.tidy(() => { // automatically clean up tensors from the GPU
      optimizer.minimize(() => {
        const y_new = equation(m, xs, b);
        const error_sq = errorSq(ys, y_new);
        return error_sq;
      });
      if (!(i % stepSize)) {
        history.push({
          i,
          m: m.dataSync(),
          b: b.dataSync(),
          xs: xs.dataSync(),
          ys: ys.dataSync(),
        });
      }
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

    for (let i = 0; i < history.length; i++) {
      const item = history[i];
      printProgress(item.i, item.m, item.b, item.ys, item.xs);
    }
    history = [];
  });
  
  // const values = data.map((d) => ({
  //   x: d.horsepower,
  //   y: d.mpg
  // }));

  // tfvis.render.scatterplot(
  //   { name: "Input vs output" },
  //   { values },
  //   {
  //     xLabel: "x",
  //     yLabel: "y",
  //     height: 300
  //   }
  // );

  // // Create the model
  // const model = createModel();
  // tfvis.show.modelSummary({ name: "Model Summary" }, model);

  // // Convert the data to a form we can use for training.
  // const tensorData = convertToTensor(data);
  // const { inputs, labels } = tensorData;

  // // Train the model
  // await trainModel(model, inputs, labels);
  // console.log("Done Training");

  // // Make some predictions using the model and compare them to the
  // // original data
  // testModel(model, data, tensorData);

  // More code will be added below
}

document.addEventListener("DOMContentLoaded", run);
