angular.module('gb.home')
.controller('SectionsConfigCtrl', ['$scope','$rootScope','UserService',function($scope,$rootScope,UserService) {
    var defaultUserSections = UserService.getDefaultInterestedSections();

    $scope.userSections = UserService.getUserInterestedSections();

    if ($scope.userSections === null) {
        $scope.userSections = UserService.setUserInterestedSectionsToDefault();
    }

    var unbind = $rootScope.$on('gb.signup.started', function(){
        $scope.userSections = UserService.setUserInterestedSectionsToDefault();
    });
    $scope.reorderItem = function(item, fromIndex, toIndex)
    {
        if (toIndex >= $scope.userSections.length) {
            var k = toIndex - $scope.userSections.length;
            while ((k--) + 1) {
                $scope.userSections.push(undefined);
            }
        }
        $scope.userSections.splice(toIndex, 0, $scope.userSections.splice(fromIndex, 1)[0]);
    };
    $scope.$on('$destroy', unbind);
}]);
