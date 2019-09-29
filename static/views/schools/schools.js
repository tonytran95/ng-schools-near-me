snmApp.factory('schoolsFactory', function() {
    const schoolsState = {};

    schoolsState.schoolsList = [];
    schoolsState.search = {};
    schoolsState.limit = 20;

    return schoolsState;
});

snmApp.controller('schoolsController', function($rootScope, $scope, $route, $http, $filter, schoolsFactory, cookieFactory) {
    $rootScope.currentView = $route.current.view;
    $scope.schoolsList = schoolsFactory.schoolsList;
    $scope.search = schoolsFactory.search;
    $scope.limit = schoolsFactory.limit;

    if ($scope.schoolsList.length === 0) {
        $http.get('./api/schools/all')
            .then(function (response) {
                $scope.schoolsList = response.data;
                $scope.filtered = $scope.schoolsList;
                $scope.totalSchools = $scope.schoolsList.length;
                $scope.limit = 20;
                schoolsFactory.schoolsList = $scope.schoolsList;
                $('#snm-school-list-loading').hide();
            }, function (error) {
                console.log(error);
            });
    } else {
        $scope.filtered = $scope.schoolsList;
        $scope.totalSchools = $scope.schoolsList.length;
        $('#snm-school-list-loading').hide();
    }

    $scope.$watch('search', function (search) {
        schoolsFactory.search = search;
        if (search) {
            $scope.filtered = $scope.schoolsList;
            Object.keys(search).forEach((filter) => {
                if (search[filter]) {
                    if (filter !== "text") {
                        $scope.filtered = $scope.filtered.filter((school) => {
                            if (school[filter] === search[filter]) return true;
                        });
                    } else {
                        $scope.filtered = $filter('filter')($scope.filtered, search[filter]);
                    }
                }
            });
            $scope.totalSchools = $scope.filtered.length;
            if ($scope.totalSchools < 20 || $scope.totalSchools < $scope.limit) {
                $scope.limit = $scope.totalSchools;
            } else if ($scope.totalSchools >= 20 && $scope.limit < 20) {
                $scope.limit = 20;
            }
        }
    }, true);

    $scope.$watch('limit', function(limit) {
        schoolsFactory.limit = limit;
    });

    $scope.increaseLimit = () => {
        $scope.limit += 20;
        if ($scope.limit > $scope.totalSchools) {
            $scope.limit = $scope.totalSchools;
        }
    };

    $scope.noLimit = () => {
        $scope.limit = $scope.totalSchools;
    };

    window.onresize = null;
});
