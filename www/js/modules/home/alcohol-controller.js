angular.module('gb.home')
.controller('AlcoholCtrl', ['$scope','$rootScope','ObjectiveService','SyncService','AnalyticsService',function($scope,$rootScope,ObjectiveService,SyncService,AnalyticsService) {

    $scope.alcoholRecords = [];
    $scope.alcoholDeletes = [];

    $scope.newRecord = null;
    var recordsToProcess = 0;

    //Timer check
    var lastTap = new Date();
    
    $scope.addStoreText = function() {
        return $scope.newRecord === null? "+ Add Alcohol": "Store Alcohol"; 
    };

    $scope.tappedAddStoreRecord = function() {
                
        //Timer check
        var currentTap = new Date();
        var md = currentTap - lastTap;
        if (md < 300) return;
        lastTap = currentTap;
        
        if($scope.newRecord === null)
        {
            AnalyticsService.event('Tapping Add', {'AddData':'Alcohol'});
        }
        else
        {
            AnalyticsService.event('Tapping Stored', {'StoreData':'Alcohol'});
        }
        
        $scope.addRecord();
    };

    $scope.autoStoreRecord = function() {
        AnalyticsService.event('Auto Stored', {'AutoStoreData':'Alcohol'});
        $scope.addRecord();
    };


    $scope.addRecord = function() {
        if ($scope.newRecord !== null) {
            if($scope.newRecord.units && $scope.newRecord.units !== 0)
            {
                if( Object.prototype.toString.call($scope.newRecord.units) === '[object String]' ) {
                    $scope.newRecord.units = parseInt($scope.newRecord.units);
                }

                $scope.alcoholRecords.push($scope.newRecord);
                var index = $scope.alcoholRecords.length - 1;

                AnalyticsService.event('On Save', {'SavedData':'Alcohol'});

                //Store new record to database
                ObjectiveService.save('alcohol',$scope.alcoholRecords[$scope.alcoholRecords.length-1],function() {
                    //Try sending to server
                    SyncService.SyncLocalChangedObjective("alcohol",false,function(newId) {
                        
                        //Get backer server id
                        $scope.alcoholRecords[index].id = newId;
                    });
                });
            }
            $scope.newRecord = null;
        } else {
            AnalyticsService.event('Tapping Add', {'AddData':'Alcohol'});
        
            var obj = ObjectiveService.createNew('alcohol');
            var ts = moment($scope.entryDate);
            ts.hours(moment().hours());
            ts.minutes(moment().minutes());
            ts.seconds(moment().seconds());
            ts.milliseconds(moment().millisecond());
            obj.timestamp = ts;
            //obj.bearCount = 0;
            //obj.wineCount = 0;
            //obj.spiritCount = 0;
            obj.units = 0;
            $scope.newRecord = obj;
        }
    };

    $scope.deleteRecord = function(index) {
        var record = $scope.alcoholRecords[index];

        //Check if stored beyond just front end
        if(record.state)
        {
            //Store up for sending to database on Save
            //$scope.alcoholDeletes.push(record);

            AnalyticsService.event('Tapping Delete', {'Delete Data':'Alcohol'});

            //Set delete in database
            ObjectiveService.delete('alcohol',$scope.alcoholRecords[index],function() {
                //Try deleting on server
                SyncService.SyncLocalChangedObjective("alcohol",false);
            });
        }

        $scope.alcoholRecords.splice(index,1);
    };

    $scope.$watch('entryDate',function(newVal) {
        refreshOnscreen();
    });

    var refreshOnscreen = function()
    {
        //Reset deleted records as moving to new date
        $scope.alcoholDeletes = [];
        //$scope.alcoholRecords = [];
        $scope.newRecord = null;

        var dayStart = moment($scope.entryDate).startOf('day');
        var dayEnd = moment($scope.entryDate).endOf('day');
        ObjectiveService.get('alcohol',dayStart
        ,dayEnd).then(function(d) {
            if (angular.isDefined(d) && d !== null) {
                if (Object.prototype.toString.call( d ) !== '[object Array]' )
                    d = [d]; // force the value to an array if only one record

                $scope.alcoholRecords = d;

                //Remove deleted records
                for(var i = 0; i < $scope.alcoholRecords.length; ++i)
                {
                    if($scope.alcoholRecords[i].state === "deleted")
                    {
                        $scope.alcoholDeletes.push($scope.alcoholRecords[i]);
                        $scope.alcoholRecords.splice(i--,1);
                    }
                }
            } else {
                $scope.alcoholRecords = [];
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

    $scope.getPintsBeer = function(units) {
        return Math.round(units/2.8);
    };
    $scope.getGlassesWine = function(units) {
        return Math.round(units/2.1);
    };

    var fixRange = function () {
        if(!$rootScope.usingNative)
        {
            document.getElementById('alcoholRange').style.paddingRight = '0px';
            document.getElementById('alcoholRange').style.height = '50px';
        }
    };
    fixRange();
}]);
