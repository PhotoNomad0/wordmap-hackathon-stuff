
const WordMap = require( "wordmap");
const Lexer = require( "wordmap-lexer" );
const usfm_js = require( "usfm-js" );
const fs = require('fs');


const opts = {targetNgramLength: 3, warnings: false};
const wordmap = new WordMap.default(opts);


const MISS_INCLUSION = 1.1; //100%
//const MISS_INCLUSION = .2; //20%

function getJsonFile( path ){
    return require( "../public/" + path );
}

function getBibleContent(folder, chapterCount) {
    const target = {};
    for (let chapter = 1; chapter <= chapterCount; chapter++) {
      const targetChapter = {};
      const targetChapterPath = `${folder}/${chapter}.json`;
      const verses = getJsonFile(targetChapterPath);
  
      for (const verse of Object.keys(verses)) {
        let verseData = verses[verse];
        let verseStr;
        if (typeof verseData !== 'string') {
          const outputData = {
            'chapters': {},
            'headers': [],
            'verses': { '1': verseData },
          };
          const usfm = usfm_js.toUSFM(outputData, {chunk: true});
          const [, verseText ] = usfm.split('\\v 1');
          verseStr = verseText || '';
        } else {
          verseStr = verseData;
        }
        verseStr = usfm_js.removeMarker(verseStr).trim().replaceAll('\n', ' ');
        targetChapter[verse] = verseStr;
      }
      target[chapter] = targetChapter;
    }
    return target;
}

function initCorpus(map) {
    const chapterCount = 6;
    const target = getBibleContent('./en/eph', chapterCount);
    const source = getBibleContent('./ugnt/eph', chapterCount);
    for (let chapter = 1; chapter <= chapterCount; chapter++) {
        const targetChapter = target[chapter];
        const sourceChapter = source[chapter];
        for (let verse of Object.keys(sourceChapter)) {
            const verseNum = parseInt(verse);
            if (isNaN(verseNum)) {
                continue;
            }
            const sourceVerse = sourceChapter[verse];
            const targetVerse = targetChapter[verse];
            try {
                map.appendCorpusString(sourceVerse, targetVerse);
            } catch (e) {
                console.log(`error adding corpus ${chapter}:${verse}:\n${sourceVerse}\n${targetVerse}`, e);
            }
        }
    }
    console.log(target, source);
}
initCorpus(wordmap);


//get and hash the alignment_data
const alignment_data = require("./resources/alignments_for_eph.json");
var hashed_alignment_data = {}
alignment_data.forEach( alignment => {
    // const key = alignment.reference.bookId + ":" + alignment.reference.chapter + ":" + alignment.reference.verse + ":" + 
    //             alignment.sourceNgram.length + ":" + alignment.sourceNgram[0].position + ":" +
    //             alignment.targetNgram.length + ":" + alignment.targetNgram[0].position;

    const key = alignment.reference.bookId + ":" + alignment.reference.chapter + ":" + alignment.reference.verse + ":" + 
                ("n:" + alignment.sourceNgram.map( x => x.text ).join( ":" ) + ":" +
                "n:" + alignment.targetNgram.map( x => x.text ).join( ":" )).toLowerCase();

    alignment.matched_to_prediction = false;

    if( key in hashed_alignment_data ){
        hashed_alignment_data[ key ].push(alignment);      
    }else{
        hashed_alignment_data[ key ] = [alignment];
    }
    //console.log( alignment )
});


function use_verse( reference, sourceVerseText, targetVerseText ){
    let sourceTokens = Lexer.default.tokenize(sourceVerseText);
    let targetTokens = Lexer.default.tokenize(targetVerseText);

    const runOutput = wordmap.engine.run(sourceTokens,targetTokens);
    const predictions = wordmap.engine.score(runOutput);


    const collected_predictions = [];

    //now iterate through the predictions and find them in the hashed alignment data.
    predictions.forEach( prediction => {
        // const key = reference.bookId + ":" + reference.chapter + ":" + reference.verse + ":" +
        //             prediction.alignment.sourceNgram.tokenLength + ":" + prediction.alignment.sourceNgram.tokenPosition + ":" +
        //             prediction.alignment.targetNgram.tokenLength + ":" + prediction.alignment.targetNgram.tokenPosition;
        
        const key = reference.bookId + ":" + reference.chapter + ":" + reference.verse + ":" +
                    prediction.alignment.sourceNgram.key + ":" +
                    prediction.alignment.targetNgram.key;

        var valid_match = false;

        if( key in hashed_alignment_data ){
            hashed_alignment_data[key].forEach( alignment =>{
                if( Math.abs(alignment.sourceNgram[0].position - prediction.alignment.sourceNgram.tokenPosition) <= 2 &&
                    Math.abs(alignment.targetNgram[0].position - prediction.alignment.targetNgram.tokenPosition) <= 2 ){
                        valid_match = true;
                        alignment.matched_to_prediction = true;
                }
            });
        }

        
        if( valid_match ){
            prediction.scores.confidence = 1;

            collected_predictions.push( prediction )
        }else{
            prediction.scores.confidence = 0;

            if( Math.random() < MISS_INCLUSION ){
                collected_predictions.push( prediction )
            }
            //console.log( "miss" );
        }

    });

    return collected_predictions;
}

// const reference = { chapter: '1', verse: '1', bookId: 'eph' };
// const sourceVerseText = 'Παῦλος, ἀπόστολος ( οὐκ ἀπ’ ἀνθρώπων, οὐδὲ δι’ ἀνθρώπου, ἀλλὰ διὰ Ἰησοῦ Χριστοῦ, καὶ Θεοῦ Πατρὸς τοῦ ἐγείραντος αὐτὸν ἐκ νεκρῶν)';
// const targetVerseText = 'Paul, an apostle—not from men nor by man, but through Jesus Christ and God the Father, the one who raised him from the dead';
// use_verse( reference, sourceVerseText, targetVerseText );

const bookId = 'eph';
const srcLang = 'ugnt';
const trgLang = 'en';
const numChapters = 6;


const source = getBibleContent('./ugnt/eph', numChapters);
const target = getBibleContent('./en/eph', numChapters);

var total_collected_predictions = [];

for( var chapterNum = 0; chapterNum < numChapters; ++chapterNum ){
    const sourceChapterText = source[chapterNum+1];
    const targetChapterText = target[chapterNum+1];


    for( var verseNum = 0; verseNum < numChapters; ++verseNum ){
        const sourceVerseText = sourceChapterText[verseNum+1];
        const targetVerseText = targetChapterText[verseNum+1];

        const reference = { chapter: "" + (chapterNum+1), verse: "" + (verseNum+1), bookId: bookId };

        const new_predictions = use_verse( reference, sourceVerseText, targetVerseText )

        total_collected_predictions = total_collected_predictions.concat(new_predictions);
    }
}

//check for unmatched allignments.


//result:
//fs.writeFileSync( 'training_from_' + bookId + ".json", JSON.stringify(total_collected_predictions) );

//now produce csv content.
var headers = [ "output", "source", "target", "f:sLang", "f:tLang" ];

const scores = Object.keys(total_collected_predictions[0].scores);
scores.forEach( (score, i) => {
    if( score != "confidence" ){
        headers.push( "f" + (i+1) + ":" + score );
    }
});


var json_rebuilds = [];
var lines = [];
lines.push( headers );


total_collected_predictions.forEach( prediction => {
    const json_rebuild_input = {};
    const json_rebuild_output = {};
    const json_rebuild = { "input": json_rebuild_input,
                           "output": json_rebuild_output };
    const line = [];
    line.push( prediction.confidence );
    line.push( prediction.alignment.sourceNgram.key );
    line.push( prediction.alignment.targetNgram.key );
    line.push( srcLang );
    line.push( trgLang );
    json_rebuild_output[ "confidence" ] = prediction.confidence;
    json_rebuild_input[ "source" ] = prediction.alignment.sourceNgram.key;
    json_rebuild_input[ "target" ] = prediction.alignment.targetNgram.key;
    json_rebuild_input[ "f:sLang" ] = srcLang;
    json_rebuild_input[ "f:tLang" ] = trgLang;

    scores.forEach( (score,i) => {
        if( score != "confidence" ){
            line.push( prediction.scores[score] );
            json_rebuild_input[ "f" + (i+1) + ":" + score ] =  prediction.scores[score];
        }
    });

    lines.push(line);
    json_rebuilds.push(json_rebuild);
});

const csv_content = lines.map( e => e.join(",") ).join( "\n" );
fs.writeFileSync( 'training_from_' + bookId + ".csv", csv_content );


fs.writeFileSync( 'training_from_' + bookId + ".json", JSON.stringify(json_rebuilds) );