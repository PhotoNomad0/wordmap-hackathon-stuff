//import fs from 'node:fs/promises';

const fs = require('fs');
const catboost = require( 'catboost' );

//https://www.npmjs.com/package/catboost


model = new catboost.Model();
model.loadModel('catboost_save.cbm');


function getFNum( key ){
  const colon_index = key.indexOf( ":" );
  const feature_num = key.slice( 1, colon_index );
  return parseInt( feature_num );
}

//load the data
const data = require( "../training_from_eph.json" );

//There are missing features from some examples,
//so going through all of them to compile the complete feature list set.
const featureList = [];
data.forEach( mapped_set =>{ 
  Object.keys( mapped_set['input'] ).forEach( feature => {
    if( !featureList.includes(feature) ){
      featureList.push(feature);
    }
  });
});
featureList.sort( (lhs, rhs) => (getFNum(lhs) > getFNum(rhs)) ? 1 : -1 );

//Now compile the list and fill in the missing features.
const mapped_data = data.map( mapped_set =>{
  return featureList.map( featureKey => 
      1e-9+((featureKey in mapped_set['input'])?mapped_set['input'][featureKey]:0) );
});


//Two hacks here.  The model can't run more then 20 predictions at once,
//so I just pipe them all through one at a time instead of in batches.
//The second is that we aren't useing any categorical features but it isn't happy
//not to be provided any so I am passing in zeros for the categories.
model_output = mapped_data.map( input_features =>{
  const empty_categrical_features = input_features.map( _ => 0 );
  const result = model.predict( [input_features], [empty_categrical_features] )[0];
  return result;
});

//Now save it back out by injecting the data back into the original json.
model_output.forEach( (predicted_confidence,i) => {
  data[i]['misc']['catboost_js_output'] = predicted_confidence;
})
//Save it out.
fs.writeFileSync( 'catboost_js_output.json', JSON.stringify(data) );
console.log( "done" );