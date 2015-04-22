angular.module('gb.resources')
.factory('Profile', ['$resource',
function($resource) {
    return $resource('https://api.ginsberg.io/v1/me', {},
    {
        query: {method: 'GET', isArray: false },
        save: {method: 'POST', isArray: false },
        delete: {method: 'DELETE', params: {id: "@id"} }
    });
}]);
