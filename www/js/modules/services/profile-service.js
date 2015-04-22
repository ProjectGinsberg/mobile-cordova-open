angular.module('gb.services')
.service('ProfileService', ['$q','$rootScope','Profile',function($q, $rootScope, Profile) {
    var profileService = {};

    // Get data from local database
    profileService.get = function() {
        return get();
    };
    profileService.getObject = function() {
        var profile = get();
        return (profile !== undefined? JSON.parse(localStorage.profile): undefined);
    };
 
    // Save instance of object to local database
    profileService.save = function(obj) {
        // ensure valid type, then save
        if(!remoteConnection())
        {
            obj.state = "changed";
            localStorage.profile = JSON.stringify(obj);
        }
        else
        {
            saveRemote(obj);
        }
    };

    // Get data from server and store in database
    profileService.getRemote = function() {
        
        console.log("PS:getRemote: Getting profile with token " + localStorage.token);
           
        var p = Profile.query({
        }).$promise.then(function(d) {
            
            console.log("OS:getRemote: Got something back");
            
            if (angular.isDefined(d))
            { 
                console.log("Got remote data for profile");
                
                //Create database object for each record
                profileData = JSON.parse(JSON.stringify(d));

                if (profileData.$$hashKey !== undefined)
                {
                    delete profileData.$$hashKey;
                }
                
                //Check for repeated hashtags
                for(var i = 0; i < profileData.tags_used.length; ++i)
                {
                    for(var j = i+1; j < profileData.tags_used.length; ++j)
                    {
                        if(j !== i && profileData.tags_used[i] === profileData.tags_used[j])
                        {
                            profileData.tags_used.splice(j--,1);
                        }
                    }
                }

                localStorage.profile = JSON.stringify(profileData);
                
                $rootScope.$broadcast('gb.home.profile.updated');

                return d;
            }
            else
                return null;
        });
        return p;
    };

    // Create new instance of object for database entry
    profileService.createNew = function() {
        var obj = {};
        
        obj.first_name = "";
        obj.last_name = "";
        obj.phone_number = "";
        obj.country = "Scotland";
        obj.wellbeing_metrics = [];
        obj.tags_used = [];
        
        return obj;
    };


    //Wellbegin methods
    profileService.getUserWellbeingQuestions = function() {
        if(localStorage.profile !== undefined)
        {
            questions = JSON.parse(localStorage.profile).wellbeing_metrics;
            return questions;
        }
        else
        return [
            {
                id:1,
                question:"I've been feeling interested in other people"
            },
            {
                id:2,
                question:"I've been feeling I have energy to spare"
            },
            {
                id:3,
                question:"I've been feeling able to do things I needed to"
            }
        ];
    };


    //Tag methods
    profileService.getDefaultUserTags = function() {
        tags = [];
        
        if(localStorage.profile !== undefined)
        {
            tags = JSON.parse(localStorage.profile).tags_used;
            
            //Prepend # to tags, and check for duplicates
            for(var i = 0; i < tags.length; ++i)
            {
                var tag = tags[i];
                tags[i] = "#" + tag;

                //Check not already in list
                var dup;
                do
                {
                    dup = tags.indexOf(tag);
                    if(dup !== -1)
                    {
                        tags.splice(dup, 1);
                    }
                }
                while(dup !== -1);
            }
        }
        
        if(tags.length === 0)
        {
            tags =  [
            "#yolo",
            "#work",
            "#play",
            "#ginsberg"
            ]; 
        }
         
        return tags;
    };
    profileService.attemptAutoComplete = function(term) {
        return [

        ];
    };
    var getUserTags = function() {
        return [
        {
            "tag":"#yolo",
            "occurences":5
        },
        {
            "tag":"#work",
            "occurences":2
        }];
    };


    // Internal - Get data from local database
    var get = function() {
        return localStorage.profile;
    };

    
    // Internal - Push data to server
    var saveRemote = function(obj) {
        var p = new Profile();
        //p.country = obj.country;
        if(obj.first_name) p.first_name = obj.first_name;
        //p.id = obj.id;
        if(obj.phone_number) p.phone_number = obj.phone_number;
        //p.receive_newsletter = obj.recieve_newsletter;
        //p.recent_wellbeing_data = obj.recent_wellbeing_data;
        //p.tags_used = obj.tags_used;
        //p.user_since = obj.user_since;
        //p.wellbeing_metrics = obj.wellbeing_metrics;
        
        return sendData(p, obj);
    };

    //Send object data to server
    var sendData = function(data, obj)
    {
        console.log("Posting profile to server with " + JSON.stringify(data));
            
        var p = data.$save();
        p.then(function(data)
        {
            //obj.id = data.id;
            obj.state = "synced";
            console.log("Posted data to server with " + JSON.stringify(obj));
            localStorage.profile = JSON.stringify(obj);
        }, function(error)
        {
            // error handler
            obj.state = "changed";
            localStorage.profile = JSON.stringify(obj);
        });

        return p;
    };

    
    //Check for internet connection
    var remoteConnection = function()
    {
        if (navigator === undefined || navigator.connection === undefined) return true;
        return navigator.connection.type !== Connection.NONE;
    };


    return profileService;
}]);

