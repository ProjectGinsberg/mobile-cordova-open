angular.module('gb.loginController', ['gb.services'])

.controller('LoginCtrlA', ['$scope','$rootScope','LoginService',function($scope,LoginService) {

    $scope.loginajs = function()
    {
        GAPI.Setup(null,$rootScope.clientId,$rootScope.clientSecret,
                   new GAPICallbacks(null, null, null, null, null, null, null, null));
        GAPI.DoLogin();
    };

    $scope.entryDate = new Date();

    $scope.nextDay = function() {
        $scope.entryDate = addDays(1);
    };
    $scope.prevDay = function() {
        $scope.entryDate = addDays(-1);
    };

    var addDays = function(days)
    {
        var dat = new Date($scope.entryDate.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    };

    var d = ObjectiveService.get('alcohol',new Date('01/01/2014'),new Date('12/12/2014'));
    console.log(d);
    d = ObjectiveService.get('exercise',new Date('01/01/2014'),new Date('12/12/2014'));
    console.log(d);
    d = ObjectiveService.get('sleep',new Date('01/01/2014'),new Date('12/12/2014'));
    console.log(d);
}]);
