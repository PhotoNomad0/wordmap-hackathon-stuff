import ReactJson from 'react-json-view';
import { permutate } from '../core/permutate';

export default function Corpus({ corpus }) {
  return (
    <div className='corpus'>
      <h2>Corpus:</h2>
      <ReactJson src={corpus} theme="monokai" style={{ maxHeight: '500px', overflow: 'scroll', whiteSpace: 'pre' }} />
    </div>
  );
};