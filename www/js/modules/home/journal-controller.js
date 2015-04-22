angular.module('gb.home')
.controller('JournalCtrl', ['$scope','$rootScope','ObjectiveService','SyncService','AnalyticsService',function($scope,$rootScope,ObjectiveService,SyncService,AnalyticsService) {
    $scope.journalEntry = null;
    $scope.journalRecord = null;
    $scope.savedEntry = null;
    
    $scope.addTextToEntry = function(text) {
        if ($scope.journalEntry === null)
            $scope.journalEntry = text;
        else
            $scope.journalEntry += ' ' + text;
    };

    $scope.$watch('entryDate',function(newVal) {
        refreshOnscreen();
    });
    
    var refreshOnscreen = function()
    {
        var dayStart = moment($scope.entryDate).startOf('day');
        var dayEnd = moment($scope.entryDate).endOf('day');
        //var dayStart = moment($scope.entryDate, 'ddd MMMM DD YYYY').startOf('day');
        //var dayEnd = moment($scope.entryDate, 'ddd MMMM DD YYYY').endOf('day');

        ObjectiveService.get("journal",dayStart
        ,dayEnd).then(function(d) {
            if (angular.isDefined(d) && d !== null) {
                $scope.journalRecord = d;
                $scope.journalEntry = d.entry;
            } else {
                $scope.journalRecord = null;
                $scope.journalEntry = null;
            }
            
            $scope.savedEntry = $scope.journalEntry;
        });
    };

    $scope.looseFocus = function() {
    //var unbind = $rootScope.$on('gb.home.dashboard.savediary', function(){
        
        if($scope.savedEntry === $scope.journalEntry) return;
        $scope.savedEntry = $scope.journalEntry;
        
        if ($scope.journalRecord === null) {
            $scope.journalRecord = ObjectiveService.createNew("journal");
            $scope.journalRecord.timestamp = $scope.entryDate;
        }
        $scope.journalRecord.entry = $scope.journalEntry;
        
        //Extract tags
        
        //Signify to objective service that the update must be recorded
        if($scope.journalRecord.state) $scope.journalRecord.state = "dirty";
        
        //SaveSpinnerService.showSpinner(); 
        AnalyticsService.event('Tapping Add', {'AddData':'Journal'});

        //Store new record to database
        ObjectiveService.save('journal',$scope.journalRecord,function() {
            //Try sending to server
            SyncService.SyncLocalChangedObjective("journal",false,function(newId) {
                //Get backer server id 
                $scope.journalRecord.id = newId;
                //Sync profile incase of new tags from entry
                SyncService.SyncProfile();
            });
        });
    };
    
    var unbind = $rootScope.$on('gb.home.dashboard.save', function(){
        
        $scope.looseFocus();
    });
    
    $scope.$on('$destroy', unbind);
}]);
