const snmApp = angular.module('snmApp', ['ngRoute', 'ngCookies']);

snmApp.config(($routeProvider, $locationProvider) => {
    $routeProvider
        .when('/',
            {
                controller: 'mapController',
                templateUrl: 'static/views/map/map.html',
                view: 'map'
            })
        .when('/schools',
            {
                controller: 'schoolsController',
                templateUrl: 'static/views/schools/schools.html',
                view: 'schools'
            })
        .when('/schools/:schoolCode',
            {
                controller: 'profileController',
                templateUrl: 'static/views/profile/profile.html',
                view: 'profile'
            })
        .when('/compare',
            {
                controller: 'compareController',
                templateUrl: 'static/views/compare/compare.html',
                view: 'compare'
            })
        .otherwise({ redirectTo: '/' });
    $locationProvider.hashPrefix('');
});

snmApp.factory('cookieFactory', function($rootScope, $cookies, $filter) {
    const factory = {};

    factory.loadCookies = () => {
        $rootScope.schoolsToCompare = [];
        const cookies = $cookies.get('schools');
        if (cookies) {
            $rootScope.schoolsToCompare = JSON.parse($cookies.get('schools'));
        }
    };

    factory.saveCookies = () => {
        const schools = [];
        $rootScope.schoolsToCompare.forEach((school) => schools.push(school));
        $cookies.put('schools', JSON.stringify(schools));
    };

    $rootScope.isComparing = (school) => {
        const filtered = $filter('filter')($rootScope.schoolsToCompare, { code: school.code }, true);
        return filtered.length > 0;
    };

    $rootScope.addComparing = (school) => {
        $rootScope.schoolsToCompare.push({
            'code': school.code,
            'name': school.name
        });
        factory.saveCookies();
    };

    $rootScope.removeComparing = (school) => {
        $rootScope.schoolsToCompare.forEach((tempSchool) => {
            if (tempSchool.code === school.code) {
                $rootScope.schoolsToCompare.splice($rootScope.schoolsToCompare.indexOf(tempSchool), 1);
            }
        });
        factory.saveCookies();
    };

    factory.loadCookies();
    return factory;
});
