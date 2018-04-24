require('dotenv').config();
var express = require('express');
var app = express();
var path = require('path');
// var public = __dirname + "/public/";
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(path.join(__dirname, '/public')));
var sentiment = require('sentiment');

io.on('connection', function(socket){
    
    socket.on('rating', function(rating){
        
        console.log(rating)
        var r1 = sentiment(rating);
        console.dir(r1);
        if (r1.score == -5 || r1.score == -4) {
            var score = 1
            // var comment = "Maybe this one is better:"
        } else if (r1.score == -3 || r1.score == -2) {
            var score = 2
            // var comment =  "Maybe this one is better:"
        } else if (r1.score == -1 || r1.score == 0 || r1.score == 1) {
            var score = 3
            // var comment = "We suggest this for you:"
        } else if (r1.score == 2 || r1.score == 3) {
            var score = 4
            // var comment = "Then you might like this also:"
        } else {
            var score = 5
            // var comment = "Then I'm sure you'll like this one also:"
        }
        socket.emit('score', score)
        // socket.emit('comment', comment)

    })
    
})

http.listen((process.env.PORT || 8080), function(){
  console.log('listening on *:8080');
});