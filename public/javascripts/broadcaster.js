var socket  = io.connect('/');
var chars   = { 48: 0, 49: 1, 50: 2, 51: 3, 52: 4, 53: 5, 54: 6, 55: 7, 56: 8, 57: 9 };

$(function(){
    $('#start').click(function(){
        $.ajax({
            type    : 'GET',
            url     : '/broadcaster/setSocketId/' + socket.socket.sessionid + '/' + $('#secret').val().trim(),
            success : function(data){
                $('.form').hide();
                $('.ok-go').show();
            }, error : function(err, msg){
                $('.form').hide();
                $('.error').show();
            }
        });
    });

    $('#retry').click(function(){
        $('.form').show();
        $('.error').hide();
    });

    $('#secret')[0].addEventListener('input', inputHelper);
    window.addEventListener('keydown', keydownHelper); 
});


var inputHelper = function(e){
    e.preventDefault();
    window.removeEventListener('keydown', keydownHelper)
};


var keydownHelper = function(e){
    e.preventDefault();
    $('#secret')[0].removeEventListener('input', inputHelper); 

    var val = $('#secret').val()

    if (e.keyCode === 8 && val.length) {
        $('#secret').val(val.slice(0, val.length - 1))
        return;
    }

    // If not a number, do nada
    if (typeof chars[e.keyCode] === 'undefined') { return; }

    val += chars[e.keyCode];
    $('#secret').val(val);
};


var paused = false;
window.ondevicemotion = function(e){
    if(e.acceleration.x > 10 && paused == false){
        socket.emit('punch', { intensity : e.acceleration.x });
        setTimeout(function(){
            paused = false;
        }, 300);
    }
};