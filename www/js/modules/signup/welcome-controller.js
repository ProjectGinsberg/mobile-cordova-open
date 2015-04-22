angular.module('gb.signup')
.controller('WelcomeCtrl', ['$scope','$state','LoginService','UserService','AnalyticsService',
function($scope,$state, LoginService,UserService,AnalyticsService) {
    $scope.startLogin = function() {
        LoginService.GainedAccess();
    };
    $scope.goNext = function() {
        UserService.saveSections();
        var settings = UserService.getUserInterestedSections();
        
        var choices = [];
        
        for(var i = 0; i < settings.length; ++i)
        {
            var setting = settings[i];
            var section = setting.section;
            var interested = setting.interested;
            choices.push({section:interested});
        }
        
        AnalyticsService.event('Signup Tracks', JSON.stringify(choices));
        
        $state.go('trackemotion');
    };
}]);
