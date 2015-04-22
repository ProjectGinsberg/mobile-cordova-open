angular.module('gb.home')
.controller('WeightCtrl', ['$scope','$rootScope','ObjectiveService','SyncService','AnalyticsService',function($scope,$rootScope,ObjectiveService,SyncService,AnalyticsService) {
    
    $scope.weightRecords = [];
    $scope.weightDeletes = [];

    $scope.newRecord = null;
    var recordsToProcess = 0;
    
    //Timer check
    var lastTap = new Date();
    
    $scope.addStoreText = function() {
        return $scope.newRecord === null? "+ Add Weight": "Store Weight"; 
    };

    $scope.tappedAddStoreRecord = function() {
                
        //Timer check
        var currentTap = new Date();
        var md = currentTap - lastTap;
        if (md < 300) return;
        lastTap = currentTap;
        
        if($scope.newRecord === null)
        {
            AnalyticsService.event('Tapping Add', {'AddData':'Weight'});
        }
        else
        {
            AnalyticsService.event('Tapping Stored', {'StoreData':'Weight'});
        }
        
        $scope.addRecord();
    };

    $scope.autoStoreRecord = function() {
        AnalyticsService.event('Auto Stored', {'AutoStoreData':'Weight'});
        $scope.addRecord();
    };


    // Add new steps record to frontend
    $scope.addRecord = function() {
        if ($scope.newRecord !== null) {
            if($scope.newRecord.weight && $scope.newRecord.weight !== 0)
            {
                if( Object.prototype.toString.call($scope.newRecord.weight) === '[object String]' ) {
                    $scope.newRecord.weight = parseInt($scope.newRecord.weight);
                }
                $scope.weightRecords.push($scope.newRecord);
                var index = $scope.weightRecords.length - 1;
            
                AnalyticsService.event('On Save', {'SavedData':'Weight'});

                //Store new record to database
                ObjectiveService.save('weight',$scope.weightRecords[$scope.weightRecords.length-1],function() {
                    //Try sending to server
                    SyncService.SyncLocalChangedObjective("body",false,function(newId) {
                        //Get backer server id 
                        $scope.weightRecords[index].id = newId;
                    });
                });
            }
            $scope.newRecord = null;
        } else {
            var obj = ObjectiveService.createNew('weight');
            delete obj.weight;
            var ts = moment($scope.entryDate);
            ts.hours(moment().hours());
            ts.minutes(moment().minutes());
            ts.seconds(moment().seconds());
            ts.milliseconds(moment().millisecond());
            obj.timestamp = ts;
            $scope.newRecord = obj;
        }
    };
    
    // Delete frontend steps record
    $scope.deleteRecord = function(index) {
        var record = $scope.weightRecords[index];
        
        //Check if stored beyond just front end
        if(record.state)
        {
            //Store up for sending to database on Save
            //$scope.weightDeletes.push(record);
            
            AnalyticsService.event('Tapping Delete', {'Delete Data':'Weight'});

            //Set delete in database
            ObjectiveService.delete('weight',$scope.weightRecords[index],function() {
                //Try deleting on server
                SyncService.SyncLocalChangedObjective("body",false);
            });
        }
        
        $scope.weightRecords.splice(index,1);
    };
                
    $scope.$watch('entryDate',function(newVal) {
        refreshOnscreen();
    });
    
    var refreshOnscreen = function()
    {
        $scope.weightDeletes = [];
        $scope.newRecord = null;
        
        var dayStart = moment($scope.entryDate).startOf('day');
        var dayEnd = moment($scope.entryDate).endOf('day');
        ObjectiveService.get('weight',dayStart
        ,dayEnd).then(function(d) {
             if (angular.isDefined(d) && d !== null) {
                if (Object.prototype.toString.call( d ) !== '[object Array]' )
                    d = [d]; // force the value to an array if only one record

                $scope.weightRecords = d;
                
                //Remove deleted records
                for(var i = 0; i < $scope.weightRecords.length; ++i)
                {
                    if($scope.weightRecords[i].state === "deleted")
                    {
                        $scope.weightDeletes.push($scope.weightRecords[i]);
                        $scope.weightRecords.splice(i--,1);
                    }
                }
            } else {
                $scope.weightRecords = [];
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
