import {useEffect, useState} from "react";
import "./styles.css";
import WordMap from "wordmap";
import {getPredictions, initAlignmentMemory, initCorpus, initWordMap, predictCorpus} from "./wordMapOps";
import Permutations from "./components/Permutations";
import {doWordMapIterations} from "./iterateWordMap";
import {plotWordMapData} from "./linearRegression";
// const alignment_data = require("./resources/alignments_for_eph.json");

export default function App() {
  const [results, setResults] = useState('');
  const [wordMap, setWordMap] = useState(null);

  useEffect(async () => {
    // doWordMapIterations();
    const parameter = 'alignmentPosition';
    const filePath = `./analysisData/${parameter}.json`;
    await plotWordMapData(filePath, parameter);
  }, [  ]);

return (
  <div className="App">
    <h1>WordMap Tuning</h1>
    <h2>Results:</h2>
    <div>{results}</div>
    <h2>Permutations:</h2>
    {/*<Permutations*/}
    {/*  wordmap={wordmap}*/}
    {/*  sourceSentence={sourceVerseText}*/}
    {/*  targetSenetence={targetVerseText}*/}
    {/*/>*/}
  </div>
);
}
