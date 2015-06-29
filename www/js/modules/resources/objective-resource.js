angular.module('gb.resources')
.factory('Objective', ['$resource',
function($resource) {
    return $resource('https://api.ginsberg.io/v1/o/:objective/:id?', {objective:'@objective',id:'@id'}, {
        query: {method: 'GET', isArray: true },
        save: {method: 'POST', isArray: false },
        delete: {method: 'DELETE', params: {id: "@id"} }
    });
}]);
