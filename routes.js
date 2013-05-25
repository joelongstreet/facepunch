var request = require('request');

var pendingClients  = [];
var activeClients   = [];


exports.redirect = function(req, res){
    if (/mobile/i.test(req.headers['user-agent'])) {
        res.redirect('/broadcaster');
    } else {
        res.redirect('/listener');
    }
};


exports.listener = function(req, res){
    var generateCode = function(next){
        var code = randomString(5);
        codeLookup(code, pendingClients) ? generateCode(next) : next(code);
    };

    generateCode(function(code){
        pendingClients.push({
            code        : code,
            autoClear   : setTimeout(function(){
                pendingClients.splice(getCodeIndex(code, pendingClients), 1);
            }, 300000)
        });

        res.render('listener', { code : code });
    });
};


exports.setListenerId = function(req, res){
    var codeObject = codeLookup(req.params.code, pendingClients);
    if(codeObject){
        codeObject.listenerId = req.params.socketId;
        res.send({ success : 'I am ready for you to enter the CODEZ' });
    } else{
        res.send(404);
    }
};


exports.broadcaster = function(req, res){
    res.render('broadcaster');
};


exports.matchBroadcastToListener = function(req, res){
    var codeObject = codeLookup(req.params.code, pendingClients);
    if(codeObject){
        clearTimeout(codeObject.autoClear);
        pendingClients.splice(getCodeIndex(req.params.code, pendingClients), 1);
        codeObject.broadcastId = req.params.socketId;
        activeClients.push(codeObject);
        res.send({ success : 'success' });
    } else{
        res.send(404);
    }
};


exports.getClientByBroadcastId = function(id){
    var result = false;
    for(var i=0; i<activeClients.length; i++){
        if(activeClients[i].broadcastId == id){
            result = activeClients[i]
            return result;
        }
    };

    return result;
};


// This needs to be on the server as the client is not able to determine
// the redirect url
exports.getFBPhotoURL = function(req, res){
    var earl = 'http://graph.facebook.com/' + req.params.id + '/picture?type=large';
    request(earl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send({ url : response.request.uri.href });
        }
    });
};


var codeLookup = function(code, list){
    var result = false;
    for(var i=0; i<list.length; i++){
        if(list[i].code == code){
            result = list[i]
        }
    }

    return result;
};


var getCodeIndex = function(code, list){
    var index = -1;

    for(var i = 0; i<list.length; i++){
        if(list[i].code == code){
            index = i
        }
    }

    return index;
};


var randomString = function(length){
    var charSet     = '1234567890';
    var rando       = '';
    var iterator    = 0;

    while (iterator < length){
        var randPos = Math.floor(Math.random() * charSet.length);
        rando += charSet.substring(randPos, randPos + 1);
        iterator++;
    }

    return rando;
};