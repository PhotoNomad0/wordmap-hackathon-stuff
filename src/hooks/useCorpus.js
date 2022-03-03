import { useCallback, useEffect, useState } from "react";
import { getCorpus } from "../core/corpus";

export default function useCorpus({basePath, bookId, chapterCount}) {
  const [corpus, setCorpus] = useState([]);

  const _getCorpus = useCallback(async ({ basePath, bookId, chapterCount }) => {
    const _corpus = await getCorpus({ basePath, bookId, chapterCount });
    setCorpus(_corpus);
  }, []);

  useEffect(() => {
    _getCorpus({ basePath, bookId, chapterCount });
  }, [basePath, bookId, chapterCount]);

  return corpus;
};