angular.module('gb.signup')
.controller('SignInCtrl', ['$scope','$state','$rootScope','LoginService','SyncService','AnalyticsService','SpinnerService',function($scope,$state,$rootScope,LoginService,SyncService,AnalyticsService,SpinnerService) {
    $scope.email = '';
    $scope.password = '';

    $scope.login = function() {
        
        console.log($scope.email);
        SpinnerService.show(true);
        AnalyticsService.event('Signup Signin Choice', {'user':'signin'});
        
        LoginService.simpleLogin($scope.email,
                          $scope.password).then(function(result) {
            
                          SpinnerService.show(false);
        
                          if (result === undefined) {
                              $scope.loginMessage = "Sorry, there seems to a problem with our server.  Please try again later.";
                              return;
                          }
                          if (angular.isDefined(result.data.token)) {
                              AnalyticsService.event('Signup Signin Success', {'user':'signin'});
                              
                              LoginService.GainedAccess();
                              $scope.email = '';
                              $scope.password = '';
                              $scope.loginMessage = '';
                          } else {
                              $scope.loginMessage = "Sorry! incorrect username or password.";
                          }
                        }).catch(function(err) {
                            SpinnerService.show(false);
                            $scope.loginMessage = "Sorry, there seems to a problem with our server.  Please try again later.";
                        });

    };

     // register for login / startup event
    var unbind = $rootScope.$on('gb.home.login.gainedaccess', function()
    {
        $state.go('tab.dash');
        $scope.email = '';
        $scope.password = '';
        $scope.loginMessage = '';
    });
    $scope.$on('$destroy', unbind);
}]);
