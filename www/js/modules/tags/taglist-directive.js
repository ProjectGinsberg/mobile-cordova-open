angular.module('gb.home')
.directive('tagList', ['TagService','$rootScope',function(TagService,$rootScope) {
    return {
        templateUrl: "templates/partials/tags/tags.html",
        restrict: 'E',
        link: function(scope, element, attrs) {
            //scope.allTags = TagService.getDefaultUserTags();
            // add in the moue events for user clicking on the individual tags
            scope.allTags = TagService.getDefaultUserTags();

            scope.tagClicked = function(evt) {
                if (scope.addTextToEntry !== undefined) {
                    scope.addTextToEntry(evt);
                }
            };
            
            var unbind = $rootScope.$on('gb.home.profile.updated', function(){
                scope.allTags = TagService.getDefaultUserTags();
            });

            scope.$on('$destroy', unbind);
        }
    };
}]);
