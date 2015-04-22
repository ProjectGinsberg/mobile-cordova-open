angular.module('gb.signup')
.controller('TrackEmotionCtrl', ['$scope','$state','$rootScope','$http','UserService','LoginService','AnalyticsService',
function($scope,$state,$rootScope,$http,UserService,LoginService,AnalyticsService) {
    $scope.valueLimit = 9;

    var wellbeing = UserService.getWellbeingQuestions();
    /*var req = {
        method: 'GET',
        url:  'https://api.ginsberg.io/v1/measures',
        headers: {
         'Authorization': 'Bearer ' + localStorage.token
        },
        data: { test: 'test' },
    };
    $http(req).success(function(data) {*/
    var data = wellbeing;
    for (var i = 0; i < data.length; i++)
        data.interested = false;

    $scope.questions = data;
    //});
    $scope.showMore = function() {
        $scope.valueLimit += 30;
    };
    $scope.selectedQuestions = function() {
        var count = 0;
        for (var i = 0; i < $scope.questions.length; i++)
        {
            if ($scope.questions[i].interested === true)
                count++;
        }
        return count;
    };
    $scope.saveQuestions = function() {
        var selectedQuestions = [];
        $scope.questions.forEach(function(q) {
            if (q.interested ===true)
                selectedQuestions.push(q.id);
        });

        UserService.updateWellbeing(selectedQuestions).then(function() {
            $state.go('tab.dash');
        });
    };

    var unbind = $rootScope.$on('gb.signup.started', function(){

        //Reset questions
        for (var i = 0; i < $scope.questions.length; i++)
        {
            $scope.questions[i].interested = false;
        }

    });

   $scope.$on('$destroy', unbind);
}]);
