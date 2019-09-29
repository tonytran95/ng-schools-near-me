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

    $scope.$watch('schoolsToCompare', function(schools) {
        if ($scope.schools) {
            const schoolsLength = $scope.schools.length;
            for (let i = 0; i < schoolsLength; i++) {
                let found = false;
                const tempLength = schools.length;
                for (let j = 0; j < tempLength; j++) {
                    if ($scope.schools[i].code === schools[j].code) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    $scope.schools.splice(i, 1);
                    break;
                }
            }
        }
    }, true);
});
