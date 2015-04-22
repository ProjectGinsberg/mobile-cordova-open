angular.module('gb.home')
/*
    TODO: find out if we can delete these without causing problems
*/
.controller('TabCtrl',['$scope',function($scope) {
    $scope.currentTab = 'Home';
    $scope.tabChanged = function(newTab) {
        $scope.currentTab = newTab;
    }
}])
.controller('LoginCtrl',['$scope','$rootScope','$state',function($scope,$rootScope,$state) {
    $scope.login = function() {
        $state.go('tab.dash');
    };
    $scope.loginjs = function()
    {
        GAPI.Setup(null,$rootScope.clientId,$rootScope.clientSecret,
                   new GAPICallbacks(null, null, null, null, null, null, null, null));
        GAPI.DoLogin();
        //showAbout();
    };
}])
