angular.module('gb.resources')
.factory('Journal', ['$resource',
function($resource) {
    return $resource('https://api.ginsberg.io/v1/o/events/:id', {id: '@id'},
    {
        query: {method: 'GET', isArray: true },
        save: {method: 'POST', isArray: false },
        delete: {method: 'DELETE', params: {id: "@id"} }
    });
}]);
