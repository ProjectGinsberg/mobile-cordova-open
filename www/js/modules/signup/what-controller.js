angular.module('gb.signup')
.controller('WhatCtrl', ['$scope','$state','$rootScope','$ionicSlideBoxDelegate','LoginService','SyncService',function($scope,$state,$rootScope,$ionicSlideBoxDelegate,LoginService,SyncService) {
    
    $scope.slider = '';
        
    var goToTabDash = function () {
        $state.go('tab.dash');
    };

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
        if(toState.name === "welcome" && fromState.name !== "signin" && fromState.name !== "signup")
        {
            if(typeof(navigator.app) !== "undefined" && typeof(navigator.app.exitApp) !== "undefined")
            {
                navigator.app.exitApp();
            }
            
            if(typeof(window.plugins) !== "undefined" && typeof(window.plugins.ginsberg) !== "undefined")
            {
                window.plugins.ginsberg.exitApp();
            }
            
            //Resize fix 
            try
            {
                $('.slider-slides').width('400%');
            }
            catch(e)
            {
                console.log("Exception " + e);
            }
            try
            {
                $('.slider-slide').width('25%');
            }
            catch(e)
            {
                console.log("Exception " + e);
            }
            
            //Reset index
            $scope.slider = 0;
            $scope.$digest();
            $ionicSlideBoxDelegate.update();
        }
    });
                
    if (angular.isDefined(localStorage.token)) {
        setTimeout(goToTabDash, $rootScope.usingNative? 0: 50); // go straight to the dashboard if token is set
    }
     // register for login / startup event
    var unbind = $rootScope.$on('gb.home.login.gainedaccess', function()
    {
        $state.go('tab.dash');
    });
    $scope.$on('$destroy', unbind);
}]);
