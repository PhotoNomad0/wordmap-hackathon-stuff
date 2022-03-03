import {removeMarker, toUSFM} from "usfm-js";

export async function getCorpus({basePath, bookId, chapterCount}) {
  const corpus = [];
  if (basePath) {
    const target = await getBibleContent({path: `${basePath}/en/${bookId}`, chapterCount});
    const source = await getBibleContent({path: `${basePath}/ugnt/${bookId}`, chapterCount});
    for (let chapter = 1; chapter <= chapterCount; chapter++) {
      const targetChapter = target[chapter];
      const sourceChapter = source[chapter];
      for (let verse of Object.keys(sourceChapter)) {
        const verseNum = parseInt(verse);
        if (isNaN(verseNum)) {
          continue;
        }
        const source = sourceChapter[verse];
        const target = targetChapter[verse];
        corpus.push({ source, target });
      };
    };
  }
  return corpus;
};

export async function getBibleContent({path, chapterCount}) {
  const target = {};
  
  for (let chapter = 1; chapter <= chapterCount; chapter++) {
    const targetChapter = {};
    const targetChapterPath = `${path}/${chapter}.json`;
    const verses = await getJsonFile(targetChapterPath);

    for (const verse of Object.keys(verses)) {
      let verseData = verses[verse];
      let verseStr;
      if (typeof verseData !== 'string') {
        const outputData = {
          'chapters': {},
          'headers': [],
          'verses': { '1': verseData },
        };
        const usfm = toUSFM(outputData, {chunk: true});
        const [, verseText ] = usfm.split('\\v 1');
        verseStr = verseText || '';
      } else {
        verseStr = verseData;
      }
      verseStr = removeMarker(verseStr).trim().replaceAll('\n', ' ');
      targetChapter[verse] = verseStr;
    }
    target[chapter] = targetChapter;
  }
  return target;
};

export async function getJsonFile(filePath) {
  let json;
  try {
    const response = await fetch(filePath);
    json = await response.json();
  } catch (e) {
    console.error(`error reading ${filePath}:`, e);
  }
  return json;
};