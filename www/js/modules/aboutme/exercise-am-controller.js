angular.module('gb.aboutme')
.controller('ExerciseAMCtrl', ['$controller','$scope','$rootScope','ObjectiveService','SpinnerService',function($controller,$scope,$rootScope,ObjectiveService,SpinnerService) {
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
                  type: 'multiBarChart',
                  tooltip:false,
                  interactive:false,
                height: 180,
                stacked: true,
                showControls: false,
                rightAlignYAxis: true,
                reduceXTicks: false,
                margin : {
                    top: 15,
                    right: 40,
                    bottom: 22,
                    left: 0
                },
                //color: d3.scale.category10().range(),
                //useInteractiveGuideline: true,
                transitionDuration: 500,
                legend: {
                    color: function (d,i) {
                        var legendColor;
                        switch(ids[i])
                        {
                            case "Walking": legendColor = "#8EBF82"; break;
                            case "Running": legendColor = "#8E82BF"; break;
                            case "Other Cardio": legendColor = "#829BBF"; break;
                            case "Weight Training": legendColor = "#82BFBF"; break;
                            case "Sport": legendColor = "#82BF9B"; break;
                            case "Yoga": legendColor = "#B382BF"; break;
                            case "Meditation": legendColor = "#B3BF82"; break;
                            case "Cycling": legendColor = "#BFA782"; break;
                            case "Other": legendColor = "#BE8282"; break;


                        };
                        return d.color = legendColor;
                    }
                },
                xAxis: {
                    tickFormat: function(d){
                        return $scope.getTick(d);
                    },
                    tickValues: function(d) {
                        return $scope.getArray(0,$scope.days);
                    }
                },
                yAxis: {
                    tickFormat: function(d){
                        return (d%1===0?d:null);
                    }
                }
            }
        };

    var ids = [];
    $scope.updateChart = function() {
        
        var dayStart = moment($scope.entryDate).endOf('day').subtract($scope.days,'days');
        var dayEnd = moment($scope.entryDatse).endOf('day');

        ObjectiveService.get('exercise',dayStart
        ,dayEnd).then(function(d) {

            ids.length = 0;

            if (angular.isDefined(d) && d !== null) {

                if (Object.prototype.toString.call( d ) !== '[object Array]' )
                    d = [d]; // force the value to an array if only one record

                //Process records into data
                var color;
                var totals = [[]];

                for(var i = 0; i < d.length; ++i)
                {
                    var timestamp = d[i].timestamp;
                    var date = new Date(timestamp);
                    var time = date.getTime();
                    var id = d[i].activity_type;

                    var day = moment(timestamp);
                    var diff = day.diff(dayStart, 'days');

                    //Get index
                    var index = ids.indexOf(id);

                    if(index === -1)
                    {
                        ids.push(id);
                        index = ids.indexOf(id);
                        totals[index] = [];
                    }

                    var total = totals[index][diff];
                    if(total === undefined) {total = 1;}
                    else { ++total; }
                    totals[index][diff] = total;
                }

                var data = [];
                var result = [];
                
                var validDays = [];
                
                //Extract used days
                for(var i = 0; i < $scope.days; ++i)
                {
                    for(var j = 0; j < totals.length; ++j)
                    {
                        if(totals[j][i] !== undefined)
                        {
                            validDays.push(i);
                            break;
                        }
                    }
                }
                  
                //Extract data
                for(var j = 0; j < totals.length; ++j)
                {   
                    var usedTotals = totals[j];
                    result[j] = [];
                  
                    for(var i = 0; i < validDays.length; ++i)
                    {
                        var d = validDays[i];
                        var total = usedTotals[d];
                        
                        if(total !== undefined && total !== 0)
                        {
                            switch(ids[j])
                            {
                                case "Walking": color = "#8EBF82"; break;
                                case "Running": color = "#8E82BF"; break;
                                case "Other Cardio": color = "#829BBF"; break;
                                case "Weight Training": color = "#82BFBF"; break;
                                case "Sport": color = "#82BF9B"; break;
                                case "Yoga": color = "#B382BF"; break;
                                case "Meditation": color = "#B3BF82"; break;
                                case "Cycling": color = "#BFA782"; break;
                                case "Other": color = "#BE8282"; break;
                            };

                            result[j].push({x:d,y:total,color:color});
                        }
                        else
                        {
                            result[j].push({x:d,y:null});
                        }
                    }
                    
                    data.push({
                        "key" : ids[j],
                        "values" : result[j]
                    });
                }
                //var r = [{key:"wibble",values:[{x:3,y:1,color:"#BFA782"},{x:4,y:2,color:"#BFA782"},{x:5,y:0,color:"#BFA782"}]},
                //         {key:"wibble2",values:[{x:0,y:null},{x:4,y:1,color:"#8E82BF"},{x:5,y:1,color:"#8E82BF"}]}];
                $scope.updateData(data);
            } else {
                $scope.updateData(null);
            }
        });
    };
}]);
