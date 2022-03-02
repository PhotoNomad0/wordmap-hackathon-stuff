
const WordMap = require( "wordmap");
const Lexer = require( "wordmap-lexer" );

const opts = {targetNgramLength: 3, warnings: false};
const wordmap = new WordMap.default(opts);

const reference = { chapter: '1', verse: '1', bookId: 'eph' };
const sourceVerseText = 'Παῦλος, ἀπόστολος ( οὐκ ἀπ’ ἀνθρώπων, οὐδὲ δι’ ἀνθρώπου, ἀλλὰ διὰ Ἰησοῦ Χριστοῦ, καὶ Θεοῦ Πατρὸς τοῦ ἐγείραντος αὐτὸν ἐκ νεκρῶν)';
const targetVerseText = 'Paul, an apostle—not from men nor by man, but through Jesus Christ and God the Father, the one who raised him from the dead';


// const maxSuggestions = 1e100;
// const min_confidence = -1e100;
//const suggestions = wordmap.predict(sourceVerseText, targetVerseText, maxSuggestions, min_confidence);


let sourceTokens = Lexer.default.tokenize(sourceVerseText);
let targetTokens = Lexer.default.tokenize(targetVerseText);

const predictions = wordmap.engine.run(sourceTokens,targetTokens);

//get and hash the alignment_data
const alignment_data = require("./resources/alignments_for_eph.json");
var hashed_alignment_data = {}
alignment_data.forEach( alignment => {
    const key = alignment.reference.bookId + ":" + alignment.reference.chapter + ":" + alignment.reference.verse + ":" + 
                  alignment.sourceNgram.length + ":" + alignment.sourceNgram[0].position + ":" +
                  alignment.targetNgram.length + ":" + alignment.targetNgram[0].position;
    hashed_alignment_data[ key ] = alignment;      
    //console.log( alignment )
});


//now iterate through the predictions and find them in the hashed alignment data.
predictions.forEach( prediction => {
    const key = reference.bookId + ":" + reference.chapter + ":" + reference.verse + ":" +
                  prediction.alignment.sourceNgram.tokenLength + ":" + prediction.alignment.sourceNgram.tokenPosition + ":" +
                  prediction.alignment.targetNgram.tokenLength + ":" + prediction.alignment.targetNgram.tokenPosition;

    
    if( key in hashed_alignment_data ){
        const matching_alignment = hashed_alignment_data[key];
        console.log( "match" );
        console.log( prediction );
        console.log( matching_alignment );
    }else{
        console.log( "miss" );
    }

});
