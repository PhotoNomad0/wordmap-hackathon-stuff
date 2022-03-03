brain = require( "brain.js" )

use_gpu = false;

// provide optional config object (or undefined). Defaults shown.
// https://github.com/BrainJS/brain.js#training-options
const config = {
    log: true,
    binaryThresh: 0.5, // ¯\_(ツ)_/¯
    hiddenLayers: [10,20,10,5], // array of ints for the sizes of the hidden layers in the network
    activation: 'relu', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh']
    iterations: 2000
  };
  
  // create a simple feed forward neural network with backpropagation
  var net;
  if( use_gpu ){
    net = new brain.NeuralNetworkGPU(config);
  }else{
    net = new brain.NeuralNetwork(config);
  }

  const training_data = require( "../training_from_eph.json" );
  
  net.train(training_data);
  
  const output = net.run(training_data["input"]); // [0.987]
  
  console.log(output);

  //here is how to load and save the model as json.
  //https://github.com/BrainJS/brain.js#json
  //  const json = net.toJSON();
  //   net.fromJSON(json);