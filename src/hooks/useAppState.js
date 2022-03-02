import {useEffect, useState} from "react";
import "./styles.css";

export default function useAppState() {
  const initialState={
    sourceString: '',
    targetString: '',
    corpus: [],
    alignments: [],
  }
  const [state, setState] = useState(initialState);
  
  const actions = useMemo(() => ({
    setResults: (results) => {  setState((prev) => ({...prev, results})) },
    setSourceString: (sourceString) => {  setState((prev) => ({...prev, sourceString})) },
    setTargetString: (targetString) => {  setState((prev) => ({...prev, targetString})) },
    setCorpus: (corpus) => {  setState((prev) => ({...prev, corpus})) },
    setAlignment: (alignment) => {  setState((prev) => ({...prev, alignment})) },
  }), []);
  
  const {
    sourceSentence,
    targetSentence,
    corpus,
    alignments,
  } = state;

  const wordmap = useWordMap({
    corpus,
    alignments,
  });

  return {
    state,
    actions,
    wordmap
  };
};
