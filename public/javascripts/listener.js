var socket = io.connect('/');
var count  = 1;
var shares = [
    'I just facepunched someone *** times... it could have been you',
    'My fist hurts after the beating I just gave. *** punches',
    'Just delivered *** knuckle sandwiches to someone\'s face, was it you?',
    'MMA ain\'t got nothin\' on me. *** punches and counting',
    'Face, meet fist. *** punches and I\'m not slowin\' down',
];

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


// Sometimes the phones screen can go to sleep if it doesn't get any action.
// This just forces the page to reload
socket.on('restart', function(data){
    alert('Gah! I lost the connection. Your phone probably went to sleep or you visited another web page. Don\'t worry, I\'m refreshing everything');
    location.reload()
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

    // Share on Twitter
    $('#twitter_share').click(function(e){
        var tweet_earl = 'https://twitter.com/intent/tweet?hashtags=facepunch&original_referer=http://facepunch.jit.su&text=' + generateShare() + '&url=http://facepunch.jit.su';
        popUpWindow(tweet_earl, 'Twitter');
        return false
    });

    // Share on Facebook
    $('#facebook_share').click(function(){
        var fb_earl = 'https://www.facebook.com/sharer/sharer.php?s=100&p[title]=facepunch&p[summary]=' + generateShare() + '&p[url]=http://facepunch.jit.su'
        popUpWindow(fb_earl, 'Facebook');
        return false
    });

    // If not registered via facebook, force an authentication
    // Then get all their friends and naked pictures
    $('#facebook-kinect').click(function(e){
        FB.getLoginStatus(function(response) {
            if(response.status != 'connected'){
                FB.login(function(res){
                    console.log(res);
                });
            } else{
                FB.api('/me/friends?fields=name,picture', function(res){
                    buildFriendSelector(res.data);
                });

                $('#friend-picker').modal()
            }
        });
    });

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


// Set up Facebook API
window.fbAsyncInit = function(){
    FB.init({
        appId  : 213385565452548,
        status : true
    });
};


var buildFriendSelector = function(friends){
    var friends_name  = [];
    var selector_template = $(
        '<div id="friend_selector">' +
            '<form class="form-horizontal">' +
                '<input type="text" id="friend-email" placeholder="Friend Name" />' +
            '</form>' +
            '<div id="friends"></div>' +
        '</div>');

    for(var key in friends){
        friends_name.push(friends[key].name);
        var friend_template =
            '<li class="friend">' +
                '<img src="' + friends[key].picture.data.url + '" alt="' + friends[key].name + ' "title=' + friends[key].name + '" />' +
                '<h4>' + friends[key].name + '</h4>' +
            '</li>';

        selector_template.find('#friends').append(friend_template);
    };

    var findFriendByName = function(name){
        for(var key in friends){
            if(friends[key].name == name){
                return friends[key];
            }
        }
    };

    var requestFacebookPhoto = function(id, next){
        var earl = 'http://graph.facebook.com/' + id + '/picture?type=square'
        $.ajax({
            type    : 'GET',
            url     : earl,
            success : function(data){
                if(next){ next(data); }
            },
            error   : function(err){
                alert('Couldn\'t Get that Facebook Photo :(');
            }
        });
    };

    var addPhotoToDom = function(src){
        $('#victim').html('<img src="' + src + '" />');
    };

    $('#friend-picker').find('.modal-body').empty()
    $('#friend-picker').find('.modal-body').append(selector_template);
    $('#friend-picker').find('li.friend').click(function(){
        var friend = findFriendByName($(this).text());
        addPhotoToDom(friend.picture.data.url);
        requestFacebookPhoto(friend.id, function(src){
            addPhotoToDom(src);
        });
        $('#friend-picker').modal('hide');
    });

    $('#friend-picker').find('input').typeahead({
        source  : friends_name,
        updater : function(item){
            var friend = findFriendByName(item);
            addPhotoToDom(friend.picture.data.url);
            requestFacebookPhoto(friend.id, function(src){
                addPhotoToDom(src);
            });
            $('#friend-picker').modal('hide');
        }
    });
};


// The social popup window for sharing twitter and facebook
var popUpWindow = function(earl, title){
    var left = (window.screen.width / 2) - 260;
    window.open(earl, title, 'height=270, width=500, scrollbars=no, screenX=' + left + ', screenY=100');
};


// Get a random share message
var generateShare = function(){
    var rando = Math.floor(Math.random()*shares.length)
    var item  = shares[rando];
    var text  = item.replace('***', count);

    return text;
};