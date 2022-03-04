import { useCallback, useEffect, useState } from "react";
import { useDeepCompareCallback, useDeepCompareEffect, useDeepCompareMemo } from "use-deep-compare";
import ReactJson from "react-json-view";
import * as brain from 'brain.js/dist/brain-browser.js';

console.log(brain);

const useGpu = false;
const testRatio = 1/50;
const unalignedRatio = 10;

// provide optional config object (or undefined). Defaults shown.
// https://github.com/BrainJS/brain.js#training-options
const config = {
  log: console.log,
  logPeriod: unalignedRatio,
  errorThresh: 0.03,
  binaryThresh: 0.55, // ¯\_(ツ)_/¯
  activation: "sigmoid", // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh']
  iterations: 500,
  learningRate: 0.2,
  hiddenLayers: [8,3],
  decayRate: 0.7,
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  };
};

export default function Brain() {
  const defaultState = {
    trainingData: undefined,
    trained: false,
    testResults: [],
  };
  const [state, setState] = useState(defaultState);
  const { trainingData, trained, testResults } = state;

  const actions = {
    setTrainingData: (trainingData) => {setState((prev)=>({...prev, trainingData}))},
    setTrained: (trained) => {setState((prev)=>({...prev, trained}))},
    setTestResults: (testResults) => {setState((prev)=>({...prev, testResults}))},
  };
  const { setTrainingData, setTrained, setTestResults } = actions;
  
  const reset = useCallback(() => {
    setState((prev) => ({...defaultState, trainingData: prev.trainingData}));
  }, []);

  useDeepCompareEffect(() => {
    reset();
  }, [config, testRatio]);

  const getTrainingData  = useCallback( async () => {
    const csv = await (await fetch('./training_from_eph_filtered_columns.csv')).text();
    const rows = csv.split('\r\n');
    rows.shift();
    
    let aligned = [];
    let unaligned = [];

    rows.forEach(row => {
      const cells = row.split(',');
      const [
        confidence,
        source,
        target,
        sLang,
        tLang,
        sourceCorpusPermutationsFrequencyRatio,
        targetCorpusPermutationsFrequencyRatio,
        frequencyRatioCorpusFiltered,
        ngramRelativeTokenDistance,
        alignmentRelativeOccurrence,
        alignmentPosition,
        phrasePlausibility,
        ngramLength,
        characterLength,
        alignmentOccurrences,
        uniqueness
      ] = cells;

      const features = {
        sourceCorpusPermutationsFrequencyRatio: parseFloat(sourceCorpusPermutationsFrequencyRatio) || 0,
        targetCorpusPermutationsFrequencyRatio: parseFloat(targetCorpusPermutationsFrequencyRatio) || 0,
        frequencyRatioCorpusFiltered: parseFloat(frequencyRatioCorpusFiltered) || 0,
        ngramRelativeTokenDistance: parseFloat(ngramRelativeTokenDistance) || 0,
        alignmentRelativeOccurrence: parseFloat(alignmentRelativeOccurrence) || 0,
        alignmentPosition: parseFloat(alignmentPosition) || 0,
        phrasePlausibility: parseFloat(phrasePlausibility) || 0,
        ngramLength: parseFloat(ngramLength) || 0,
        characterLength: parseFloat(characterLength) || 0,
        alignmentOccurrences: parseFloat(alignmentOccurrences) || 0,
        uniqueness: parseFloat(uniqueness) || 0,
      };

      const traingDataPoint = {
        input: features,
        output: [parseFloat(confidence)],
      };
      
      if (parseFloat(confidence) === 1) {
        aligned.push(traingDataPoint);
      } else {
        unaligned.push(traingDataPoint);
      };
    });

    shuffleArray(unaligned);
    const count = Math.min(aligned.length*unalignedRatio, rows.length);
    const unalignedShuffledTruncated = unaligned.slice(0, count);
    const _trainingData = [...aligned, ...unalignedShuffledTruncated];
    shuffleArray(_trainingData);

    console.log('loaded training data', _trainingData.length);
    setTrainingData(_trainingData);
  }, []);

  useEffect(()=> {
    getTrainingData();
  }, []);

  const network = useDeepCompareMemo(() => {
    // create a simple feed forward neural network with backpropagation
    let network;
    if (useGpu) {
      network = new brain.NeuralNetworkGPU(config);
    } else {
      network = new brain.NeuralNetwork(config);
    };
    console.log('network', network);
    return network;
  }, [config, useGpu]);

  const train = useDeepCompareCallback(() => {
    if (network && trainingData) {
      // const testData = trainingData.map(d => d["input"]);
      const _trainingData = trainingData.slice(0,trainingData.length*(1-testRatio));
      console.log('training...', _trainingData.length);
      network.train(_trainingData);
      console.log('...trained', _trainingData.length);
      setTrained(true);
    };
  }, [network, trainingData]);

  const test = useDeepCompareCallback(() => {
    const results = [];
    if (network && trained) {
      trainingData.slice(trainingData.length*(1-testRatio), trainingData.length).forEach((d, i) => {
        const result = network.run(d.input); // [0.987]
        results.push(result);
        console.log('test output: ' + i + ' => ' + result);
      });
      setTestResults(results.sort((a,b) => b - a ));
    };
  }, [trainingData, trained]);

  const suggestions = useCallback(() => {
    // load corpus into wordmap
    // put sentence pair through wordmap to get scored permutations
    // run scored permutations through network
    // run wordMap.engine.predict(predictions: permutations)
  }, []);

  useDeepCompareEffect(() => {
    if (trainingData && !trained) {
      train();
    } else {
      test();
    };
  }, [trainingData, trained, train, test]);

  return (
    <div className="App">
      <ReactJson src={testResults} />
    </div>
  );
};
