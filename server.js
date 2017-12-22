var express = require('express'),
    app = express(),
    morgan = require('morgan');

var bodyParser = require('body-parser');

Object.assign = require('object-assign');

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(morgan('combined'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
        mongoPassword = process.env[mongoServiceName + '_PASSWORD'],
        mongoUser = process.env[mongoServiceName + '_USER'];

    if (mongoHost && mongoPort && mongoDatabase) {
        mongoURLLabel = mongoURL = 'mongodb://';
        if (mongoUser && mongoPassword) {
            mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
        mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    }
}

var db = null,
    dbDetails = new Object();
var ObjectID = require('mongodb').ObjectID;

var initDb = function (callback) {
    if (mongoURL == null) return;
    var mongodb = require('mongodb');
    if (mongodb == null) return;

    mongodb.connect(mongoURL, function (err, conn) {
        if (err) {
            callback(err);
            return;
        }
        db = conn;
        dbDetails.databaseName = db.databaseName;
        dbDetails.url = mongoURLLabel;
        dbDetails.type = 'MongoDB';
        console.log('Connected to MongoDB at: %s', mongoURL);
    });
};

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

app.get('/api/todos', function (req, res) {
    if (!db) {
        initDb(function (err) {});
    }
    if (db) {
        db.collection('todos', function (err, collection) {
            collection.find().toArray(function (err, result) {
                res.send(result);
            });
        });
    }
});

app.get('/api/todo/:id', function (req, res) {
    if (!db) {
        initDb(function (err) {});
    }
    if (db) {
        db.collection('todos', function (err, collection) {
            collection.findOne({
                _id: new ObjectID(req.params.id)
            }, function (err, result) {
                res.send(result);
            });
        });
    }
});

app.post('/api/todos', function (req, res) {
    if (!db) {
        initDb(function (err) {});
    }
    if (db) {
        var myObj = {
            text: req.body.text,
            ip: req.ip,
            date: Date.now()
        };
        db.collection('todos').insertOne(myObj, function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    }
});

app.put('/api/todo/:id', function (req, res) {
    if (!db) {
        initDb(function (err) {});
    }
    if (db) {
        db.collection('todos').updateOne({
            _id: new ObjectID(req.params.id)
        }, {
            $set: {
                text: req.body.text
            }
        }, function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    }
});

app.delete('/api/todo/:id', function (req, res) {
    if (!db) {
        initDb(function (err) {});
    }
    if (db) {
        db.collection('todos').removeOne({
            _id: new ObjectID(req.params.id)
        }, function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    }
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something bad happened!');
});

initDb(function (err) {
    console.log('Error connecting to Mongo. Message:\n' + err);
});

app.listen(port, ip);

console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
