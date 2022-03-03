import { useState, useMemo } from "react";

export default function useAppState() {
  const initialState={
    sourceString: 'Παῦλος, ἀπόστολος ( οὐκ ἀπ’ ἀνθρώπων, οὐδὲ δι’ ἀνθρώπου, ἀλλὰ διὰ Ἰησοῦ Χριστοῦ, καὶ Θεοῦ Πατρὸς τοῦ ἐγείραντος αὐτὸν ἐκ νεκρῶν)',
    targetString: 'Paul, an apostle—not from men nor by man, but through Jesus Christ and God the Father, the one who raised him from the dead',
  };
  const [state, setState] = useState(initialState);
  
  const actions = useMemo(() => ({
    setSourceString: (sourceString) => {  setState((prev) => ({...prev, sourceString})) },
    setTargetString: (targetString) => {  setState((prev) => ({...prev, targetString})) },
  }), []);

  return {
    state,
    actions,
  };
};
