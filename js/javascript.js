$(document).ready(function() {

});

// IEFE is used to avoid global variables webapp-164120
(function(){

    var fromSearchBox,
        toSearchBox,
        addressFrom,
        addressTo,
        locationFrom,
        locationTo,
        directionsService,
        directionsDisplay;

    /**
     * adds event listeners for "Get price" and "Enter again" buttons
     */
    function addEventListeners() {
        document.getElementById('get_price').addEventListener('click', handleFormProceed);
        document.getElementById('anchor_to_reset_form').addEventListener('click', handleFormReset)
    }

    /**
     * add an autocomplete functionality to from and to input fields
     */
    function initSearchBoxes() {
        fromSearchBox = new google.maps.places.SearchBox(document.getElementById('frommapsearch'));
        toSearchBox = new google.maps.places.SearchBox(document.getElementById('tomapsearch'));
    }

    /**
     * gets the values from search fields and get the coordinates for them using Geocoder
     * calls showMap when that is done
     */
    function handleFormProceed() {
        // create a new Geocoder object
        var geocoder = new google.maps.Geocoder();

        // getting the from and to addresses
        addressFrom = document.getElementById("frommapsearch").value;
        addressTo = document.getElementById("tomapsearch").value;

        // finding out the coordinates
        if (geocoder) {
            geocoder.geocode({'address': addressFrom}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    //location of first address (latitude + longitude)
                    locationFrom = results[0].geometry.location;
                    geocoder.geocode({'address': addressTo}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            //location of second address (latitude + longitude)
                            locationTo = results[0].geometry.location;
                            // calling the showMap() function to create and show the map
                            showMap();
                        } else {
                            alert("Geocode was not successful for the following reason: " + status);
                        }
                    });
                } else {
                    alert("Geocode was not successful for the following reason: " + status);
                }
            });
        }
    }

    /**
     * shows the maps and markers based on the location of the inputted addresses
     * adds event listeners for when map is clicked in which case shows a info window with address information
     * and for when marker is dragged to another location in which case should redraw the route
     * calls drawRoutes
     */
    function showMap() {
        // center of the map (compute the mean value between the two locations)
        latlng = new google.maps.LatLng((locationFrom.lat() + locationTo.lat()) / 2, (locationFrom.lng() + locationTo.lng()) / 2);

        // get the map type value from the hidden field
        var maptype = document.getElementById("maptype").value;

        var typeId;

        if (maptype == "roadmap")
            typeId = google.maps.MapTypeId.ROADMAP;
        else if (maptype == "hybrid")
            typeId = google.maps.MapTypeId.HYBRID;
        else if (maptype == "satellite")
            typeId = google.maps.MapTypeId.SATELLITE;
        else if (maptype == "terrain")
            typeId = google.maps.MapTypeId.TERRAIN;

        // set map options
        // set zoom level
        // set center
        // map type
        var mapOptions =
        {
            zoom: 50,
            center: latlng,
            mapTypeId: typeId
        };

        // create a new map object
        // set the div id where it will be shown
        // set the map options
        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

        // event listener to update the map type
        google.maps.event.addListener(map, 'maptypeid_changed', function () {
            maptype = map.getMapTypeId();
            document.getElementById('maptype').value = maptype;
        });

        // custom marker
        var rabbit = new google.maps.MarkerImage('https://earthday.ca/wp-content/uploads/2016/02/cdiAE.png');

        // create the markers for the two locations
        var marker1 = new google.maps.Marker({
            map: map,
            position: locationFrom,
            title: "First location",
            icon: rabbit,
            draggable: true
        });

        var marker2 = new google.maps.Marker({
            map: map,
            position: locationTo,
            title: "Second location",
            icon: rabbit,
            draggable: true
        });

        // create the text to be shown in the infowindows
        var text1 = '<div id="content">' +
            '<h4 id="firstHeading">First location</h4>' +
            '<div id="bodyContent">' +
            '<p>Address: ' + addressFrom + '</p>' +
            '</div>' +
            '</div>';

        var text2 = '<div id="content">' +
            '<h4 id="firstHeading">Second location</h4>' +
            '<div id="bodyContent">' +
            '<p>Address: ' + addressTo + '</p>' +
            '</div>' +
            '</div>';

        // create info boxes for the two markers
        infowindow1 = new google.maps.InfoWindow({
            content: text1
        });
        infowindow2 = new google.maps.InfoWindow({
            content: text2
        });

        // add action events so the info windows will be shown when the marker is clicked
        google.maps.event.addListener(marker1, 'click', function () {
            infowindow1.open(map, marker1);
        });
        google.maps.event.addListener(marker2, 'click', function () {
            infowindow2.open(map, marker2);
        });

        // add action events for dragging the markers
        google.maps.event.addListener(marker1, 'dragend', function () {
            location1 = marker1.getPosition();
            drawRoutes(locationFrom, locationTo);
        });

        google.maps.event.addListener(marker2, 'dragend', function () {
            location2 = marker2.getPosition();
            drawRoutes(locationFrom, locationTo);
        });

        // initialize directions service
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            suppressInfoWindows: true
        });

        directionsDisplay.setMap(map);

        drawRoutes(locationFrom, locationTo);
    }

    /**
     * get the exact addresses based on the lat/long data
     * update the view with those addresses
     */
    function drawRoutes(locationFrom, locationTo) {
        geocoder = new google.maps.Geocoder(); // creating a new geocode object

        if (geocoder) {
            geocoder.geocode({'latLng': locationFrom}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        addressFrom = results[0].formatted_address;
                    }
                    geocoder.geocode({'latLng': locationTo}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                addressTo = results[0].formatted_address;
                            }
                            updateAddresses(addressFrom, addressTo);
                            continueShowRoute(locationFrom, locationTo);
                        }
                        else {
                            alert("Geocoder failed due to: " + status);
                        }
                    });
                }
                else {
                    alert("Geocoder failed due to: " + status);
                }
            });
        }
    }

    /**
     * draw the route based on the new locations and show the info to the user
     */
    function continueShowRoute(locationFrom, locationTo) {

        // get the selected travel mode
        var travel = google.maps.DirectionsTravelMode.DRIVING;

        var request = {
            origin: locationFrom,
            destination: locationTo,
            travelMode: travel,
            unitSystem: google.maps.UnitSystem.IMPERIAL
        };
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                distance = response.routes[0].legs[0].distance.text;
                var time = response.routes[0].legs[0].duration.text;

                document.getElementById("distance_road").innerHTML = "" + distance;

                if (distance.indexOf('km') > -1) {

                    var price = distance.replace(' km', '');

                    console.log("km price = " + price);
                    price = (price * 2);


                    document.getElementById("price").innerHTML = "&#163;" + price.toFixed(2);


                } else if (distance.indexOf('mi') > -1) {

                    var price = distance.replace(' mi', '');

                    console.log("mile price = " + price);
                    price = price * 1.5;


                    document.getElementById("price").innerHTML = "&#163;" + price.toFixed(2);
                    var price = price.toFixed(2);
                    var href = "book_taxi.html?price=" + price + "&from=" + document.getElementById('from_address').innerHTML + "&to=" + document.getElementById('to_address').innerHTML;
                    console.log(href);
                    document.getElementById('anchor_to_book_taxi').setAttribute("href", href);
                }

                document.getElementById("aproximate_time").innerHTML = "" + time;
            }
            else {
                alert('error: ' + status);
            }
        });

        // update text in infowindows
        var text1 = '<div id="content">' +
            '<h1 id="firstHeading">First location</h1>' +
            '<div id="bodyContent">' +
            '<p>Address: ' + address1 + '</p>' +
            '</div>' +
            '</div>';

        var text2 = '<div id="content">' +
            '<h1 id="firstHeading">Second location</h1>' +
            '<div id="bodyContent">' +
            '<p>Address: ' + address2 + '</p>' +
            '</div>' +
            '</div>';

        infowindow1.setContent(text1);
        infowindow2.setContent(text2);
    }

    /**
     * display the addresses in the search fields and info panel
     */
    function updateAddresses(from, to) {
        document.getElementById('from_address').innerHTML = from;
        document.getElementById('to_address').innerHTML = to;
        document.getElementById("frommapsearch").value = from;
        document.getElementById("tomapsearch").value = to;
    }

    /**
     * refresh the page
     */
    function handleFormReset() {
        location.reload();
    }

    /**
     * fires when window "load" event is emmited
     */
    window.onload = function() {
        addEventListeners();
        initSearchBoxes();
    };
})();
