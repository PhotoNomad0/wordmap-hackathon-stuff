import { useCallback } from "react";
import { useDeepCompareMemo } from "use-deep-compare";
import WordMap from "wordmap";

export default function useWordMap({ corpus=[] }) {
  const options = {targetNgramLength: 3, warnings: true};

  const addCorpus = useCallback(({wordMap, corpus}) => {
    corpus.forEach(({source, target}) => {
      wordMap.appendCorpusString(source, target);
    })
  }, []);

  const wordMap = useDeepCompareMemo(() => {
    const _wordMap = new WordMap(options);
    addCorpus({ wordMap: _wordMap, corpus });
    return _wordMap;
  }, [addCorpus, corpus]);

  return wordMap;
};