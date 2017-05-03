var express = require('express');
var app = express();
var data,tweets,mediaUrl;
var xANGLE;

var Twit = require('twit');
var fs = require('fs');
var config = require('./twitter_keys');
var T = new Twit(config);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false })); 

var http = require('http')
  , socketio = require('socket.io')
  , fs = require('fs')
  , os = require('os')
  , path = require('path')
  , replacestream = require('replacestream');


// R E A D   S E R V E R   I P

var ifaces=os.networkInterfaces();
var ips = [];
for (var dev in ifaces) {
  var alias=0;
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
      ips.push(details.address);
      ++alias;
    }
  });
}
var ip = ips.filter(function(d) {
  return d != '127.0.0.1';
})[0];

app.post('/search', function(req, res) {
  var value = req.body.search;
  var list = [];
  //console.log(req);
  //res.send(value);

  var search = req.body.textfield;
  var textrsp = "";

  var parameters = { 
  q: textrsp + value, 
  lang: 'en',
  count: 200
  };

  //Rest API
  T.get('search/tweets', parameters, function (err, data, response) { 

    tweets = data.statuses; 
    //console.log(parameters.q);
    for (var i = 0; i < tweets.length; i++) {
       var tweetObj = tweets[i]
       var tweetTxt = tweetObj.text

       if (tweetObj.entities.hasOwnProperty('media')) {
          mediaUrl = tweetObj.entities.media[0].media_url;
          list.push(mediaUrl);
          console.log(mediaUrl);
        }
      }
      res.send(list);

  });
});

// function handler (req, res) {
//   res.writeHead(200);

//   var readStream = fs.createReadStream(path.join(__dirname, 'public'))
//     .pipe(replacestream('<<IP>>', ip ))
//     .pipe(res);
// }

var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(express.static('public'));

//var app = http.createServer(handler);
var port = 8014;
server.listen(port);

console.info('To connect, open your mobile web browser and go to '+ip+':'+port+'. Make sure the computer and phone are connected to the same network');


//var io = socketio.listen(app);

// Make two lists of writable streams, one for the motions of all
// connected devices, and one for the orientations
var streams = {
  'motion': {},
  'orientation': {}
};

io.sockets.on('connection', function (socket) {

  socket.on('motion', function (data) {
    var a = data.acceleration;
    var id = data.sender;
    //console.log(id + " has logged in: " + 'direction: ' + 'x:' + a.x + ', y:' + a.y + ', z:' + a.z + "\n");
  });

  socket.on('orientation', function (data) {
    xANGLE = data.alpha;
    //console.log('angle: ' + 'x:' + data.alpha + ', y:' + data.beta + ', z:' + data.gamma +  "\n");
    //console.log('y:' + data.gamma); 
    io.sockets.emit('angles', {'y':data.gamma, 'x':data.beta, 'z':data.alpha});
  });
});



