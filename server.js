var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
	console.log ('DONT remove this section 000');
	
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

		console.log('mongoServiceName:', mongoServiceName);
		console.log('mongoHost:', mongoHost);
		console.log('mongoPort:', mongoPort);
		console.log('mongoDatabase:', mongoDatabase);
		console.log('mongoUser:', mongoUser);
		console.log('mongoPassword:', mongoPassword);
	  
  if (mongoHost && mongoPort && mongoDatabase) {
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
	console.log('mongoURL:', mongoURL);
  }
}
else {
	console.log ('NULL mongoURL - remove this section 111');
}

var db = null;

var initDb = function(callback) {
  if (mongoURL == null) return;
  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }
    db = conn;
  });
};

app.get('/', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n' + err);
      }
      res.sendFile('index.html');
    });
  } else {
    res.sendFile('index.html');
  }
});

app.get('/pagecount', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);

console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
