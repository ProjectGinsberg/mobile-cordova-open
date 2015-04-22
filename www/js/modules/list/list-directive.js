angular.module('gb.home')
.directive('gbList', function() {
    return {
        templateUrl: "/templates/partials/list/list.html",
        restrict: 'E',
        transclude: true,
        scope: {
            list: '='
        },
        link: function(scope, element, attrs) {

            scope.renderItem = function(item) {
                console.log(attrs);
                return item[attrs['displayproperty']] || '';
            };
            console.log(scope);
        }
    };
});
