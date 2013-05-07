var socket = io.connect('/');

$(function(){

    $('#start').click(function(){
        $.ajax({
            type    : 'GET',
            url     : 'broadcast/send',
            data    : {
                broadcastId : socket.socket.sessionid,
                secret      : $('#secret').text().trim()
            }, success : function(data){
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

});

window.addEventListener('shake', function(e){
    socket.emit('punch', { intensity : e.intensity });
}, false);