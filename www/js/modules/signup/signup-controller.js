angular.module('gb.signup')
.controller('SignupCtrl', ['$scope','$state','$rootScope','$cordovaDialogs','UserService','LoginService','AnalyticsService','SpinnerService',
function($scope,$state,$rootScope,$cordovaDialogs,UserService,LoginService,AnalyticsService,SpinnerService) {
    $scope.firstName = '';
    $scope.lastName = 'null';
    $scope.email = '';
    $scope.wantsNewsletter = false;
    $scope.password = '';
    $scope.confirmPassword = '';

    $scope.signup = function() {
        
        AnalyticsService.event('Signup Signin Choice', {'user':'signup'});
        
        $scope.errorMessage = '';
        if ($scope.password !== $scope.confirmPassword) {
            $scope.errorMessage = 'Password does not match Confirm Password';
            return;
        }
        if(navigator && navigator.connection) {
            if(navigator.connection.type === Connection.NONE) {
                $cordovaDialogs.alert('You need a network connection to sign up',
                 'No Network connection', 'Ok')
                .then(function() {
                });
                return;
            }
        }
        
        SpinnerService.show(true);
        
        UserService.createUser($scope.firstName,
                                  $scope.lastName,
                                  $scope.email,
                                  $scope.password,
                                  $scope.confirmPassword,
                                  $scope.wantsNewsletter,
                                  1).then(function(result) {
                                      SpinnerService.show(false);
        
                                      console.log(result);
                                      if (result.data.message === "New account created.") {
                                          
                                          AnalyticsService.event('Signup Signin Success', {'user':'signup'});
                          
                                          LoginService.simpleLogin($scope.email,
                                                         $scope.password).then(function() {
                                                             
                                                             $rootScope.$broadcast('gb.signup.started');
                                                             
                                                             $state.go('track');
                                                         });
                                      } else {
                                          
                                          $scope.errorMessage = result.data.message;
                                      }

                                  });
    };
    if(navigator && navigator.connection) {
        if(navigator.connection.type === Connection.NONE) {
            $cordovaDialogs.alert('You need a network connection to sign up',
             'No Network connection', 'Ok')
            .then(function() {
              // callback success
              $state.go('welcome');
            });
        }
    }
    
    
    var unbind = $rootScope.$on('gb.signup.started', function(){
    
        //Reset questions
        $scope.firstName = '';
        $scope.lastName = '';
        $scope.email = '';
        $scope.password = '';
        $scope.confirmPassword = '';
        $scope.wantsNewsletter = false;
    });

   $scope.$on('$destroy', unbind);
}]);
