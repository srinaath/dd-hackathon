var map, mapGeoLocation;
function initialize() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                $('#hdnzoom').val('10');
                initializaMap(position.coords.latitude, position.coords.longitude, 20, 10, null);               
            },
            function () { alert('Browser does not support geo location'); });
    }
}



//page initialize method
google.maps.event.addDomListener(window, 'load', initialize);
//private methods
function updateGeoLocation(circle) {
    var radius = circle.getRadius() / 1600;
    var center = circle.getCenter().lat() + "," + circle.getCenter().lng();
    $('#txtGeoCode').val(center + "," + radius + 'mi');
}
//seach twitter
function searchTwitter() {
    var search = $('#txtSearch').val();
    var geocode = $('#txtGeoCode').val();
    $('#error').html('');
    if (!search || 0 == search.length) {
        $('#error').html('Enter search text');
        return;
    }
    //make a reuest query
    var url = 'http://localhost:8080/api/GetTweets';

    var mapGeoLocation = $('#txtGeoCode').val().split(',');
    var lat = mapGeoLocation[0];
    var lon = mapGeoLocation[1];

    url += "/" + search + "/" + lat + "/" + lon + "/"+mapGeoLocation[2];
    //ajax call
    $.get(url, function (data, status) {
        pinTweetToMap(data);
    });
}

//add marker to google map
function pinTweetToMap(data) {
    var mapGeoLocation = $('#txtGeoCode').val().split(',');
    var lat = mapGeoLocation[0];
    var lon = mapGeoLocation[1];
    var radius = mapGeoLocation[2].replace("mi", "");

    initializaMap(lat, lon, radius, parseInt($('#hdnzoom').val()), data);
}
///initialize google map
function initializaMap(lat, lon, radius, zoom, data) {
    var maploc = lat + "," + lon + "," + radius + "mi";
    $('#txtGeoCode').val(maploc);
    var mapOptions = {
        center: new google.maps.LatLng(lat, lon),
        zoom: zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    var circleOptions = {
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        draggable: true,
        editable: true,
        strokeWeight: 2,
        fillColor: '#FFFFF',
        fillOpacity: 0.0,
        map: map,
        center: new google.maps.LatLng(lat, lon),
        radius: radius * 1600,

    };
    // Add the circle for this city to the map.
    searchCircle = new google.maps.Circle(circleOptions);
    //circle cjhanges
    google.maps.event.addListener(searchCircle, 'radius_changed', function () {
        updateGeoLocation(searchCircle);
    });
    //circle center
    google.maps.event.addListener(searchCircle, 'center_changed', function () {
        updateGeoLocation(searchCircle);
    });
    //
    google.maps.event.addListener(searchCircle, 'dragend', function () {
        updateGeoLocation(searchCircle);
    });

    google.maps.event.addListener(map, 'zoom_changed', function () {
        var z = map.getZoom();
        $('#hdnzoom').val(z);
    });

    if (data) {

        var nonGeohtml = "";
        var alt = false;
        console.log(data);
        $.each(data.statuses, function (id, obj) {
            if ((obj.geo.coordinates[0] != 0 && obj.geo.coordinates[1] != 0) && (obj.geo.coordinates[0] != lat && obj.geo.coordinates[1] != lon)) {
                var contentString = "";
                try {

                    contentString += '<div style="height:120px;" class="content span3">';
                    contentString += '<div class="stream-item-header">';
                    contentString += '&nbsp;&nbsp;<a class="account-group js-account-group js-action-profile js-user-profile-link js-nav" target="_blank" href="https://twitter.com/#!/twitter/status/' + obj.user.id + '" data-user-id="' + obj.user.id + '">';
                    contentString += '<img class="avatar js-action-profile-avatar" src="' + obj.user.profile_image_url + '" alt="">';
                    contentString += '<strong class="fullname js-action-profile-name show-popup-with-id">' + obj.user.name + '</strong>';

                    contentString += '</a>';
                    contentString += '<span>&nbsp;&nbsp;&nbsp;&nbsp;</span><a class="account-group js-account-group js-action-profile js-user-profile-link js-nav" target="_blank" href="https://twitter.com/' + obj.user.screen_name + '" data-user-id="' + obj.user.id + '"><span class="username js-action-profile-name">@<b>' + obj.user.screen_name + '</b></span></a>';
                    contentString += '</div>';
                    contentString += '<p class="js-tweet-text tweet-text">' + generateHtml(obj.text) + '</p>';
                    contentString += '<span class="metadata"><span>' + obj.created_at + '</span>';
                    contentString += '</span></div>';
                } catch (ex) { }
                AddMarker(obj.geo.coordinates[0], obj.geo.coordinates[1], contentString, map, 'Tweet from @' + obj.user.screen_name, 'img/Twitter_logo_blue.png');
            } else {
                try {

                    nonGeohtml += '<div style="height:120px;'
                    if (alt) {
                        nonGeohtml += 'background-color: #efefef;';
                        alt = false;
                    } else { alt = true; }
                    nonGeohtml += '" class="content span3">';
                    nonGeohtml += '<div class="stream-item-header">';
                    nonGeohtml += '&nbsp;&nbsp;<a class="account-group js-account-group js-action-profile js-user-profile-link js-nav" target="_blank" href="https://twitter.com/#!/twitter/status/' + obj.StatusID + '" data-user-id="' + obj.User.Identifier.ID + '">';
                    nonGeohtml += '<img class="avatar js-action-profile-avatar" src="' + obj.User.ProfileImageUrl + '" alt="">';
                    nonGeohtml += '<strong class="fullname js-action-profile-name show-popup-with-id">' + obj.User.Name + '</strong>';

                    nonGeohtml += '</a>';
                    nonGeohtml += '<span>&nbsp;&nbsp;&nbsp;&nbsp;</span><a class="account-group js-account-group js-action-profile js-user-profile-link js-nav" target="_blank" href="https://twitter.com/' + obj.User.Identifier.ScreenName + '" data-user-id="' + obj.User.Identifier.ID + '"><span class="username js-action-profile-name">@<b>' + obj.User.Identifier.ScreenName + '</b></span></a>';
                    nonGeohtml += '</div>';
                    nonGeohtml += '<p class="js-tweet-text tweet-text">' + generateHtml(obj.Text) + '</p>';
                    nonGeohtml += '<span class="metadata"><span>' + obj.CreatedAt + '</span>';
                    nonGeohtml += '</span></div>';
                } catch (ex) { }
            }
        });
        //add a marker for themap
        if (nonGeohtml != "") {
            var html = '<div>' + nonGeohtml + '</div>';
            AddMarker(lat, lon, html, map, 'Tweets from users with geo location disabled.', 'img/Twitter_logo_red.png');
        }
    }

    //page initialize method
    google.maps.event.addDomListener(window, 'load', initialize);
     var geocoder = new google.maps.Geocoder();

     $('#go').click(function(){
                        var address =$('#navigateTo').val();
                            geocoder.geocode({'address': address}, function(results, status) {
                            if (status === google.maps.GeocoderStatus.OK) {
                              map.setCenter(results[0].geometry.location);
                            } else {
                              alert('Geocode was not successful for the following reason: ' + status);
                            }
                          });
                    });
}

//add marker to the map
function AddMarker(lat, lon, html, map, txt, image) {
    var myLatlng = new google.maps.LatLng(lat, lon);
    var mapOptions = {
        zoom: 4,
        center: myLatlng
    }

    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        icon: image,
        title: txt
    });
    var infowindow = new google.maps.InfoWindow({
        content: html
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
    });
}

//generate html is there is link
function generateHtml(text) {
    var urls = text.split('http://');
    var html = "";
    var startsWith = false;
    if (text.indexOf('http://') == 0) {
        startsWith = true;
    }
    for (var i = 0; i < urls.length; i++) {
        if (i == 0) {
            if (startsWith)
                html += generateATag(urls[i]);
            else
                html += urls[i];
        } else {
            html += generateATag(urls[i]);
        }

    }
    return html;
}

//generate html tag
function generateATag(text)
{
    var idx = text.indexOf(' ');
    if (idx == -1) {
        return  '<a target="_blank" href="http://' + text + '">' + text+ '</a>';
    } else {
        var atag = '<a target="_blank" href="http://' + text.substring(0, idx) + '">' + text.substring(0, idx) + '</a>';
        atag += text.substring(idx);
        return atag;
    }
}




