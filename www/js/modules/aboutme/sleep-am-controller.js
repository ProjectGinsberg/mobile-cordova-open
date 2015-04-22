angular.module('gb.aboutme')
.controller('SleepAMCtrl', ['$controller','$scope','$rootScope','ObjectiveService','SpinnerService',function($controller,$scope,$rootScope,ObjectiveService,SpinnerService) {
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

                type: 'discreteBarChart',
                rightAlignYAxis: true,
                height: 180,
                tooltip:false,
                interactive:false,
                margin : {
                    top: 15,
                    right: 40,
                    bottom: 22,
                    left: 0
                },
                transitionDuration: 250,
                xAxis: {
                    showMaxMin: true,
                    tickFormat: function(d) {
                        return $scope.getTick(d);
                    },
                    staggerLabels: false
                },
                yAxis: {
                    tickFormat: function(d){
                        return (d%1===0?d:null);
                    }
                }
            }
        };
        // color: function(d, i){return "#ff0000";},

    $scope.updateChart = function() {
        var dayStart = moment($scope.entryDate).endOf('day').subtract($scope.days,'days');
        var dayEnd = moment($scope.entryDatse).endOf('day');

        ObjectiveService.get('sleep',dayStart
        ,dayEnd).then(function(d) {

            if (angular.isDefined(d) && d !== null) {

                if (Object.prototype.toString.call( d ) !== '[object Array]' )
                    d = [d]; // force the value to an array if only one record

                //Process records into data
                var totals = [];
                var qualities = [];
                var qualitiesCount = [];
                var result = [];

                for(var i = 0; i < d.length; ++i)
                {
                    var timestamp = d[i].timestamp;
                    var date = new Date(timestamp);
                    var time = date.getTime();
                    var steps = d[i].total_sleep;
                    var quality = d[i].quality;

                    var day = moment(timestamp);
                    var diff = day.diff(dayStart, 'days');

                    var total = totals[diff];
                    var totalQuality = qualities[diff];
                    var count = qualitiesCount[diff];

                    if(total === undefined) {total = steps; totalQuality = quality; count = 1;}
                    else {total += steps; totalQuality += quality; ++count; }

                    totals[diff] = total;
                    qualities[diff] = totalQuality;
                    qualitiesCount[diff] = count;
                }

                //Extract axis values
                for(var i = 0; i < $scope.days; ++i)
                {
                    var total = totals[i];
                    var quality = qualities[i];
                    var count = qualitiesCount[i];

                    var color = "#5C9ABF";
                    var average = Math.floor(count === undefined? 0: quality/count);

                    switch(average)
                    {
                        case 5: color = "rgba(91,191,149,0.85)"; break;
                        case 4: color = "rgba(112,191,92,0.85)"; break;
                        case 3: color = "rgba(191,191,92,0.85)"; break;
                        case 2: color = "rgba(191,150,92,0.85)"; break;
                        case 1: color = "rgba(191,103,92,0.85)"; break;
                    };

                    if(total!==undefined && total !== 0)
                    result.push({x:i,y:total === undefined? null: total/60.0, "color":color});
                }

                var data =  [
                {
                "key" : "Length" ,
                "values" : result
                }];

                $scope.updateData(data);

            } else {
                $scope.updateData(null);
            }
        });
    };
}]);
