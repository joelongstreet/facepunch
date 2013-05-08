var availableCodes = [];

exports.index = function(req, res){
    var generateCode = function(next){
        var code = randomString(5);
        availableCodes.indexOf(code) == -1 ? next(code) : generateCode(next);
    };

    generateCode(function(code){
        availableCodes.push(code);
        res.render('listener', { code : code });

        // Remove from available codes if no one ever used it
        setTimeout(function(){
           var placement = availableCodes.indexOf(code); 
           if(placement != -1){
                availableCodes.splice(placement, 1)
           }
        }, 300000);
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