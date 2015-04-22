angular.module('gb.home')
.controller('SleepCtrl', ['$scope','$rootScope','ObjectiveService','SyncService','AnalyticsService',function($scope,$rootScope,ObjectiveService,SyncService,AnalyticsService) {
    var sleepDateTime = moment($scope.entryDate);
    var wakeDateTIme = moment($scope.entryDate);

    $scope.sleepRecords = [];
    $scope.sleepDeletes = [];

    $scope.sleepTime = '';
    $scope.wakeTime = '';
    $scope.sleepQuality = '';
    $scope.newRecord = false;

    var recordsToProcess = 0;
    var nonNativeSleepTime;
    var nonNativeWakeTime;

    //Timer check
    var lastTap = new Date();
    var lastQuality = new Date();
    
    $scope.$watch('entryDate',function(newVal) {
         refreshOnscreen();
    });

    var refreshOnscreen = function()
    {
        //Reset deleted records as moving to new date
        $scope.sleepDeletes = [];

        var dayStart = moment($scope.entryDate).startOf('day');
        var dayEnd = moment($scope.entryDate).endOf('day');
        ObjectiveService.get('sleep',dayStart
        ,dayEnd).then(function(d) {
            if (angular.isDefined(d) && d !== null) {
                if (Object.prototype.toString.call( d ) !== '[object Array]' )
                    d = [d]; // force the value to an array if only one record

                $scope.sleepRecords = d;

                //Remove deleted records
                for(var i = 0; i < $scope.sleepRecords.length; ++i)
                {
                    if($scope.sleepRecords[i].state === "deleted")
                    {
                        $scope.sleepDeletes.push($scope.sleepRecords[i]);
                        $scope.sleepRecords.splice(i--,1);
                    }
                }
            } else {
                $scope.sleepRecords = [];
            }
        });
    };

    $scope.sleepQualityClicked = function(newQuality) {
        
        //Timer check
        var currentTap = new Date();
        var md = currentTap - lastQuality;
        if (md < 300) return;
        lastQuality = currentTap;
        
        if (newQuality === $scope.sleepQuality) {
            $scope.sleepQuality = '';
        } else {
            $scope.sleepQuality = newQuality;
        }
    };
    
    $scope.addStoreText = function() {
        return !$scope.newRecord? "+ Add Sleep": "Store Sleep"; 
    };

    $scope.tappedAddStoreRecord = function() {
                
        //Timer check
        var currentTap = new Date();
        var md = currentTap - lastTap;
        if (md < 300) return;
        lastTap = currentTap;
        
        if($scope.newRecord === null)
        {
            AnalyticsService.event('Tapping Add', {'AddData':'Sleep'});
        }
        else
        {
            AnalyticsService.event('Tapping Stored', {'StoreData':'Sleep'});
        }
        
        $scope.addRecord();
    };

    $scope.autoStoreRecord = function() {
        AnalyticsService.event('Auto Stored', {'AutoStoreData':'Sleep'});
        $scope.addRecord();
    };

    $scope.showSleepTimePicker = function() {  
        if(!$rootScope.usingNative) return;
        console.log("Showing picker");
        var options = {date: $scope.sleepTime, mode: 'time'};      
        if(typeof(datePicker) !== "undefined")
        datePicker.show(options, function(date){
            if(date !== "cancel")
            {
                console.log("Shown date picker");
                $scope.sleepTime = date;
                $scope.$digest();
            }
        });
    };
    
    $scope.showWakeTimePicker = function() {    
        if(!$rootScope.usingNative) return;
        console.log("Showing picker");
        var options = {date: $scope.wakeTime, mode: 'time'};      
        if(typeof(datePicker) !== "undefined")
        datePicker.show(options, function(date){
            if(date !== "cancel")
            {
                console.log("Shown date picker");
                $scope.wakeTime = date;
                $scope.$digest();
            }
        });
    };
    
    $scope.addRecord = function() {
        if ($scope.newRecord === false) {
            $scope.newRecord = true;
            
            $scope.sleepTime = new Date(moment($scope.entryDate).format('YYYY-MM-DD') + 'T23:00:00.000Z');
            $scope.wakeTime = new Date(moment($scope.entryDate).format('YYYY-MM-DD') + 'T07:00:00.000Z');
            
            if(!$rootScope.usingNative)
            {
                nonNativeSleepTime.current = $scope.sleepTime;
                nonNativeWakeTime.current = $scope.wakeTime;
            }
        } else {

            //Check valid
            $scope.newRecord = false;
            
            console.log("ST: " + $scope.sleepTime + " WT: " + $scope.wakeTime);

            //Return if invalid values
            if( $scope.sleepTime === undefined
             || $scope.wakeTime === undefined )
            {
                return;
            }

            var newRecord = ObjectiveService.createNew('sleep');

            var sleepTime = moment($scope.entryDate)
                            .hours($scope.sleepTime.getHours())
                            .minutes($scope.sleepTime.getMinutes());
            var wakeTime = moment($scope.entryDate)
                            .hours($scope.wakeTime.getHours())
                            .minutes($scope.wakeTime.getMinutes());
            if (sleepTime.hour() > 19 ||
                wakeTime < sleepTime) {
                sleepTime.subtract('days',1);
            }
            var quality = null;
            switch ($scope.sleepQuality) {
                case "Terrible":
                    quality = 1;
                    break;
                case "Bad":
                    quality = 2;
                    break;
                case "OK":
                    quality = 3;
                    break;
                case "Good":
                    quality = 4;
                    break;
                case "Great":
                    quality = 5;
                    break;
                default:
                    quality = null;
                    break;
            }
            if (quality !== null) {
                newRecord.quality = quality;
            }
            var diff = wakeTime.diff(sleepTime,'minutes');
            newRecord.total_sleep = diff;
            newRecord.timestamp = moment($scope.entryDate);
            $scope.sleepRecords.push(newRecord);
            var index = $scope.sleepRecords.length - 1;

            AnalyticsService.event('On Save', {'SavedData':'Sleep'});

            //Store new record to database
            ObjectiveService.save('sleep',$scope.sleepRecords[$scope.sleepRecords.length-1],function() {
                //Try sending to server
                SyncService.SyncLocalChangedObjective("sleep",false,function(newId) {
                    //Get backer server id
                    if($scope.sleepRecords && $scope.sleepRecords.length > index && $scope.sleepRecords[index]) $scope.sleepRecords[index].id = newId;
                });
            });
        }
    };

    // Delete frontend steps record
    $scope.deleteRecord = function(index) {
        var record = $scope.sleepRecords[index];

        //Check if stored beyond just front end
        if(record.state)
        {
            AnalyticsService.event('Tapping Delete', {'Delete Data':'Sleep'});

            //Set delete in database
            ObjectiveService.delete('sleep',$scope.sleepRecords[index],function() {
                //Try deleting on server
                SyncService.SyncLocalChangedObjective("sleep",false);
            });
        }

        $scope.sleepRecords.splice(index,1);
    };

    $scope.getSleepQualityClass = function(quality) {
        switch (quality) {
            case 1:
                return "button-terrible";
            case 2:
                return "button-bad";
            case 3:
                return "button-ok";
            case 4:
                return "button-good";
            case 5:
                return "button-great";
            default:
                return 0;
        }
    };

    var unbind = $rootScope.$on('gb.home.dashboard.save', function(){

        //Finish current entry if entered data for
        if($scope.newRecord) $scope.autoStoreRecord();
    });

    $scope.$on('$destroy', unbind);

    $scope.$watch('record.units',function(newVal) {
        console.log("Changing units");
    });
    
    var createTimePicker = function() {
      if(!$rootScope.usingNative) 
      {
          delete NativeSleepTime;
          delete NativeWakeTime;
          
          nonNativeSleepTime = new WinJS.UI.TimePicker(SleepTime, { current: new Date(moment($scope.entryDate).format('YYYY-MM-DD') + 'T23:00:00.000Z'), clock:"24HourClock" });
          nonNativeWakeTime = new WinJS.UI.TimePicker(WakeTime, { current: new Date(moment($scope.entryDate).format('YYYY-MM-DD') + 'T07:00:00.000Z'), clock:"24HourClock" });
          
          nonNativeSleepTime.addEventListener("change",function(info) {
            $scope.sleepTime.setHours(nonNativeSleepTime.current.getHours());
            $scope.sleepTime.setMinutes(nonNativeSleepTime.current.getMinutes());
          });
          
          nonNativeWakeTime.addEventListener("change",function(info) {
            $scope.wakeTime.setHours(nonNativeWakeTime.current.getHours());
            $scope.wakeTime.setMinutes(nonNativeWakeTime.current.getMinutes());
           });
       }
    };
    createTimePicker();
}]);
