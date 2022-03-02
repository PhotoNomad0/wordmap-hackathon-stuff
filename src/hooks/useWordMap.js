import WordMap from "wordmap";

export default function useWordMap({ corpus, alignments }) {
  const options = {targetNgramLength: 3, warnings: true};

  
  const wordmap = useDeepCompareMemo(() => {
    new WordMap(options);
  }, [corpus, alignments]);

  return wordmap;
};