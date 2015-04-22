angular.module('gb.aboutme')
.controller('StepsAMCtrl', ['$controller','$scope','$rootScope','ObjectiveService','SpinnerService',function($controller,$scope,$rootScope,ObjectiveService,SpinnerService) {
$controller('BaseAMCtrl', {$scope:$scope,$rootScope:$rootScope});
  
    /*
    //Graph options
    $scope.config = {
        visible: true, // default: true
        extended: false, // default: false
        disabled: false, // default: false
        autorefresh: false, // default: true
        refreshDataOnly: true // default: false
    };
    */
   
    $scope.options = {
        chart: {
                dispatch: {
                    renderEnd: function(e)
                    {
                        $rootScope.fixSvgs();
                        SpinnerService.show(false);
                    }
                },
                type: 'discreteBarChart',
                height: 180,
                rightAlignYAxis: true,
                tooltip:false,
                interactive:false,
                margin : {
                    top: 15,
                    right: 40,
                    bottom: 22,
                    left: 0
                },
                color: d3.scale.category10().range(),
                transitionDuration: 250,
                xAxis: {
                    showMaxMin: true,
                    tickFormat: function(d) {
                        return $scope.getTick(d);
                    },
                    staggerLabels: false
                },
                yAxis: {
                    tickFormat: function(d){return d;}
                }
            }
        };

    $scope.updateChart = function() {
        
        var dayStart = moment($scope.entryDate).endOf('day').subtract($scope.days,'days');
        var dayEnd = moment($scope.entryDatse).endOf('day');

        ObjectiveService.get('stepcount',dayStart
        ,dayEnd).then(function(d) {
            if (angular.isDefined(d) && d !== null) {

                if (Object.prototype.toString.call( d ) !== '[object Array]' )
                    d = [d]; // force the value to an array if only one record

                //Process records into data
                var totals = [];
                var result = [];

                for(var i = 0; i < d.length; ++i)
                {
                    var timestamp = d[i].timestamp;
                    var date = new Date(timestamp);
                    var time = date.getTime();
                    var steps = d[i].step_count;

                    var day = moment(timestamp);
                    var diff = day.diff(dayStart, 'days');

                    var total = totals[diff];
                    if(total === undefined) total = steps;
                    else total += steps;
                    totals[diff] = total;
                }

                //var result = [];
                //totals = [1,4,5,0,2,34];

                for(var i = 0; i < $scope.days; ++i)
                {
                    var total = totals[i];
                    if(total !== undefined && total !== 0)
                    result.push({x:i,y:total === undefined? null: total});
                }

                var data =  [
                {
                "key" : "Steps" ,
                "values" : result
                }];

                //$scope.xDomain = [0,1,5,6];
                //$scope.xRange = [-10000,50000,1,1999999,10000];
    

                $scope.updateData(data);
            } else {
                $scope.updateData(null);
            }
        });
    };
}]);
