import {useEffect, useState} from "react";
import "./styles.css";
import WordMap from "wordmap";
import {getPredictions, initAlignmentMemory, initCorpus, initWordMap, predictCorpus} from "./wordMapOps";
import Permutations from "./components/Permutations";
import {doWordMapIterations, initialEngineWeights} from "./iterateWordMap";
import {plotWordMapData} from "./linearRegression";
// const alignment_data = require("./resources/alignments_for_eph.json");

export default function App() {
  const [results, setResults] = useState('');
  const [wordMap, setWordMap] = useState(null);

  useEffect(async () => {
    // doWordMapIterations();
    await plotWordMapData();
  }, [  ]);

  const plotCount = Object.keys(initialEngineWeights).length;

  // const getPlots = () => {
  //   const plots = [];
  //   for (let i = 1; i <= plotCount; i++) {
  //     const id=`plot${i}`;
  //     plots.push(
  //       <div className="plot" id={id} key={id}></div>
  //     )
  //   }
  //   return plots;
  // }

  return (
    <div className="App">
      <h1>WordMap Tuning</h1>

      <div className="plot" id="plot0"></div>
      <div className="label" id="label0"></div>
      <div className="plot" id="plot1"></div>
      <div className="label" id="label1"></div>
      <div className="plot" id="plot2"></div>
      <div className="label" id="label2"></div>
      <div className="plot" id="plot3"></div>
      <div className="label" id="label3"></div>
      <div className="plot" id="plot4"></div>
      <div className="label" id="label4"></div>
      <div className="plot" id="plot5"></div>
      <div className="label" id="label5"></div>
      <div className="plot" id="plot6"></div>
      <div className="label" id="label6"></div>
      <div className="plot" id="plot7"></div>
      <div className="label" id="label7"></div>
      <div className="plot" id="plot8"></div>
      <div className="label" id="label8"></div>
      <div className="plot" id="plot9"></div>
      <div className="label" id="label9"></div>
      <div className="plot" id="plot10"></div>
      <div className="label" id="label10"></div>
      <div className="plot" id="plot11"></div>
      <div className="label" id="label11"></div>
      <div className="plot" id="plot12"></div>
      <div className="label" id="label12"></div>
      <div className="plot" id="plot13"></div>
      <div className="label" id="label13"></div>
      <div className="plot" id="plot14"></div>
      <div className="label" id="label14"></div>
      <div className="plot" id="plot15"></div>
      <div className="label" id="label15"></div>
      <div className="plot" id="plot16"></div>
      <div className="label" id="label16"></div>

      {/*<h2>Permutations:</h2>*/}
      {/*<Permutations*/}
      {/*  wordmap={wordmap}*/}
      {/*  sourceSentence={sourceVerseText}*/}
      {/*  targetSenetence={targetVerseText}*/}
      {/*/>*/}
    </div>
  );
}
