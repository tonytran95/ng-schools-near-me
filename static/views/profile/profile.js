snmApp.controller('profileController', function($rootScope, $scope, $route, $routeParams, $http, cookieFactory) {
    $rootScope.currentView = $route.current.view;
    $http.get('./api/schools/' + $routeParams.schoolCode)
        .then(function(response) {
            $scope.school = response.data;
            google.charts.load("current", {packages:["corechart"]});
            google.charts.setOnLoadCallback(drawCharts);
            drawMap();
            $('#snm-school-profile-loading').hide();
        }, function(error) {
            console.log(error)
        });


    const drawMap = () => {
        const location = {
            lat: $scope.school.location.coordinates[1],
            lng: $scope.school.location.coordinates[0]
        };
        const map = new google.maps.Map(document.getElementById('snm-school-map'), {
            center: location,
            zoom: 16
        });
        const marker = new google.maps.Marker({
            position: location,
            map: map
        });
    }

    const drawCharts = () => {
        let dataIndigenous;
        let dataLBOTE;
        let dataICSEA;
        if ($scope.school.indigenous_pct != -1) {
            dataIndigenous = google.visualization.arrayToDataTable([
                ['Student',                'Percentage'],
                ['Indigenous',           $scope.school.indigenous_pct],
                ['Non-indigenous', 100 - $scope.school.indigenous_pct]
            ]);
        } else {
            dataIndigenous = google.visualization.arrayToDataTable([
                ['Student', 'Percentage'],
                ['No Data',          100]
            ]);
        }
        if ($scope.school.lbote_pct != -1) {
            dataLBOTE = google.visualization.arrayToDataTable([
                ['Student',    'Percentage'],
                ['LBOTE',         $scope.school.lbote_pct],
                ['English', 100 - $scope.school.lbote_pct]
            ]);
        } else {
            dataLBOTE = google.visualization.arrayToDataTable([
                ['Student', 'Percentage'],
                ['No Data',          100]
            ]);
        }
        if ($scope.school.icsea != -1) {
            dataICSEA = google.visualization.arrayToDataTable([
                ['School',                 'ICSEA Value'],
                ['Average',                         1000],
                [$scope.school.name, $scope.school.icsea]
            ]);
        } else {
            dataICSEA = google.visualization.arrayToDataTable([
                ['School', 'ICSEA Value'],
                ['Average',         1000],
                ['No Data',            0]
            ]);
        }
        const optionsIndigenous = {
            height: 275,
            pieHole: 0.4,
            backgroundColor: 'transparent',
            chartArea: {
                left: 60,
                width: '100%',
                height: '85%'
            },
            tooltip: {
                text: 'percentage'
            }
        };
        if ($scope.school.indigenous_pct == -1) {
            optionsIndigenous["colors"] = ["#444"]
        }

        const optionsLBOTE = {
            height: 275,
            pieHole: 0.4,
            backgroundColor: 'transparent',
            chartArea: {
                left: 60,
                width: '100%',
                height: '85%'
            },
            tooltip: {
                text: 'percentage'
            }
        };
        if ($scope.school.lbote_pct == -1) {
            optionsLBOTE["colors"] = ["#444"]
        }

        const optionsICSEA = {
            height: 275,
            backgroundColor: 'transparent',
            legend: {
                position: 'none'
            },
            chartArea: {
                width: '80%',
                height: '80%'
            },
            vAxis: {
                viewWindowMode: 'explicit',
                viewWindow: {
                    min: 500,
                    max: 1300
                },
                gridlines: {
                    count: 8
                }
            }
        }

        const resizeCharts = () => {
            const chartIndigenous = new google.visualization.PieChart(document.getElementById('indigenous-chart'));
            chartIndigenous.draw(dataIndigenous, optionsIndigenous);
            const chartLBOTE = new google.visualization.PieChart(document.getElementById('lbote-chart'));
            chartLBOTE.draw(dataLBOTE, optionsLBOTE);
            const chartICSEA = new google.visualization.ColumnChart(document.getElementById('icsea-chart'));
            chartICSEA.draw(dataICSEA, optionsICSEA);
        }
        resizeCharts();
        window.onresize = resizeCharts;
    };
});
