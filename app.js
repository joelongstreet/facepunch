var express = require('express');
var path    = require('path');
var app     = express()
var server  = app.listen(3000);
var io      = require('socket.io').listen(server);
var routes  = require('./routes');

io.set('log level', 1); 


app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));


if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


app.get('/', function(req, res){
    if (/mobile/i.test(req.headers['user-agent'])) {
        res.redirect('/broadcaster');
    } else {
        res.redirect('/listener');
    }
});

app.get('/listener', routes.listener);
app.get('/broadcaster', routes.broadcaster);
app.get('/listener/setSocketId/:socketId/:code', routes.setListenerId);
app.get('/broadcaster/setSocketId/:socketId/:code', routes.matchBroadcastToListener);
app.post('/trash', function(req, res){
    res.send({})
});

console.log('Express server listening on port ' + app.get('port'));