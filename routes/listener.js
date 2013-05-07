exports.index = function(req, res){
    var generateCode = function(next){
        var code = randomString(5);
        if(connectedCodes.indexOf(code) == -1){
            next(code);
        } else {
            generateCode(next);
        }
    };

    generateCode(function(code){
        res.render('listener', { code : code });
    });
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
}