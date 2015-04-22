angular.module('gb.resources')
.factory('Login', ['$resource',
function($resource)
{
    return $resource(':urly:endPointy/:paramsy', {urly: '@urly', endPointy: '@endPointy', paramsy:'paramsy' } );
}]);
