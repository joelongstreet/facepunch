var socket = io.connect('/');

socket.on('punch', function(data){
    var threshold   = 100;
    var intensity   = Math.round(data.intensity/threshold);
    $('body').addClass('hit_' + intensity);
});