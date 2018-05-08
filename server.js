require('dotenv').config();
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(path.join(__dirname, '/public')));
var sentiment = require('sentiment');
// grab the Mixpanel factory
var Mixpanel = require('mixpanel');
 
// create an instance of the mixpanel client
var mixpanel = Mixpanel.init(process.env.mixpanel);

var fs = require('file-system');

io.on('connection', function(socket){

    // if (fs.existsSync('./net.json')) {
        
    //     var trainingJSON = JSON.parse(fs.readFileSync('./net.json', 'utf8'));
    //     console.log("on page load training data:")
    //     console.log(trainingJSON)
    //     socket.emit('trainingJSON', trainingJSON);
    // }
    
    
    mixpanel.track('page load', {
        distinct_id: socket.id
    });
    
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
        
        mixpanel.track('review', {
            distinct_id: socket.id,
            review: rating
        });
        
        // socket.on('net', function(net){
        //     console.log("Saving the net: ")
        //     console.log(net)
        //     fs.writeFileSync('./net.json', JSON.stringify(net, null, '  '));
        // })

    })
    
    
})

app.get('/privacy', function(req, res,next) {  
    res.sendFile(__dirname + '/public/privacy.html');
})

http.listen((process.env.PORT || 8080), function(){
  console.log('listening on *:8080');
});