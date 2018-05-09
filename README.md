### A simple neural network and sentiment analysis demo made by modifying an original recommendation engine example made by brain.js. ###

Original brain.js example:
https://github.com/BrainJS/brain.js/tree/develop/examples/recommendation-engine

Brain.js:
https://github.com/BrainJS/brain.js

How it works:
Give your comments on shirts to get recommendations generated by machine learning. The more reviews you give and the more emotional you are, the better recommendations you get.

Live demo:
https://speech.kimmotap.io

Training data storage without MongoDB:
local trainingData.json file storage

Training data storage to MongoDB:
Place your MongoDB uri to MONGODB_URI config variable and the training data will be saved to 'training' document in MongoDB.