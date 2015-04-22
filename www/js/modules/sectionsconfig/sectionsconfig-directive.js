angular.module('gb.home')
.directive('sectionsConfig', function() {
    return {
        templateUrl: "templates/partials/sectionsconfig/config.html",
        restrict: 'E',
        transclude: true,
        controller:'SectionsConfigCtrl',
        link: function(scope, element, attrs) {

        }
    };
});
