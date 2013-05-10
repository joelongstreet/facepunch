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

    // Play a random punching noise
    var rando = Math.floor(Math.random()*8) + 1
    var audio = $('#sound_' + rando);
    audio[0].play();

    // How strange are you?
    $('#count').text(count++);
});


// Set up a new file reader to react to the dragged imagery
var fileReader      = new FileReader()
fileReader.onload   = function(e){
    var image = '<img src="' + e.target.result + '" alt="Face" />';
    $('#victim').empty();
    $('#victim').append(image);
};


$(function(){
    // Prevents the page from navigating to the image
    $('#victim')[0].addEventListener('dragover', function(e){
        e.preventDefault();
    });

    // React to dragged imagery
    $('#victim')[0].addEventListener('drop', function(e){
        e.preventDefault();
        fileReader.readAsDataURL(e.dataTransfer.files[0])
    }, false);

    // Pair the broadcast client with the server
    // this timeout has got to go, i would think there should be a ready event?
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