import Lexer from "wordmap-lexer";

export const permutate = ({ wordmap, sourceSentence, targetSentence }) => {
  let sourceTokens = [];
  let targetTokens = [];

  if (typeof sourceSentence === "string") {
      sourceTokens = Lexer.tokenize(sourceSentence);
  } else {
      sourceTokens = sourceSentence;
  }

  if (typeof targetSentence === "string") {
      targetTokens = Lexer.tokenize(targetSentence);
  } else {
      targetTokens = targetSentence;
  }

  const runOutput = engine.run(sourceTokens, targetTokens)
  const predictions = engine.score();
};