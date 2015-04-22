angular.module('gb.home')
.controller('StepsCtrl',['$scope','$rootScope','ObjectiveService','SyncService','AnalyticsService','PedometerService',function($scope,$rootScope,ObjectiveService,SyncService,AnalyticsService,PedometerService) {
    
    $scope.stepsRecords = [];
    $scope.stepsDeletes = [];

    $scope.newRecord = null;
    var recordsToProcess = 0;
    
    //Timer check
    var lastTap = new Date();
    
    $scope.addStoreText = function() {
        return $scope.newRecord === null? "+ Add Steps": "Store Steps"; 
    };

    $scope.tappedAddStoreRecord = function() {
        
        //Timer check
        var currentTap = new Date();
        var md = currentTap - lastTap;
        if (md < 300) return;
        lastTap = currentTap;

        if($scope.newRecord === null)
        {
            AnalyticsService.event('Tapping Add', {'AddData':'Steps'});
        }
        else
        {
            AnalyticsService.event('Tapping Stored', {'StoreData':'Steps'});
        }
        
        $scope.addRecord();
    };

    $scope.autoStoreRecord = function() {
        AnalyticsService.event('Auto Stored', {'AutoStoreData':'Steps'});
        $scope.addRecord();
    };

    // Add new steps record to frontend
    $scope.addRecord = function() {
        if ($scope.newRecord !== null) {
            
            //Stop steps if possible
            console.log("Pedometer checking");
            PedometerService.isStepsSupported(function(truth)
            {
                console.log("Pedometer supported " + truth);
                if(truth)
                {
                    PedometerService.stopUpdates();
                }
            });
            
            if($scope.newRecord.step_count && $scope.newRecord.step_count !== 0)
            {
                if( Object.prototype.toString.call($scope.newRecord.step_count) === '[object String]' ) {
                    $scope.newRecord.step_count = parseInt($scope.newRecord.step_count);
                }
                $scope.stepsRecords.push($scope.newRecord);
                var index = $scope.stepsRecords.length - 1;
            
                AnalyticsService.event('On Save', {'SavedData':'Steps'});

                //Store new record to database
                ObjectiveService.save('stepcount',$scope.stepsRecords[$scope.stepsRecords.length-1],function() {
                    //Try sending to server
                    SyncService.SyncLocalChangedObjective("stepcount",false,function(newId) {
                        //Get backer server id 
                        $scope.stepsRecords[index].id = newId;
                    });
                });
            }
            $scope.newRecord = null;
        } else {
            var obj = ObjectiveService.createNew('stepcount');
            delete obj.step_count;
            var ts = moment($scope.entryDate);
            ts.hours(moment().hours());
            ts.minutes(moment().minutes());
            ts.seconds(moment().seconds());
            ts.milliseconds(moment().millisecond());
            obj.timestamp = ts;
            $scope.newRecord = obj;
           
            //Get steps if possible
            console.log("Pedometer checking");
            PedometerService.isStepsSupported(function(truth)
            {
                console.log("Pedometer supported " + truth);
                if(truth === true)
                {
                    PedometerService.startUpdates(pedometerData);
                }
            });
        }
    };
    
    var pedometerData = function(data)
    {
        console.log("Got pedometer data " + JSON.stringify(data));
        
        if($scope.newRecord !== null)
        {
            console.log("Steps " + data.numberOfSteps + " to " + $scope.newRecord.step_count);
            $scope.newRecord.step_count = data.numberOfSteps;
            $scope.$digest();
        }
    };
    
    // Delete frontend steps record
    $scope.deleteRecord = function(index) {
        var record = $scope.stepsRecords[index];
        
        //Check if stored beyond just front end
        if(record.state)
        {
            AnalyticsService.event('Tapping Delete', {'Delete Data':'Steps'});

            //Set delete in database
            ObjectiveService.delete('stepcount',$scope.stepsRecords[index],function() {
                //Try deleting on server
                SyncService.SyncLocalChangedObjective("stepcount",false);
            });
        }
        
        $scope.stepsRecords.splice(index,1);
    };
    
    // Update onscreen display on data change
    $scope.$watch('entryDate',function(newVal) {
         refreshOnscreen();
    });
    
    var refreshOnscreen = function()
    {
        //Reset deleted records as moving to new date
        $scope.stepsDeletes = [];
        $scope.newRecord = null;
        
        var dayStart = moment($scope.entryDate).startOf('day');
        var dayEnd = moment($scope.entryDate).endOf('day');
        ObjectiveService.get('stepcount',dayStart
        ,dayEnd).then(function(d) {
            if (angular.isDefined(d) && d !== null) {
                if (Object.prototype.toString.call( d ) !== '[object Array]' )
                    d = [d]; // force the value to an array if only one record

                $scope.stepsRecords = d;
                
                //Remove deleted records
                for(var i = 0; i < $scope.stepsRecords.length; ++i)
                {
                    if($scope.stepsRecords[i].state === "deleted")
                    {
                        $scope.stepsDeletes.push($scope.stepsRecords[i]);
                        $scope.stepsRecords.splice(i--,1);
                    }
                }
            } else {
                $scope.stepsRecords = [];
            }
        });
    };
   
    // register for save event
    var unbind = $rootScope.$on('gb.home.dashboard.save', function(){
         
        if($scope.newRecord !== null)
        {
            $scope.autoStoreRecord();
        }
    });
   
    $scope.$on('$destroy', unbind);
}]);
