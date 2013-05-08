var pendingCodes    = [];
var activeCodes     = [];

exports.listener = function(req, res){
    var generateCode = function(next){
        var code = randomString(5);
        codeLookup(code, pendingCodes) ? generateCode(next) : next(code);
    };

    generateCode(function(code){
        pendingCodes.push({
            code        : code,
            autoClear   : setTimeout(function(){
                pendingCodes.splice(getCodeIndex(code, pendingCodes), 1);
            }, 300000)
        });

        res.render('listener', { code : code });
    });
};


exports.setListenerId = function(req, res){
    var codeObject = codeLookup(req.params.code, pendingCodes);
    if(codeObject){
        codeObject.listenerId = req.params.socketId;
        res.send({ success : 'success' })
    } else{
        res.send(404);
    }
};


exports.broadcaster = function(req, res){
    res.render('broadcaster');
};


exports.matchBroadcastToListener = function(req, res){
    var codeObject = codeLookup(req.params.code, pendingCodes);
    if(codeObject){
        clearTimeout(codeObject.autoClear);
        pendingCodes.splice(getCodeIndex(req.params.code, pendingCodes), 1);
        codeObject.broadcastId = req.params.socketId;
        res.send({ success : 'success' });
    } else{
        res.send(404);
    }
};


// Return the code object
var codeLookup = function(code, list){
    var result = false;
    for(var i=0; i<list.length; i++){
        if(list[i].code == code){
            result = list[i]
        }
    }

    return result;
};


// Find the index of a code in the list
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
    var charSet     = 'abcdefghjkmnpqrstuvwxyz23456789';
    var rando       = '';
    var iterator    = 0;

    while (iterator < length){
        var randPos = Math.floor(Math.random() * charSet.length);
        rando += charSet.substring(randPos, randPos + 1);
        iterator++;
    }

    return rando;
};