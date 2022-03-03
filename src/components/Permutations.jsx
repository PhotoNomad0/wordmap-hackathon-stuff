import { useMemo } from 'react';
import ReactJson from 'react-json-view';
import { permutate } from '../core/permutate';

export default function Permutations({ wordMap, sourceString, targetString }) {
  const permutations = useMemo(() => {
    return permutate({ wordMap, sourceString, targetString });
  }, [sourceString, targetString]);

  return (
    <div className='permutations'>
      <h2>Permutations:</h2>
      <ReactJson src={permutations} theme="monokai" style={{ maxHeight: '500px', overflow: 'scroll', whiteSpace: 'pre' }} />
    </div>
  );
};