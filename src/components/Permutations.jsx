import ReactJson from 'react-json-view';
import { permutate } from '../core/permutate';

export default function Permutations({wordmap, sourceSentence, targetSentence}) {
  const permutations = useMemo(() => {
    return permutate({ wordmap, sourceSentence, targetSentence });
  }, []);

  return <ReactJson src={permutations} />
}
