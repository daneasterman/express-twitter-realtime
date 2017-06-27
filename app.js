var express = require('express');
var app     = express();
var port    = process.env.PORT || 3000;
var morgan = require('morgan');
var router  = express.Router();
var server  = require('http').createServer(app);

app.set('views', './views');
// Template library
app.set('view engine', 'jade');
// For error logging
app.use( morgan('dev') );
app.use('/', router);
app.use(express.static(__dirname + '/public'));

router.get('/', function(req, res) {
  res.render('index', { header: 'index!'});
});

server.listen(port);
console.log('Server started on ' + port);

// Extra important libraries:
var io   = require('socket.io')(server);
var Twit = require('twit');

var twitter = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});
// console.log(twitter);

var stream = twitter.stream('statuses/filter', { track: 'javascript' });

// Creates new data object to simplify naming
io.on('connect', function(socket) {
  stream.on('tweet', function(tweet) {
    var data = {};
    data.name = tweet.user.name;
    data.screen_name = tweet.user.screen_name;
    data.text = tweet.text;
    data.user_profile_image = tweet.user.profile_image_url;
    socket.emit('tweets', data);
  });
});
