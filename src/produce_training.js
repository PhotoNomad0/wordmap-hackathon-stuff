
const WordMap = require( "wordmap");
const Lexer = require( "wordmap-lexer" );

const opts = {targetNgramLength: 3, warnings: false};
const wordmap = new WordMap.default(opts);

const sourceVerseText = 'Παῦλος, ἀπόστολος ( οὐκ ἀπ’ ἀνθρώπων, οὐδὲ δι’ ἀνθρώπου, ἀλλὰ διὰ Ἰησοῦ Χριστοῦ, καὶ Θεοῦ Πατρὸς τοῦ ἐγείραντος αὐτὸν ἐκ νεκρῶν)';
const targetVerseText = 'Paul, an apostle—not from men nor by man, but through Jesus Christ and God the Father, the one who raised him from the dead';


// const maxSuggestions = 1e100;
// const min_confidence = -1e100;
//const suggestions = wordmap.predict(sourceVerseText, targetVerseText, maxSuggestions, min_confidence);


let sourceTokens = Lexer.default.tokenize(sourceVerseText);
let targetTokens = Lexer.default.tokenize(targetVerseText);

const predictions = wordmap.engine.run(sourceTokens,targetTokens);
    

console.log( predictions );