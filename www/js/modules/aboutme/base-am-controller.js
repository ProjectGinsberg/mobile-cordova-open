angular.module('gb.aboutme')
.controller('BaseAMCtrl', ['$scope','$rootScope','SpinnerService',function($scope,$rootScope,SpinnerService) {


$scope.$watch('entryDate',function(newVal) {
    $scope.updateChart();
});


// register for days change event
var unbind = $rootScope.$on('gb.aboutme.dashboard.days', function(event){
    $scope.updateChart();
});
$scope.$on('$destroy', unbind);


$scope.$watch('currentTab',function(newVal) {
    if (newVal === 'Graphs') {
        SpinnerService.show(true);        
        $scope.updateChart();
    }
});


$scope.getArray = function(start,length)
{
    var foo = [];
    for (var i = start; i < start+length; i++) {
        foo.push(i);
    }
    return foo;
};


$scope.updateData = function(newData)
{
    if($scope.data) delete $scope.data;
    
    var valid = newData !== undefined && newData !== null && newData.length > 0 && newData[0].values !== undefined && newData[0].values.length > 0;
    var lineChart = $scope.options.chart.type === 'lineChart';
    
    $scope.options.chart.xDomain = valid && !lineChart? $scope.xDomain: undefined;
    $scope.data = valid? newData: [{"key" : "", "values" : []}];
};

}]);