angular.module('gb.resources')
.factory('Login', ['$resource',
function($resource)
{
    console.log("CD: Login resource  of");
    //var p = {objective:'@objective'};
    
    return $resource(':urly:endPointy/:paramsy', {urly: '@urly', endPointy: '@endPointy', paramsy:'paramsy' } );
}]);
