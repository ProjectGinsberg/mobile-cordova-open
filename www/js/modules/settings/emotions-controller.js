angular.module('gb.settings')
.controller('SettingsEmotionCtrl', ['$scope','$state','$rootScope','$http',
                                'UserService','LoginService','AnalyticsService',
                                'ProfileService',
function($scope,$state,$rootScope,$http,
            UserService,LoginService,AnalyticsService,ProfileService) {
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
    var userQuestions = ProfileService.getUserWellbeingQuestions();
    // this is going to be nasty, but the arrays are small so performance
    // won't be terrible
    for (var i = 0; i < data.length; i++)
    {
        data[i].interested = false;
        for (var j = 0; j < userQuestions.length; j++)
        {
            if (data[i].id === userQuestions[j].id) {
                data[i].interested = true;
                break;
            }
        }
    }
    var sortOrder = [8, 11, 14, 7, 17,16, 25,
                     19, 24, 18, 12, 13, 1, 2, 5, 6, 15,
                     3, 4, 9 ,10 ,27 ,28 ,20];

    data.sort(function(a,b) {
        if (a.interested === true) return -1;
        if (b.interested === true) return 1;
        if (sortOrder.indexOf(a.id) === -1) return 1;
        if (sortOrder.indexOf(b.id) === -1) return -1;
        if (sortOrder.indexOf(a.id) < sortOrder.indexOf(b.id))
            return -1;
        return 1;
    });
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
    $scope.$watch('questions',function(newVal) {
        var selectedQuestions = [];
        $scope.questions.forEach(function(q) {
            if (q.interested ===true)
                selectedQuestions.push(q.id);
        });

        UserService.updateWellbeing(selectedQuestions).then(function() {
        });
    },true);
    var unbind = $rootScope.$on('gb.signup.started', function(){

        //Reset questions
        for (var i = 0; i < $scope.questions.length; i++)
        {
            $scope.questions[i].interested = false;
        }

    });

   $scope.$on('$destroy', unbind);
}]);
