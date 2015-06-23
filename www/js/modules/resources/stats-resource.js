'use strict';
/**
TODO: DOCUMENT
TODO: Not really a resource is it?
 */
angular.module('gb.resources')
.factory('Stats', ['$resource', '$log', '$rootScope', function($resource, $log, $rootScope) {
 	var resource = $resource('https://sapi.ginsberg.io/v1/stats/:series', {},{
    		get: {
    			method: 'GET'
            }
        });

	return resource;
}]);
