require('dotenv').config();
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(path.join(__dirname, '/public')));
var sentiment = require('sentiment');
var Mixpanel = require('mixpanel');
var brain = require("brain.js");
 
// create an instance of the mixpanel client
var mixpanel = Mixpanel.init(process.env.mixpanel);

var fs = require('file-system');

io.on('connection', function(socket){
    
    //track page load to Mixpanel
    mixpanel.track('page load', {
        distinct_id: socket.id
    });
    
    //catch the rating review from client and respond with a display text for the suggested T-Shirt
    socket.on('rating', function(rating){
        
        console.log(rating)
        var r1 = sentiment(rating);
        console.dir(r1);
        if (r1.score <= -4 ) {
            var score = 1
            var suggestionText = "That was one ugly T-Shirt. Here's the current suggestion:"
        } else if (r1.score == -3 || r1.score == -2) {
            var score = 2
            var suggestionText = "Maybe the next one is better. Here's the current suggestion:"
        } else if (r1.score == -1 || r1.score == 0 || r1.score == 1) {
            var score = 3
            var suggestionText = "Thanks for your review. Here's the current suggestion:"
        } else if (r1.score == 2 || r1.score == 3) {
            var score = 4
            var suggestionText = "Glad you liked it. Here's the current suggestion:"
        } else {
            var score = 5
            var suggestionText = "Nice! Here's the current suggestion:"
        }
        socket.emit('score', score)
        socket.emit('suggestion text', suggestionText)
        
        //Mixpanel event tracking
        mixpanel.track('review', {
            distinct_id: socket.id,
            review: rating
        });

    })
    //rating END
    
    //training data handling START
    socket.on('trainingData', function(trainingData){
        
        if (!process.env.MONGODB_URI) {
            
            //catch the latest training data from client
            var num = trainingData.length - 1
            var clientTrainingData = trainingData[num]
            console.log("training data:")
            console.log(clientTrainingData)
            
            //push the training data to JSON storage
            fs.readFile('trainingData.json', 'utf8', function (err, data) {
                
                if (err) {
                    console.log(err)
                }
                console.log("data:")
                console.log(data)
                var json = JSON.parse(data)
                json.push(clientTrainingData)
            
                fs.writeFile('trainingData.json', JSON.stringify(json), null, '  ')
                
                let network = new brain.NeuralNetwork({
    				activation: 'sigmoid',
    				hiddenLayers: [4]
    			});
    			
    			//train the net
    			network.train(JSON.parse(data),{ 
    			    iterations: 150,
    			    log: true,
    			    logPeriod: 10   
    			});
                
            })

        }
        //Training data handling END
    });
    
})

app.get('/privacy', function(req, res,next) {  
    res.sendFile(__dirname + '/public/privacy.html');
})

http.listen((process.env.PORT || 8080), function(){
  console.log('listening on *:8080');
});