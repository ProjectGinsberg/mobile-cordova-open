angular.module('gb.home')
.controller('NutritionCtrl', ['$scope','$rootScope','ObjectiveService','SyncService','AnalyticsService',function($scope,$rootScope,ObjectiveService,SyncService,AnalyticsService) {
    $scope.nutritionRecords = [];
    $scope.nutritionDeletes = [];

    $scope.newRecord = null;

    var recordsToProcess = 0;
     
    //Timer check
    var lastTap = new Date();
    
    $scope.addStoreText = function() {
        return $scope.newRecord === null? "+ Add Meal": "Store Meal"; 
    };

    $scope.tappedAddStoreRecord = function() {
                
        //Timer check
        var currentTap = new Date();
        var md = currentTap - lastTap;
        if (md < 300) return;
        lastTap = currentTap;
        
        if($scope.newRecord === null)
        {
            AnalyticsService.event('Tapping Add', {'AddData':'Nutrition'});
        }
        else
        {
            AnalyticsService.event('Tapping Stored', {'StoreData':'Nutrition'});
        }
        
        $scope.addRecord();
    };

    $scope.autoStoreRecord = function() {
        AnalyticsService.event('Auto Stored', {'AutoStoreData':'Nutrition'});
        $scope.addRecord();
    };

    
    // Add new steps record to frontend
    $scope.addRecord = function() {
        if ($scope.newRecord !== null) {
            if($scope.newRecord.calories && $scope.newRecord.calories !== 0)
            {
                if( Object.prototype.toString.call($scope.newRecord.calories) === '[object String]' ) {
                    $scope.newRecord.calories = parseInt($scope.newRecord.calories);
                }

                $scope.nutritionRecords.push($scope.newRecord);
                var index = $scope.nutritionRecords.length - 1;
            
                AnalyticsService.event('On Save', {'SavedData':'Nutrition'});

                //Store new record to database
                ObjectiveService.save('nutrition',$scope.nutritionRecords[$scope.nutritionRecords.length-1],function() {
                    //Try sending to server
                    SyncService.SyncLocalChangedObjective("nutrition",false,function(newId) {
                        //Get backer server id 
                        $scope.nutritionRecords[index].id = newId;
                    });
                });
            }
            $scope.newRecord = null;
        } else {
            var obj = ObjectiveService.createNew('nutrition');
            delete obj.calories;
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
        var record = $scope.nutritionRecords[index];
        
        //Check if stored beyond just front end
        if(record.state)
        {
            AnalyticsService.event('Tapping Delete', {'Delete Data':'Nutrition'});

            //Set delete in database
            ObjectiveService.delete('nutrition',$scope.nutritionRecords[index],function() {
                //Try deleting on server
                SyncService.SyncLocalChangedObjective("nutrition",false);
            });
        }
        
        $scope.nutritionRecords.splice(index,1);
    };
    
    $scope.$watch('entryDate',function(newVal) {
        refreshOnscreen();
    });
    
    var refreshOnscreen = function()
    {
        //Reset deleted records as moving to new date
        $scope.nutritionDeletes = [];
        $scope.newRecord = null;
            
        var dayStart = moment($scope.entryDate).startOf('day');
        var dayEnd = moment($scope.entryDate).endOf('day');
        ObjectiveService.get('nutrition',dayStart
        ,dayEnd).then(function(d) {
            if (angular.isDefined(d) && d !== null) {
                if (Object.prototype.toString.call( d ) !== '[object Array]' )
                    d = [d]; // force the value to an array if only one record

                $scope.nutritionRecords = d;
                
                //Remove deleted records
                for(var i = 0; i < $scope.nutritionRecords.length; ++i)
                {
                    if($scope.nutritionRecords[i].state === "deleted")
                    {
                        $scope.nutritionDeletes.push($scope.nutritionRecords[i]);
                        $scope.nutritionRecords.splice(i--,1);
                    }
                }
            } else {
                $scope.nutritionRecords = [];
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
