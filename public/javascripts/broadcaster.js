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

    // Allow touch events to fire punches. Simplifies testing and some people
    // are just fucking lazy
    $('.ok-go')[0].addEventListener('touchstart', function(){
        socket.emit('punch', { intensity : 20 });
    });

    // Mobile devices bring up special ui elements during shake events
    // after form inputs. This prevents default form behavior and therefore
    // prevents the events from firing.
    window.addEventListener('keydown', function(e){
        e.preventDefault();
        var val = $('#secret').val()

        // If backspace is pressed
        if (e.keyCode === 8 && val.length) {
            $('#secret').val(val.slice(0, val.length - 1))
            return;
        }

        // If not a number, do nothing
        if (typeof chars[e.keyCode] === 'undefined') { return; }

        // If it is a character...
        val += chars[e.keyCode];
        $('#secret').val(val);
    }); 
});


// Listen for wild flailing punching motions
// but limit the speed at which their sent to
// fake a better user experience
var paused = false;
window.ondevicemotion = function(e){
    if(e.acceleration.x > 10 && paused == false){
        socket.emit('punch', { intensity : e.acceleration.x });
        paused = true;
        setTimeout(function(){
            paused = false;
        }, 300);
    }
};


socket.on('restart', function(data){
    location.reload();
});