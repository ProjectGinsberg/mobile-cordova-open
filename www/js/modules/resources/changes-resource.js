angular.module('gb.resources')
.factory('Changes', ['$resource',
function($resource) {
    return $resource('https://sapi.ginsberg.io/v1/useractivitylog', {},
    {
        query: {method: 'GET', isArray: true }
    });
}]);
