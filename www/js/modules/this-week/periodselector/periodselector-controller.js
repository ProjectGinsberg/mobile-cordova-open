angular.module('gb.home')
.controller('PeriodSelectorController',
['$scope','ThisWeekPeriodSelection',function($scope,ThisWeekPeriodSelection) {

    $scope.nextWeek = function() {
        ThisWeekPeriodSelection.nextWeek();
    };
    $scope.prevWeek = function() {
        ThisWeekPeriodSelection.prevWeek();
    };
}]);
