snmApp.controller('compareController', function($rootScope, $scope, $route, $http, cookieFactory) {
    $rootScope.currentView = $route.current.view;
    let query = './api/schools/compare?'
    $rootScope.schoolsToCompare.forEach((school, index) => {
        query += 'code=' + school.code;
        if (index < $rootScope.schoolsToCompare.length - 1) query += '&';
    });
    $http.get(query)
        .then(function(response) {
            $scope.schools = response.data;
            $('#snm-school-compare-loading').hide();
        }, function(error) {
            console.log(error);
        });

    $scope.removeSchool = (school) => {
        $scope.schools.splice($scope.schools.indexOf(school), 1);
        $rootScope.removeComparing(school);
    };
});
