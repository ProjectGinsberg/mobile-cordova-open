angular.module('gb.resources')
.factory('Wellbeing', ['$resource',
function($resource) {
    return $resource('https://sapi.ginsberg.io/v1/wellbeing/:id?', {id:'@id'},
    {
        query:  {method: 'GET', isArray: true },
        save:   {method: 'POST', isArray: false },
        update: {method: 'POST', url:'https://sapi.ginsberg.io/v1/wellbeing/update/:id?', isArray: false },
        delete: {method: 'DELETE', params: {id: "@id"} }
    });
}]);
