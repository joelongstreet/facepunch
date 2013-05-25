// If not registered via facebook, force an authentication
// Then get all their friends and naked pictures
$(function(){
    $('#facebook-kinect').click(function(e){
        FB.getLoginStatus(function(response) {
            if(response.status != 'connected'){
                FB.login(function(res){
                    FB.api('/me/friends?fields=name,picture', function(resp){
                        buildFriendSelector(resp.data);
                    });
                });
            } else{
                FB.api('/me/friends?fields=name,picture', function(res){
                    buildFriendSelector(res.data);
                });

                $('#friend-picker').modal()
            }
        });
    });
});


// Set up Facebook API
window.fbAsyncInit = function(){
    FB.init({
        appId  : 213385565452548,
        status : true
    });
};


var buildFriendSelector = function(friends){

    // Set up the template for the modal body
    var selector_template = $(
        '<div id="friend_selector">' +
            '<form class="form-horizontal">' +
                '<input type="text" id="friend-email" placeholder="Friend Name" />' +
            '</form>' +
            '<div id="friends"></div>' +
        '</div>');

    // Build friend items from friend list
    // and append to the above template
    var friends_names = [];
    for(var key in friends){
        friends_names.push(friends[key].name);
        var friend_template =
            '<li class="friend">' +
                '<img src="' + friends[key].picture.data.url + '" alt="' + friends[key].name + ' "title=' + friends[key].name + '" />' +
                '<h4>' + friends[key].name + '</h4>' +
            '</li>';
        selector_template.find('#friends').append(friend_template);
    };

    // Rebuild the modal and append all your favorite friends
    $('#friend-picker').find('.modal-body').empty()
    $('#friend-picker').find('.modal-body').append(selector_template);

    // Utility to find a friend by their name
    var findFriendByName = function(name){
        for(var key in friends){
            if(friends[key].name == name){
                return friends[key];
            }
        }
    };

    // Reach out to my server and get the large version of the profile picture
    var requestFacebookPhoto = function(id, next){
        var earl = '/getFBPhotoURL/' + id;
        $.ajax({
            url         : earl,
            type        : 'GET',
            success     : function(data){
                if(next){ next(data.url); }
            },
            error       : function(err){
                alert('Couldn\'t Get that Facebook Photo :(');
            }
        });
    };

    // Some schweet animations when appending new items to the stage
    var addFBVictimToStageByName = function(name){
        var friend = findFriendByName(name);
        $('#victim').find('.img').fadeOut();
        requestFacebookPhoto(friend.id, function(src){
            $('#victim').find('.img').fadeIn();
            $('#victim').find('.img').css('background-image', 'url(' + src + ')');
        });
        $('#friend-picker').modal('hide');
    }

    // When clicking on a friend from the friend-picker
    // put their photo on the stage
    $('#friend-picker').find('li.friend').click(function(){
        addFBVictimToStageByName($(this).text());
    });

    // Create a bootstrap typeahead, when a friend is selected
    // put their photo on the stage
    $('#friend-picker').find('input').typeahead({
        source  : friends_names,
        updater : function(item){
            addFBVictimToStageByName(item);
        }
    });
};