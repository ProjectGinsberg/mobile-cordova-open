angular.module('gb.home')
.controller('ThisWeekCtrl', ['$scope', '$cordovaDialogs','Stats','DataSeries','ThisWeekPeriodSelection',
function($scope, $cordovaDialogs,Stats,DataSeries,ThisWeekPeriodSelection) {
    $scope.weekStart = moment().startOf('week').toDate();
    $scope.weekEnd = moment().endOf('week').toDate();
    $scope.contentLoaded = true;

    $scope.prevWeek = function() {
        $scope.contentLoaded = false;
        setTimeout(function ()
       {
         $scope.$apply(function()
         {
             $scope.weekStart = moment($scope.weekStart).subtract(1,'weeks').toDate();
             $scope.weekEnd = moment($scope.weekEnd).subtract(1,'weeks').toDate();
             $scope.contentLoaded = true;
         });
     }, 250);

    };
    $scope.nextWeek = function() {
        $scope.contentLoaded = false;
        setTimeout(function ()
       {
         $scope.$apply(function()
         {
             $scope.weekStart = moment($scope.weekStart).add(1,'weeks').toDate();
             $scope.weekEnd = moment($scope.weekEnd).add(1,'weeks').toDate();
             $scope.contentLoaded = true;
         });
     }, 250);
    };
    if(navigator && navigator.connection) {
        if(navigator.connection.type === Connection.NONE) {
            $cordovaDialogs.alert('You need a network connection to use this feature',
             'No Network connection', 'Ok')
            .then(function() {
              // callback success
              $state.go('tab.dash');
            });
        }
    }
}]);
