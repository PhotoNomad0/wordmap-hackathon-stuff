import {useEffect, useState} from "react";
import "./styles.css";
import WordMap from "wordmap";
import {getPredictions, initAlignmentMemory} from "./wordMapOps";
const alignment_data = require("./resources/alignments_for_eph.json");
const map = new WordMap({ targetNgramLength: 5, warnings: false });

export default function App() {
  const [results, setResults] = useState('');

  useEffect(async () => {
    // load WordMap with alignment data
    initAlignmentMemory(map, alignment_data);
    
    const sourceVerseText = 'ἀπόστολος';
    const targetVerseText = 'apostle';
    const prediction = await getPredictions(map, sourceVerseText, targetVerseText);
    setResults(JSON.stringify(prediction));
  }, [  ]);

return (
  <div className="App">
    <h1>WordMap Tuning</h1>
    <h2>Results:</h2>
    <div>{results}</div>
  </div>
);
}
