var socket = io.connect('/');

socket.on('punch', function(data){
    var threshold   = 100;
    var intensity   = Math.round(data.intensity/threshold);
    $('body').addClass('hit_' + intensity);
});

$(function(){
    $('#victim').dropzone({
        url : '/trash',
        thumbnailWidth : 500,
        thumbnailHeight : 500
    });

    // Pair the broadcast client with the server
    // this timeout has got to go, i would thinkg there should be a ready event?
    setTimeout(function(){
        $.ajax({
            type    : 'GET',
            url     : '/listener/setSocketId/' + socket.socket.sessionid + '/' + $('#code').text().trim(),
            success : function(data){
                console.log(data);
            },
            error   : function(err){
                alert('Some error occured, refresh your browser and try this again');
            }
        });
    }, 500);
});