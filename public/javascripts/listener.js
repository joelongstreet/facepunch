var socket = io.connect('/');
var count  = 1;

socket.on('punch', function(data){
    // We're expecting a number roughly between 10 and 20ish
    // Normalizing value to be between 1 and 5 for easy css application
    var intensity = Math.round((data.intensity - 10)/2)
    if(intensity > 5) { intensity = 5 }
    if(intensity < 1) { intensity = 1 }

    // CSS class toggling
    var klass = 'hit_' + intensity;
    $('body').addClass(klass);
    setTimeout(function(){
        $('body').removeClass(klass);
    }, 150);

    // How strange are you?
    $('#count').text(count++);
});


$(function(){
    // Set up a draggable spot to place images
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