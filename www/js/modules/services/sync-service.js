angular.module('gb.services')
.service('SyncService', ['$rootScope', 'DbService', 'ObjectiveService', 'WellbeingService', 'ProfileService', 'Login', 'LocalNotificationService', 'Changes', 'SpinnerService',
         function($rootScope, DBService, ObjectiveService, WellbeingService, ProfileService, Login, LocalNotificationService, Changes, SpinnerService) {

    var ss = {};
    
    // Number of changes that need to be sent to server
    var changes = 0;
    // Number of updates to finish from server
    var updates = 0;
    var runningSync = false;
    
    // register for login / startup event
    var unbind = $rootScope.$on('gb.home.login.gainedaccess', function()
    {
        console.log("Sync-Service: Detected login");
        RunSync();
    });
    
    var unbind2 = $rootScope.$on('gb.home.dashboard.sync', function()
    {
        console.log("Sync-Service: Detected sync request");
        RunSync();
    });
    
    
    var RunSync = function() {
        console.log("Sync-Service: Running sync");
        if(localStorage.token && remoteConnection() && !runningSync)
        {
            token = GetToken();
            SyncData();
        }
    };


    ss.start = function()
    {
        var time = 0;
       
        console.log("Watching " + time);
        
        //Get hourly updates
        if(localStorage.token && remoteConnection)
        {
            token = GetToken();
            SyncData();
        }
    };
    
    
    var SyncData = function()
    {
        if(!remoteConnection()) return;
        
        showSpinner(true);
        
        //Get profile
        ss.SyncProfile();
        
        //Send local changes
        changes = 0;
        
        ss.SyncLocalChangedObjective("sleep", true);
        ss.SyncLocalChangedObjective("stepcount", true);
        ss.SyncLocalChangedObjective("alcohol", true);
        ss.SyncLocalChangedObjective("body", true);
        ss.SyncLocalChangedObjective("exercise", true);
        
        ss.SyncLocalChangedObjective("journal", true);
        
        ss.SyncLocalChangedObjective("nutrition", true);
        ss.SyncLocalChangedWellbeing(true);
        
        if(changes === 0) {
            ProcessServerChanges();
        }
    };
    
    // Send local changes to server
    ss.SyncLocalChangedObjective = function(type,getChanges,callback) {
        
        var changed = DBService.changed(type, function(records) 
        {
            if(records && records.length > 0)
            {
                console.log("SS: Sending unsent data of type " + type);
                changes += records.length;
                
                for(var i = 0; i < records.length; ++i)
                {
                    if(records[i].state === "deleted")
                    {
                        //Delete record
                        ObjectiveService.deleteRemote(type, records[i], function(result)
                        {
                            if(--changes === 0 || !getChanges)
                            {
                                if(callback) callback();
                                if(getChanges) ProcessServerChanges();
                            }; 
                        });
                    }
                    else
                    {
                        //Resend record
                        ObjectiveService.saveRemote(type, records[i], function(result)
                        {
                            if(--changes === 0 || !getChanges)
                            {
                                //Return id to latest record
                                if(callback) callback(records[records.length-1].id);
                                if(getChanges) ProcessServerChanges(); 
                            }; 
                        });
                    }
                }
            }
        });
    };
        
    // Send local changes to server
    ss.SyncLocalChangedWellbeing = function(getChanges,callback) {
        
        var changed = DBService.changed("wellbeing", function(records) 
        {
            if(records && records.length > 0)
            {
                console.log("SS: Sending unsent data of type wellbeing");
                changes += records.length;
                
                for(var i = 0; i < records.length; ++i)
                {
                    //Resend record
                    WellbeingService.saveRemote(records[i], function(result)
                    {
                        --changes;
                        
                        if(--changes === 0 || !getChanges)
                        {
                            if(callback) callback();
                            if(getChanges) ProcessServerChanges();
                        }
                    });
                }
            }
        });
    };
             
    //Get changes since last sync
    var ProcessServerChanges = function() {
        
        //Get fresh data if never login
        if(!localStorage.lastChange)
        {
            updates = 9;
            
            DBService.clear("alcohol");
            DBService.clear("events");
            DBService.clear("exercise");
            DBService.clear("nutrition");
            DBService.clear("sleep");
            DBService.clear("stepcount");
            DBService.clear("body");
            DBService.clear("journal");
            DBService.clear("wellbeing");
            
            $rootScope.$broadcast('gb.backend.databaseUpdated');
                    
            ObjectiveService.getRemote("alcohol",null,null);
            ObjectiveService.getRemote("events",null,null);
            ObjectiveService.getRemote("exercise",null,null);
            ObjectiveService.getRemote("nutrition",null,null);
            ObjectiveService.getRemote("sleep",null,null);
            ObjectiveService.getRemote("stepcount",null,null);
            ObjectiveService.getRemote("body",null,null);           
            ObjectiveService.getRemote("events",null,null);           
            WellbeingService.getRemote(null,null);
           
            localStorage.lastChange = GetDateTime(0);
            
            showSpinner(false);
        
            return;
        }
        
        var p = Changes.query({
             start:localStorage.lastChange
        }).$promise.then(function(changes) 
        {
            if (angular.isDefined(changes))
            {
                console.log("SS:SyncData: Got back changes");
                
                // Process changes to local database
                for(var i = 0; i < changes.length; ++i)
                {
                    var change = changes[i];
                    
                    switch(change.DataPointType)
                    {
                        //Handle objective types
                        case "alcohol":
                        case "nutrition":
                        case "activity":
                        case "body":
                        case "sleep":
                        case "journal":
                            
                            if(change.Activity === "DELETED")
                            {
                                //Special updates
                                if(change.DataPointType === "activity")
                                {
                                    var record = JSON.parse(JSON.stringify(change.DataPointValues));
                                
                                    if(record.is_exercise !== undefined && record.is_exercise === 1)
                                    {
                                        change.DataPointType = "exercise";
                                    }
                                    else
                                    if(record.is_step_count !== undefined && record.is_step_count === 1)
                                    {
                                        change.DataPointType = "stepcount";
                                    }
                                }

                                ObjectiveService.deleteFromRemote(change.DataPointType,change.DataPointId);
                            }
                            else
                            {
                                // Create standard objective object from data
                                var record = JSON.parse(JSON.stringify(change.DataPointValues));
                                if(record.userId) delete record.userId;
                     
                                record.id = change.DataPointId;

                                //Special updates
                                if(change.DataPointType === "activity")
                                {
                                    if(record.is_exercise !== undefined && record.is_exercise === 1)
                                    {
                                        change.DataPointType = "exercise";
                                    }
                                    else
                                    if(record.is_step_count !== undefined && record.is_step_count === 1)
                                    {
                                        change.DataPointType = "stepcount";
                                    }

                                    delete record.is_exercise;
                                    delete record.is_step_count;
                                }

                                //Special updates
                                if(change.DataPointType === "sleep")
                                {
                                    if(record.quality !== undefined && record.quality.value !== undefined)
                                    {
                                        var value = record.quality.value;
                                        delete record.quality;
                                        record.quality = value;
                                    }
                                }
                                else
                                if(change.DataPointType === "journal")
                                {
                                    if(record.is_event !== undefined)
                                    {
                                        delete record.is_event;
                                    }
                                    if(record.MIME !== undefined)
                                    {
                                        delete record.MIME;
                                    }
                                }
                                   
                                ObjectiveService.storeFromRemote(change.DataPointType,record);
                            }
                            break;
                            
                        case "wellbeing":
                            if(change.Activity === "DELETED")
                            {
                                WellbeingService.deleteFromRemote(change.DataPointId);
                            }
                            else
                            {
                                // Create standard objective object from data
                                var record = JSON.parse(JSON.stringify(change.DataPointValues));
                                if(record.userId) delete record.userId;
                     
                                record.id = change.DataPointId;
                                   
                                if(record.wellbeingMeasureId !== undefined)
                                {
                                    record.measure_id = record.wellbeingMeasureId;
                                    delete record.wellbeingMeasureId;
                                }
                                   
                                WellbeingService.storeFromRemote(record);
                            }
                            break;
                            
                        default:
                            console.log("Missing type " + change.DataPointType);
                            break;
                    }
                }

                if(changes.length > 0)
                {
                    //TEMP HACK TO REDRAW DISPLAY
                    $rootScope.$broadcast('gb.backend.databaseUpdated');
                }
                
                showSpinner(false);
                localStorage.lastChange = GetDateTime(0);
                
                return changes;
            }
            else
            {
                showSpinner(false);
                return null;
            }
        }, function(error)
        {
            console.log("SS:SyncData: Error getting changes");
            showSpinner(false);
        });
       
        return p;
    };
    
    
    ss.SyncProfile = function()
    {
        var profile = localStorage.profile;
        
        if(profile !== undefined && profile.state === "changed")
        {
            //Send on old version first then get
        }
        else
        {
            ProfileService.getRemote();
        }
    };
    
    
    var GetToken = function(activity)
    {
        return localStorage.token;
    };

		
    /**
      * @brief      Get string of current date and time, given days difference from now
      *
      * @details    Return a string showing the current date and time, after adding the current number of passed days
      *
      * @param      daysDifference  Days different from now. Can be negative.
      *
      * @return     Date and time
      *
      * @retval     String
      */
    var GetDateTime = function(daysDifference)
    {
        console.log("GetDateTime");
        
        var dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        var timeFormat = new SimpleDateFormat("HH:mm:ssZZ");
        var now = new Date();
        
        now.setDate(now.getDate()+daysDifference);

        return dateFormat.format(now)
                + "T" + timeFormat.format(now);
    };


    var GetDateTimeBasic = function(daysDifference, time)
    {
        console.log("GetDateTimeBasic");
        
        var dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        var timeFormat = new SimpleDateFormat("ZZ");
        var now = new Date();

        now.setDate(now.getDate()+daysDifference);

        return dateFormat.format(now)
                   + "T" + (time !== null? time: "")
                   + timeFormat.format(now);
    };


    var GetDateTimeStart = function(daysDifference)
    {
        return GetDateTimeBasic(daysDifference, "00:00:00");
    };


    var GetDateTimeEnd = function(daysDifference)
    {
        return GetDateTimeBasic(daysDifference, "23:59:59");
    };

   
       //Check for internet connection
    var remoteConnection = function()
    {
        if (navigator === undefined || navigator.connection === undefined || typeof(Connection) === "undefined") return true;
        return navigator.connection.type !== Connection.NONE;
    };
    
    
    var showSpinner = function(truth)
    {
        console.log("Showing spinner " + truth);
        runningSync = truth;
      
        SpinnerService.show(truth);
    };
    
    return ss;
}]);
