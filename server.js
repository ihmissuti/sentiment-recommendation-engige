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

io.on('connection', function(socket){
    
    mixpanel.track('page load', {
        distinct_id: socket.id
    });
    
    socket.on('rating', function(rating){
        
        console.log(rating)
        var r1 = sentiment(rating);
        console.dir(r1);
        if (r1.score == -5 || r1.score == -4) {
            var score = 1
        } else if (r1.score == -3 || r1.score == -2) {
            var score = 2
        } else if (r1.score == -1 || r1.score == 0 || r1.score == 1) {
            var score = 3
        } else if (r1.score == 2 || r1.score == 3) {
            var score = 4
        } else {
            var score = 5
        }
        socket.emit('score', score)
        
        mixpanel.track('review', {
            review: rating
        });

    })
    
})

http.listen((process.env.PORT || 8080), function(){
  console.log('listening on *:8080');
});