angular.module('gb.aboutme')
.controller('WeightAMCtrl', ['$controller','$scope','$rootScope','ObjectiveService','SpinnerService',function($controller,$scope,$rootScope,ObjectiveService,SpinnerService) {
$controller('BaseAMCtrl', {$scope:$scope,$rootScope:$rootScope});

    $scope.options = {
        chart: {
            dispatch: {
              renderEnd: function(e)
              {
                  $rootScope.fixSvgs();
                  SpinnerService.show(false);
              }
            },
            type:'lineChart',
            height: 180,
            tooltip:false,
            interactive:false,
            showLegend: false,
            rightAlignYAxis: true,
            margin : {
                top: 15,
                right: 40,
                bottom:22,
                left: 0
            },
            transitionDuration: 500,
            xAxis: {
                showMaxMin: true,
                tickFormat: function(d) {
                    return $scope.getTick(d);
                },
                staggerLabels: false,
                tickValues: function(d) {
                    return $scope.getArray(0,$scope.days);
                }
            },
            yAxis: {
                tickFormat: function(d){return d3.format('.02f')(d);}
            }
        }
    };


    $scope.updateChart = function() {
        var dayStart = moment($scope.entryDate).endOf('day').subtract($scope.days,'days');
        var dayEnd = moment($scope.entryDatse).endOf('day');

        ObjectiveService.get('weight',dayStart
        ,dayEnd).then(function(d) {

            if (angular.isDefined(d) && d !== null) {

                if (Object.prototype.toString.call( d ) !== '[object Array]' )
                    d = [d]; // force the value to an array if only one record

                //Process records into data
                var totals = [];
                var totalsCount = [];
                var result = [];

                for(var i = 0; i < d.length; ++i)
                {
                    var timestamp = d[i].timestamp;
                    var date = new Date(timestamp);
                    var time = date.getTime();
                    var steps = d[i].weight;

                    var day = moment(timestamp);
                    var diff = day.diff(dayStart, 'days');

                    var total = totals[diff];
                    var count = totalsCount[diff];
                    if(total === undefined) {total = steps; count = 1;}
                    else {total += steps; ++count;}
                    totals[diff] = total;
                    totalsCount[diff] = count;
                }

                //var result = [];
                //totals = [1,4,5,0,2,34];

                //Find first p
                var start = 0;
                var end = 0;

                //Find first result
                for(var i = 0; i < $scope.days; ++i)
                {
                    var total = totals[i];
                    var count = totalsCount[i];
                    if(total !== undefined)
                    {
                        start = total/count;
                        break;
                    }
                }

                //Find last result
                for(var i = $scope.days-1; i >= 0; --i)
                {
                    var total = totals[i];
                    var count = totalsCount[i];
                    if(total !== undefined)
                    {
                        end = total/count;
                        break;
                    }
                }

                //Add start
                result.push({x:0,y:start});

                //Add between
                for(var i = 1; i < $scope.days-1; ++i)
                {
                    var total = totals[i];
                    var count = totalsCount[i];

                    if(total)
                    {
                        result.push({x:i,y:total/count});
                    }
                }

                //Add end
                result.push({x:$scope.days-1,y:end});

                var data =  [
                {
                "key" : "" ,
                "values" : result
                }];

                $scope.updateData(data);

            } else {
                $scope.updateData(null);
            }
        });
    };
}]);
