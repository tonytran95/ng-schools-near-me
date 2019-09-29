snmApp.factory('mapFactory', function() {
    const mapState = {};

    mapState.data = {};
    mapState.schools = [];
    mapState.center = {lat: -33.8682894, lng: 151.2086763};
    mapState.zoom = 11;
    mapState.marker;
    mapState.searchCircle;
    mapState.resultsCircle;
    mapState.place;

    return mapState;
});

snmApp.controller('mapController', function($rootScope, $scope, $route, $compile, mapFactory, cookieFactory) {
    $rootScope.currentView = $route.current.view;
    $scope.data = mapFactory.data;
    $scope.schools = mapFactory.schools;
    $scope.markers = [];

    const clearMap = () => {
        $scope.schools = [];
        mapFactory.schools = [];
        for (let i = 0; i < $scope.markers.length; i++) {
            $scope.markers[i].setMap(null);
        }
        $scope.markers = [];
        $scope.resultsCircle.setRadius(0);
    };

    const createMarker = (school, index) => {
        const infowindow = new google.maps.InfoWindow();
        const temp_marker = new google.maps.Marker({
            map: $scope.map,
            position: {lat: school['latitude'], lng: school['longitude']},
            infowindow: infowindow,
            icon: "static/img/marker.png"
        });
        const infowindowDiv = document.createElement('div');
        infowindowDiv.style.textAlign = 'center';
        const schoolLogo = document.createElement('img');
        schoolLogo.src = school.logo;
        schoolLogo.style.height = '75px';
        const schoolHeading = document.createElement('h6');
        schoolHeading.style.paddingTop = '10px';
        schoolHeading.textContent = school.name;
        const profileButton = document.createElement('a');
        profileButton.classList.add('btn', 'btn-primary');
        profileButton.href = '#schools/' + school.code;
        profileButton.style.margin = '5px';
        profileButton.textContent = 'Profile';
        const compareButtonActive = '<a ng-if="!checkComparing(' + index + ')" class="btn btn-primary" ng-click="addToComparing(' + index + ')" href="javascript:void(0);"><i class="fas fa-bookmark"></i> Compare</a>';
        const compareButtonInactive = '<a ng-if="checkComparing(' + index + ')" class="btn btn-danger" ng-click="removeFromComparing(' + index + ')" href="javascript:void(0);"><i class="fas fa-bookmark"></i> Compare</a>';
        const compiledButtonActive = $compile(compareButtonActive)($scope);
        const compiledButtonInactive = $compile(compareButtonInactive)($scope);
        infowindowDiv.appendChild(schoolLogo);
        infowindowDiv.appendChild(schoolHeading);
        infowindowDiv.appendChild(profileButton);
        infowindowDiv.appendChild(compiledButtonActive[0]);
        infowindowDiv.appendChild(compiledButtonInactive[0]);
        temp_marker.addListener('click', () => {
            for (let i = 0; i < $scope.markers.length; i++) {
                $scope.markers[i].infowindow.close();
            }
            infowindow.setContent(infowindowDiv);
            infowindow.open($scope.map, temp_marker);
        });
        $scope.markers.push(temp_marker);
    }

    const getFiltersQuery = () => {
        const query = [];
        query.push('&distance=' + (document.getElementById('filter-distance').value * 1000))
        query.push('enrolments=' + document.getElementById('filter-enrolments').value);
        if ($scope.data.level) query.push('level=' + $scope.data.level);
        if (!document.getElementById('filter-gender').disabled && $scope.data.gender) query.push('gender=' + $scope.data.gender);
        if (!document.getElementById('filter-selective').disabled && $scope.data.selective) query.push('selective=' + $scope.data.selective);
        if ($scope.data.train_station_checked) query.push('train_duration=' + ($scope.data.train_station_duration * 60));
        if (!document.getElementById('opportunity-classes-checkbox').disabled && $scope.data.opportunity_classes) query.push('opportunity_classes=' + $scope.data.opportunity_classes);
        if ($scope.data.preschool) query.push('preschool=' + $scope.data.preschool);
        if ($scope.data.late_opening) query.push('late_opening=' + $scope.data.late_opening);
        if ($scope.data.intensive_english_centre) query.push('intensive_english_centre=' + $scope.data.intensive_english_centre);
        if ($scope.data.healthy_canteen) query.push('healthy_canteen=' + $scope.data.healthy_canteen);
        if ($scope.data.support_classes_checked) {
            if ($scope.data.support_classes_selected) {
                query.push('support_classes=' + $scope.data.support_classes_selected);
            } else {
                query.push('support_classes=ALL');
            }
        }
        return query.join('&');
    };

    $scope.$watch('data', function (data) {
        mapFactory.data = data;
        if (data)
            $scope.searchCircle.setRadius(data.distance * 1000);
    }, true);

    $scope.map = new google.maps.Map(document.getElementById('map'), {
        center: mapFactory.center,
        zoom: mapFactory.zoom,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        styles: [
            {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "poi",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            }
        ]
    });
    $scope.map.addListener('click', () => {
        for (let i = 0; i < $scope.markers.length; i++) {
            $scope.markers[i].infowindow.close();
        }
    });

    if (!mapFactory.marker) {
        $scope.marker = new google.maps.Marker({
            map: $scope.map,
            position: $scope.map.center,
            label: 'H',
            visible: false
        });
    } else {
        $scope.marker = mapFactory.marker;
        $scope.marker.setMap($scope.map);
    }

    if (!mapFactory.searchCircle) {
        $scope.searchCircle = new google.maps.Circle({
            map: $scope.map,
            radius: (document.getElementById('filter-distance').value * 1000),
            fillColor: '#427CD1',
            fillOpacity: 0.15,
            strokeColor: '#444444',
            strokeWeight: 0.2,
            clickable: false
        });
    } else {
        $scope.searchCircle = mapFactory.searchCircle;
        $scope.searchCircle.setMap($scope.map);
    }

    if (!mapFactory.resultsCircle) {
        $scope.resultsCircle = new google.maps.Circle({
            map: $scope.map,
            radius: 0,
            fillColor: '#427CD1',
            fillOpacity: 0.15,
            strokeColor: '#444444',
            strokeWeight: 0.2,
            clickable: false
        });
        $scope.resultsCircle.bindTo('center', $scope.marker, 'position');
    } else {
        $scope.resultsCircle = mapFactory.resultsCircle;
        $scope.resultsCircle.setMap($scope.map);
        $scope.resultsCircle.bindTo('center', $scope.marker, 'position');
    }

    if (mapFactory.schools.length > 0) {
        mapFactory.schools.forEach((school) => {
            createMarker(school, mapFactory.schools.indexOf(school));
        });
    }

    $scope.autocomplete = new google.maps.places.Autocomplete(document.getElementById('snm-search-bar'));
    $scope.autocomplete.setFields(['geometry']);
    $scope.autocomplete.bindTo('bounds', $scope.map);
    $scope.autocomplete.addListener('place_changed', () => {
        clearMap();
        const place = $scope.autocomplete.getPlace();
        $scope.marker.setPosition(place.geometry.location);
        $scope.marker.setVisible(true);
        $scope.searchCircle.bindTo('center', $scope.marker, 'position');
        $scope.map.panTo(place.geometry.location);
        $scope.map.fitBounds($scope.searchCircle.getBounds());
        $('#snm-filter-list-collapse').collapse('show');
        $('#snm-filter-backdrop-collapse').collapse('show');
        mapFactory.marker = $scope.marker;
        mapFactory.searchCircle = $scope.searchCircle;
        mapFactory.place = place;
        mapFactory.data.text = document.getElementById('snm-search-bar').value;
    });

    $scope.map.addListener('center_changed', () => {
        mapFactory.center = $scope.map.getCenter();
    });

    $scope.map.addListener('zoom_changed', () => {
        mapFactory.zoom = $scope.map.getZoom();
    })

    $scope.addToComparing = (index) => {
        $rootScope.addComparing($scope.schools[index]);
    }

    $scope.removeFromComparing = (index) => {
        $rootScope.removeComparing($scope.schools[index]);
    }

    $scope.checkComparing = (index) => {
        if ($scope.schools[index])
            return $rootScope.isComparing($scope.schools[index]);
        return false;
    };

    $scope.search = () => {
        if (mapFactory.place) $scope.autocomplete.set('place', mapFactory.place);
        let found = false;
        const place = $scope.autocomplete.getPlace();
        if (place == null) {
            alert("Please enter your address first!");
            return;
        } else if (document.getElementById('filter-distance').value == 0) {
            alert("Please increase the search radius!");
            return;
        }
        const button = document.getElementById('snm-search-button');
        button.innerHTML = "<span class=\"spinner-border spinner-border-sm\" role=\"status\"></span>";
        button.setAttribute("disabled", true);
        fetch('./api/schools?longitude=' + place.geometry.location.lng() + '&latitude=' + place.geometry.location.lat()
            + getFiltersQuery())
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            clearMap();
            if (data.length == 0) {
                alert("We couldn't find any schools that matched your criteria!");
            } else {
                found = true;
                $scope.resultsCircle.setRadius((document.getElementById('filter-distance').value * 1000));
                data.forEach((school, index) => {
                    createMarker(school, index);
                    $scope.schools.push(school);
                });
            }
        })
        .then(() => {
            $scope.map.panTo(place.geometry.location);
            $scope.map.fitBounds($scope.searchCircle.getBounds());
            if (found && document.getElementById('snm-filter-list-collapse').className.split(" ").indexOf("show") > -1) {
                $('#snm-filter-backdrop-collapse').collapse('hide');
                $('#snm-filter-list-collapse').collapse('hide');
            }
            button.removeAttribute("disabled");
            button.innerText = "Search";
            $scope.$apply();
            mapFactory.schools = $scope.schools;
            mapFactory.markers = $scope.markers;
        });
    };

    window.onresize = null;
});
