angular.module('gb.home')
.controller('WellbeingCtrl', ['$scope','$rootScope','WellbeingService','SyncService','AnalyticsService',
function($scope,$rootScope,WellbeingService,SyncService,AnalyticsService) {
    $scope.answers = [];
    $scope.wellbeingQuestions = WellbeingService.getUserWellbeingQuestions();

    var recordsToProcess = 0;
    
    $scope.answerScores = [{
        score:1,
        text:"Strongly Disagree",
        class:"sd"
    },{
        score:2,
        text:"Disagree",
        class:"d"
    },{
        score:3,
        text:"Undecided",
        class:"u"
    },{
        score:4,
        text:"Agree",
        class:"a"
    },{
        score:5,
        text:"Strongly Agree",
        class:"sa"
    }].sort(function(a,b) { // we sort this list so that we are
                            // guaranteed it will always be in the order
                            // we want
        return b.score - a.score;
    });
    $scope.questionAnswered = function(questionId,score) {
        console.log('answered ' + questionId+ ' with score '+ score);
        setQuestionAnswer(questionId,score);
    };
    $scope.getQuestionScore = function(questionId) {
        var answer = getAnswer(questionId);
        if (answer !== null)
            return answer.value;
        return null;
    };
    $scope.answerScoreClass = function(questionId,score) {
        if ($scope.getQuestionScore(questionId) === score)
            return 'active';
        return '';
    };
    $scope.$watch('entryDate',function(newVal) {
        refreshOnscreen();
    });
    
    var refreshOnscreen = function()
    {
        $scope.wellbeingQuestions = WellbeingService.getUserWellbeingQuestions();

        var dayStart = moment($scope.entryDate).startOf('day');
        var dayEnd = moment($scope.entryDate).endOf('day');
        WellbeingService.get(dayStart, dayEnd).then(function(d) {
            if (angular.isDefined(d) && d !== null) {
                if (Object.prototype.toString.call( d ) !== '[object Array]' )
                    d = [d]; // force the value to an array if only one record

                $scope.answers = d;
            } else {
                $scope.answers = [];
            }
        });
    };
    var setQuestionAnswer = function(questionId,score) {
        var answer = getAnswer(questionId);
        if (answer !== null) {
            answer.value = score;
            if(answer.state === "synced" || answer.state === "changed") answer.state = "dirty";
        } else {
            var ts = moment($scope.entryDate);
            ts.hours(moment().hours());
            ts.minutes(moment().minutes());
            ts.seconds(moment().seconds());
            ts.milliseconds(moment().millisecond());

            answer = WellbeingService.createNew(questionId);
            answer.timestamp = ts;
            answer.value = score;
            $scope.answers.push(answer);
        }
        
        var index = 0;
        for(var i = 0; i < $scope.answers.length; ++i)
        {
            if($scope.answers[i].measure_id === answer.measure_id)
            {
                index = i;
                break;
            }
        }
        
        AnalyticsService.event('Tapping Add', {'AddData':'Wellbeing'});

        //Store new record to database
        WellbeingService.save(answer,function() {
            //Try sending to server
            SyncService.SyncLocalChangedWellbeing(false,function() {
                refreshOnscreen();
            });
        });
    };
    var getAnswer = function(questionId) {
        var answers = $scope.answers;
        for (var i = 0; i < answers.length; i++)
        {
            if (answers[i].measure_id === questionId) {
                return answers[i];
            }
        }
        return null;
    };

    var unbind = $rootScope.$on('gb.home.dashboard.save', function(){
        
    });
    
    $scope.$on('$destroy', unbind);
    
    var unbind2 = $rootScope.$on('gb.home.profile.updated', function(){
        $scope.wellbeingQuestions = WellbeingService.getUserWellbeingQuestions();        
    });
    
    $scope.$on('$destroy', unbind2);
}]);
