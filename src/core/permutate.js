import Lexer from "wordmap-lexer";

export const permutate = ({ wordMap, sourceString, targetString }) => {
  let sourceTokens = [];
  let targetTokens = [];

  if (typeof sourceString === "string") {
      sourceTokens = Lexer.tokenize(sourceString);
  } else {
      sourceTokens = sourceString;
  }

  if (typeof targetString === "string") {
      targetTokens = Lexer.tokenize(targetString);
  } else {
      targetTokens = targetString;
  }

  const runOutput = wordMap.engine.run(sourceTokens, targetTokens)
  const predictions = wordMap.engine.score(runOutput);
  return predictions;
};