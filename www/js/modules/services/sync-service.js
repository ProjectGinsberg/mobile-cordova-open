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
        //var watcher = window.setInterval(function()
        //{
            console.log("Watching " + time);
        
            //Get latest
            //if(time % (60*60) === 0 && HaveToken())
            //{
                //Get hourly updates
                if(localStorage.token && remoteConnection)
                {
                    token = GetToken();
                    SyncData();
                }
            //}
            
            //Check for sending stuff
            //if(time % )
            
            //Check for
            //if(time >= 1000)
            //{
            //    console.log("Stolling at " + time + " seconds");
            //    clearInterval(watcher);
            //}
            
            //++time;
        //}, 1000);
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
                        //ObjectiveService.getRemote(endPoint,GetDateTimeStart(-7),GetDateTimeStart(1));
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
                    //ObjectiveService.getRemote(endPoint,GetDateTimeStart(-7),GetDateTimeStart(1));
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
                            
                            //TEST BREAKPOINT
                            if(change.DataPointType === "sleep")    
                            {
                                var here = 1;
                            }
                                
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
                //$rootScope.$broadcast('gb.home.profile.updated');

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
    
    

    //
    // Consts
    //

    //private static String baseUrl = "project-ginsberg.com";
    var BASE_URL = "ginsberg.io";

    //Testing
    var HTTPAPI = function() { return "https://api."+BASE_URL; };
    var HTTPWWW = function() { return "https://www."+BASE_URL; };
    var HTTPPLAT = function() { return "https://platform."+BASE_URL; };
    
    /*
    //Release
    var HTTPAPI = function() { return "https://api."+BASE_URL; };
    var HTTPWWW = function() { return "https://www."+BASE_URL; };
    var HTTPPLAT = function() { return "https://platform."+BASE_URL; };
    */

    /*
    //Local
    private static String localPlatformUrl: "http://chriswebtest:16912",
    private static String localAPIUrl: "http://chriswebtest:56924",
    private static String HTTPAPI: localAPIUrl,
    private static String HTTPWWW: "https://www."+baseUrl,
    private static String HTTPPLAT: localPlatformUrl,
    */
    

    //
    // Variables
    //

    //For data
    var token = null;
    //General
    
    //Obtained data
    /**
      *  @brief      Current users numeric id
      */
    var userID = null;

    /**
     *  @brief      Current users numeric id
     */
    var userFirstName = null;
    /**
     *  @brief      Current users numeric id
     */
    var userLastName = null;
    /**
     *  @brief      Current users numeric id
     */
    var userPhoneNumber = null;
    /**
     *  @brief      Current users numeric id
     */
    var userCountry = null;
    /**
     *  @brief      Current users tags
     */
    var countries = null;
    /**
      *  @brief      Current users tags
      */
    var userTags = null;
    /**
     *  @brief      Current users tags
     */
    var userTagsOrdered = null;
    /**
     *  @brief      Current users tags
     */
    var tagsEmotions = null;
    /**
     *  @brief      Current users tags
     */
    var tagsScots = null;
    /**
      *  @brief      Current users subjective questions
      */
    var userQuestions = null;
    /**
      *  @brief      Question ids for questions listed in userQuestions
      */
    var userQuestionsID = null;
    /**
      *  @brief      Current users subjective answers for today
      */
    var userQuestionsToday = null;
    /**
      *  @brief      Current users event id for todays event
      */
    var todaysEventID = -1;
    /**
      *  @brief      Current users event for today
      */
    var todaysEvent = null;
    

    //
    // Setup
    //

    var ClearMemoryStorage = function() 
    {
        countries = null;
        userTags = null;
        userTagsOrdered = null;
        tagsEmotions = null;
        tagsScots = null;
        userQuestions = null;
        userQuestionsID = null;
        userQuestionsToday = null;
    };


    //
    // Token methods
    //

    /**
      * @brief      Check for valid token
      *
      *
      * @return     Truth of if have valid token
      */
    
    //Have token check
    var HaveToken = function()
    {
        return localStorage.token !== undefined && localStorage.token !== null && localStorage.token.length > 1;
    };


    var GetToken = function(activity)
    {
        return localStorage.token;
    };

		
	//
	// Get/Post particulars
	//

    var GetUserCountryID = function()
    {
        if(countries !== null && countries.size() > 200 && userCountry !== null)
        {
            /*
            for(int i = 0; i < countries.size(); ++ i)
            {
                if(countries.get(i).toString().equals(userCountry))
                {
                    return i+1;
                }
            }
            */
        }

        return 1;
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


    var LoadCache = function()
    {
        //Load values
        todaysEventID = localStorage.eventID;
        todaysEvent = localStorage.event;
        userID = localStorage.userID;
        userFirstName = localStorage.userFirstName;
        userLastName = localStorage.userLastName;
        userPhoneNumber = localStorage.userPhoneNumber;
        userCountry = localStorage.userCountry;

        var length = localStorage.countriesLength;
        if(length)
        {
            countries = [];
            for(var i = 0; i < length; ++i)
            {
                countries[i] = localStorage.getItem("countries" + i);
            }
        }

        length = localStorage.userTagLength;
        if(length)
        {
            userTags = [];
            for(var i = 0; i < length; ++i)
            {
                userTags[i] = localStorage.getItem("userTag"+i);
            }
        }

        length = localStorage.userTagOrderedLength;
        if(length)
        {
            userTagsOrdered = [];
            for(var i = 0; i < length; ++i)
            {
                userTagsOrdered[i] = localStorage.getItem("userTagOrdered"+i);
            }
        }

        length = localStorage.tagEmotionsLength;;
        if(length)
        {
            tagsEmotions = [];
            for(var i = 0; i < length; ++i)
            {
                tagsEmotions[i] = localStorage.getItem("tagEmotions" + i);
            }
        }

        length = localStorage.tagScotsLength;
        if(length)
        {
            tagsScots = [];
            for(var i = 0; i < length; ++i)
            {
                tagsScots[i] = localStorage.getItem("tagScots" + i);
            }
        }

        length = localStorage.userQuesLength;
        if(length)
        {
            userQuestions = [];
            for(var i = 0; i < length; ++i)
            {
                userQuestions[i] = localStorage.getItem("userQues"+i);
            }
        }

        length = localStorage.userQuesIDLength;
        if(length)
        {
            userQuestionsID = [];
            for(var i = 0; i < length; ++i)
            {
                userQuestionsID[i] = localStorage.getItem("userQuesID"+i);
            }
        }

        lastSaveDateSubjective = localStorage.lastSubjectiveDate;
        length = localStorage.userQuesTodayLength;
        if(length)
        {
            userQuestionsToday = [];
            for(var i = 0; i < length; ++i)
            {
                userQuestionsToday.add(prefs.getInt("USERQUESTODAY"+i,-1));
            }
        }
        
        return true;
    };


    var SaveCache = function()
    {
        //Save values
        localStorage.eventID = todaysEventID;
        localStorage.event = todaysEvent;

        if(userID)
        {
            localStorage.userID = userID;
        }
    
        if(userFirstName)
        {
            localStorage.userFirstName = userFirstName;
        }

        if(userLastName)
        {
            localStorage.userLastName = userLastName;
        }

        if(userPhoneNumber)
        {
            localStorage.userPhoneNumber = userPhoneNumber;
        }

        if(userCountry)
        {
            localStorage.userCountry = userCountry;
        }

        if(countries)
        {
            localStorage.countriesLength = countries.length;
            for (var i = 0; i < countries.length; ++i)
            {
                localStorage.setItem("countries"+i, countries[i]);
            }
        }

        if(userTags)
        {
            localStorage.userTagsLength = userTags.length;
            for (var i = 0; i < userTags.length; ++i)
            {
                localStorage.setItem("userTags"+i, userTags[i]);
            }
        }

        if(userTagsOrdered)
        {
            localStorage.userTagOrderedLength = userTagsOrdered.length;
            for (var i = 0; i < userTagsOrdered.length; ++i)
            {
                localStorage.setItem("userTagOrdered"+i, userTagsOrdered[i]);
            }
        }

        if(tagsEmotions)
        {
            localStorage.tagEmotionsLength = tagsEmotions.length;
            for (var i = 0; i < tagsEmotions.length; ++i)
            {
                localStorage.setItem("tagEmotions" + i, tagsEmotions[i]);
            }
        }

        if(tagsScots)
        {
            localStorage.tagScotsLength = tagsScots.length;
            for (var i = 0; i < tagsScots.length; ++i)
            {
                localStorage.setItem("tagScots" + i, tagsScots[i]);
            }
        }

        if(userQuestions) 
        {
            localStorage.userQuesLength = userQuestions.length;
            for (var i = 0; i < userQuestions.length; ++i) 
            {
                localStorage.setItem("userQues" + i, userQuestions[i]);
            }
        }

        if(userQuestionsID) 
        {
            userQuestionsID.userQuesIDLength = userQuestionsID.length;
            for (var i = 0; i < userQuestionsID.length; ++i) 
            {
                localStorage.setItem("userQuesID" + i, userQuestionsID[i]);
            }
        }

        if(lastSaveDateSubjective)
        {
            localStorage.lastSubjectiveDate = lastSaveDateSubjective;
        }

        if(userQuestionsToday) 
        {
            localStorage.userQuesTodayLength = userQuestionsToday.length;
            for (var i = 0; i < userQuestionsToday.length; ++i) 
            {
                localStorage.setItem("userQuesToday" + i, userQuestionsToday[i]);
            }
        }
        else
        {
            localStorage.removeItem("userQuesTodayLength");
            for (var i = 0; i < 3; ++i) 
            {
                localStorage.removeItem("userQuesToday" + i);
            }
        }

        return true;
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
