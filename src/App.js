import {useEffect, useState} from "react";
import "./styles.css";
import WordMap from "wordmap";
import {getPredictions, initAlignmentMemory, initCorpus, initWordMap} from "./wordMapOps";
import Permutations from "./components/Permutations";
const alignment_data = require("./resources/alignments_for_eph.json");

export default function App() {
  const [results, setResults] = useState('');
  const [wordMap, setWordMap] = useState(null);

  useEffect(async () => {
    const chapterCount = 6;
    const bookId = 'eph';
    const { map, target, source, corpus } = await initWordMap(alignment_data, '.', bookId, chapterCount);

    const sourceVerseText = 'Παῦλος, ἀπόστολος ( οὐκ ἀπ’ ἀνθρώπων, οὐδὲ δι’ ἀνθρώπου, ἀλλὰ διὰ Ἰησοῦ Χριστοῦ, καὶ Θεοῦ Πατρὸς τοῦ ἐγείραντος αὐτὸν ἐκ νεκρῶν)';
    const targetVerseText = 'Paul, an apostle—not from men nor by man, but through Jesus Christ and God the Father, the one who raised him from the dead';
    const prediction = await getPredictions(map, sourceVerseText, targetVerseText);
    setResults(JSON.stringify(prediction));
    setWordMap(map);
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
