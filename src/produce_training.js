
const WordMap = require( "wordmap");
const Lexer = require( "wordmap-lexer" );
const usfm_js = require( "usfm-js" );
const fs = require('fs');


const opts = {targetNgramLength: 3, warnings: false};
const wordmap = new WordMap.default(opts);


const MISS_INCLUSION = .2;

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
    const key = alignment.reference.bookId + ":" + alignment.reference.chapter + ":" + alignment.reference.verse + ":" + 
                alignment.sourceNgram.length + ":" + alignment.sourceNgram[0].position + ":" +
                alignment.targetNgram.length + ":" + alignment.targetNgram[0].position;
    hashed_alignment_data[ key ] = alignment;      
    //console.log( alignment )
});


function use_verse( reference, sourceVerseText, targetVerseText ){
    let sourceTokens = Lexer.default.tokenize(sourceVerseText);
    let targetTokens = Lexer.default.tokenize(targetVerseText);

    const predictions = wordmap.engine.run(sourceTokens,targetTokens);


    const collected_predictions = [];

    //now iterate through the predictions and find them in the hashed alignment data.
    predictions.forEach( prediction => {
        const key = reference.bookId + ":" + reference.chapter + ":" + reference.verse + ":" +
                    prediction.alignment.sourceNgram.tokenLength + ":" + prediction.alignment.sourceNgram.tokenPosition + ":" +
                    prediction.alignment.targetNgram.tokenLength + ":" + prediction.alignment.targetNgram.tokenPosition;

        
        if( key in hashed_alignment_data ){
            const matching_alignment = hashed_alignment_data[key];
            //console.log( "match" );
            // console.log( prediction );
            // console.log( matching_alignment );

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

var total_collected_prodictions = [];

for( var chapterNum = 0; chapterNum < numChapters; ++chapterNum ){
    const sourceChapterText = source[chapterNum+1];
    const targetChapterText = target[chapterNum+1];


    for( var verseNum = 0; verseNum < numChapters; ++verseNum ){
        const sourceVerseText = sourceChapterText[verseNum+1];
        const targetVerseText = targetChapterText[verseNum+1];

        const reference = { chapter: "" + (chapterNum+1), verse: "" + (verseNum+1), bookId: bookId };

        const new_predictions = use_verse( reference, sourceVerseText, targetVerseText )

        total_collected_prodictions = total_collected_prodictions.concat(new_predictions);
    }
}

//result:
fs.writeFileSync( 'training_from_' + bookId + ".json", JSON.stringify(total_collected_prodictions) );