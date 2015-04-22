angular.module('gb.aboutme')
.controller('WellbeingAMCtrl', ['$controller','$scope','$rootScope','ObjectiveService','WellbeingService','SpinnerService',function($controller,$scope,$rootScope,ObjectiveService,WellbeingService,SpinnerService) {
$controller('BaseAMCtrl', {$scope:$scope,$rootScope:$rootScope});

    $scope.wellbeingQuestion = "Question 1";
    $scope.wellbeingQuestionID = 1;

    $scope.wellbeingQuestionIndex = -1;

    $scope.options = {
        chart: {
            isArea:false,
            tooltip:false,
            interactive:false,
            dispatch: {
              renderEnd: function(e)
              {
                  $rootScope.fixSvgs();
                  SpinnerService.show(false);
              }
            },
            type:'lineChart',
            rightAlignYAxis: true,
            height: 140,
            showLegend: false,
            forceY: [1,2,3,4,5],
            margin : {
                top: 15,
                right: 40,
                bottom: 22,
                left: 0
            },
            transitionDuration: 500,
            xAxis: {
                tickFormat: function(d){
                   return $scope.getTick(d);
                },
                tickValues: function(d) {
                    return $scope.getArray(0,$scope.days);
                }
            },
            yAxis: {
                tickValues:[1,2,3,4,5],
                tickFormat: function(d){
                   return $scope.getWellbeing(d);
                },
                rotateYLabel: false
            }
        }
    };

    $scope.toolTipContentFunction = function(){
    	return function(key, x, y, e, graph) {
        	return  'Super New Tooltip' +
            	'<h1>' + key + '</h1>' +
                '<p>' +  y + ' at ' + x + '</p>';
    	};
    };

    $scope.showSectionWellbeing = function() {
        var show = $scope.showSection('wellbeing');
        var wellbeingQuestions =  WellbeingService.getUserWellbeingQuestions();
        
        return show && !($scope.wellbeingQuestionIndex === -1 || wellbeingQuestions[$scope.wellbeingQuestionIndex] === undefined);
    };

    $scope.updateChart = function() {
        var dayStart = moment($scope.entryDate).endOf('day').subtract($scope.days,'days');
        var dayEnd = moment($scope.entryDate).endOf('day');

        var wellbeingQuestions =  WellbeingService.getUserWellbeingQuestions();
        
        //Check valid
        if($scope.wellbeingQuestionIndex === -1 || wellbeingQuestions[$scope.wellbeingQuestionIndex] === undefined) return;
        
        $scope.wellbeingQuestion = wellbeingQuestions[$scope.wellbeingQuestionIndex].question;
        $scope.wellbeingQuestionID = wellbeingQuestions[$scope.wellbeingQuestionIndex].id;

        ObjectiveService.get('wellbeing',dayStart
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
                    var level = d[i].value;
                    var id = d[i].measure_id;

                    if(id !== $scope.wellbeingQuestionID) continue;
                    
                    var day = moment(timestamp);
                    var diff = day.diff(dayStart, 'days');

                    var total = totals[diff];
                    var count = totalsCount[diff];
                    if(total === undefined) {total = level; count = 1;}
                    else {total = level; ++count;}
                    totals[diff] = total;
                    totalsCount[diff] = count;
                }
                
                if(totals.length > 0)
                {
                    var data = [];
                    var start = 3;
                    var end = 3;

                    //Find first result
                    for(var i = 0; i < $scope.days; ++i)
                    {
                        var total = totals[i];
                        var count = totalsCount[i];
                        if(total !== undefined)
                        {
                            start = total;
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
                            end = total;
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
                            var level = total;
                            result.push({x:i,y:level});
                        }
                    }

                    //Add end
                    result.push({x:$scope.days-1,y:end});

                    data.push({
                        "key" : "",
                        "values" : result,
                        "color":"#5CBF96"
                    });

                    $scope.updateData(data);
                }
                else
                {
                    $scope.updateData(null);
                }
            } else {
                $scope.updateData(null);
            }
        });
    };


    // To Move into wellbeing
    $scope.getWellbeing = function(d)
    {
       if(d % 1 !== 0) return null;

       switch(d)
       {
           case 1: return "S Disagree";
           case 2: return "Disagree";
           case 3: return "Undecided";
           case 4: return "Agree";
           case 5: return "S Agree";
           default: return null;
       }
    };


    var unbind2 = $rootScope.$on('gb.home.profile.updated', function(){
        var wellbeingQuestions =  WellbeingService.getUserWellbeingQuestions();
        $scope.wellbeingQuestion = wellbeingQuestions[$scope.wellbeingQuestionIndex].question;
        $scope.wellbeingQuestionID = wellbeingQuestions[$scope.wellbeingQuestionIndex].id;
    });

    $scope.$on('$destroy', unbind2);
}]);
