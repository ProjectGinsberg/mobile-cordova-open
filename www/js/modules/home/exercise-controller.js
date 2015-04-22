angular.module('gb.home')
.controller('ExerciseCtrl', ['$scope','$rootScope','ObjectiveService','SyncService','AnalyticsService',function($scope,$rootScope,ObjectiveService,SyncService,AnalyticsService) {
    $scope.exerciseRecords = [];
    $scope.exerciseDeletes = [];
    $scope.newRecord = null;
   
    var recordsToProcess = 0;
     
    //Timer check
    var lastTap = new Date();
    
    $scope.addStoreText = function() {
        return $scope.newRecord === null? "+ Add Exercise": "Store Exercise"; 
    };

    $scope.tappedAddStoreRecord = function() {
                
        //Timer check
        var currentTap = new Date();
        var md = currentTap - lastTap;
        if (md < 300) return;
        lastTap = currentTap;
        
        if($scope.newRecord === null)
        {
            AnalyticsService.event('Tapping Add', {'AddData':'Exercise'});
        }
        else
        {
            AnalyticsService.event('Tapping Stored', {'StoreData':'Exercise'});
        }
        
        $scope.addRecord();
    };

    $scope.autoStoreRecord = function() {
        AnalyticsService.event('Auto Stored', {'AutoStoreData':'Exercise'});
        $scope.addRecord();
    };


    $scope.addRecord = function() {
        if ($scope.newRecord !== null) {
            //Skip unset activity
            if($scope.newRecord.activity_type !== "")
            {
                $scope.exerciseRecords.push($scope.newRecord);
                var index = $scope.exerciseRecords.length - 1;
            
                AnalyticsService.event('On Save', {'SavedData':'Exercise'});
    
                //Store new record to database
                ObjectiveService.save('exercise',$scope.exerciseRecords[$scope.exerciseRecords.length-1],function() {
                    //Try sending to server
                    SyncService.SyncLocalChangedObjective("exercise",false,function(newId) {
                        //Get backer server id 
                        $scope.exerciseRecords[index].id = newId;
                    });
                });
            }
                
            $scope.newRecord = null;
        } else {
            var obj = ObjectiveService.createNew('exercise');
            var ts = moment($scope.entryDate);
            ts.hours(moment().hours());
            ts.minutes(moment().minutes());
            ts.seconds(moment().seconds());
            ts.milliseconds(moment().millisecond());
            obj.timestamp = ts;
            $scope.newRecord = obj;
        }
    };

    $scope.deleteRecord = function(index) {
        var record = $scope.exerciseRecords[index];
        
        //Check if stored beyond just front end
        if(record.state)
        {
            //Store up for sending to database on Save
            //$scope.exerciseDeletes.push(record);
            
            AnalyticsService.event('Tapping Delete', {'Delete Data':'Exercise'});

            //Set delete in database
            ObjectiveService.delete('exercise',$scope.exerciseRecords[index],function() {
                //Try deleting on server
                SyncService.SyncLocalChangedObjective("exercise",false);
            });
        }
        
        $scope.exerciseRecords.splice(index,1);
    };

    $scope.$watch('entryDate',function(newVal) {
        refreshOnscreen();
    });
    
    var refreshOnscreen = function()
    {
        $scope.exerciseDeletes = [];
        $scope.newRecord = null;
        
        var dayStart = moment($scope.entryDate).startOf('day');
        var dayEnd = moment($scope.entryDate).endOf('day');
        ObjectiveService.get('exercise',dayStart
        ,dayEnd).then(function(d) {
            if (angular.isDefined(d) && d !== null) {
                if (Object.prototype.toString.call( d ) !== '[object Array]' )
                    d = [d]; // force the value to an array if only one record
                $scope.exerciseRecords = d;
                
                //Remove deleted records
                for(var i = 0; i < $scope.exerciseRecords.length; ++i)
                {
                    if($scope.exerciseRecords[i].state === "deleted")
                    {
                        $scope.exerciseDeletes.push($scope.exerciseRecords[i]);
                        $scope.exerciseRecords.splice(i--,1);
                    }
                }
            } else {
                $scope.exerciseRecords = [];
            }
        });
    };

    var unbind = $rootScope.$on('gb.home.dashboard.save', function(){
        
        if($scope.newRecord !== null)
        {
            $scope.autoStoreRecord();
        }
    });
    
    $scope.$on('$destroy', unbind);
}]);
