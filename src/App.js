import React from "react";

import "./styles.css";

import Permutations from "./components/Permutations";
import Brain from "./components/Brain";

import useAppState from "./hooks/useAppState";
import useCorpus from "./hooks/useCorpus";
import useWordMap from "./hooks/useWordMap";

import Corpus from "./components/Corpus";
import Permutations from "./components/Permutations";
import Predictions from "./components/Predictions";


export default function App() {
  const { state: { sourceString, targetString }, actions } = useAppState();
  const corpus = useCorpus({ basePath: '.', bookId: 'eph', chapterCount: 6 });
  const wordMap = useWordMap({ corpus });

  return (
    <div className="App">
      <h2>Brain.js:</h2>
      <Brain />
      <h1>WordMap Tuning</h1>
      <Corpus corpus={corpus} />
      <Permutations wordMap={wordMap} sourceString={sourceString} targetString={targetString} />
      <Predictions />
    </div>
  );
};
