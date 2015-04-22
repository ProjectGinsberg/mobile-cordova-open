angular.module('gb.services')
.service('WellbeingService', ['$q','$rootScope','DbService','ProfileService','Wellbeing',function($q,$rootScope,DbService,ProfileService,Wellbeing) {
    var wellbeingService = {};


    // Get data from local database
    wellbeingService.get = function(dateFrom,dateTo) {
        return get(dateFrom,dateTo);
    };
    
    /*
        this needs to pull the questions from the equivalent of the user
        profile and contain the question text and ID of the question.
        For testing i'll return a constant set of 3 questions
    */
    wellbeingService.getUserWellbeingQuestions = function(index) {
        if(index !== undefined)
        {
            var questions = ProfileService.getUserWellbeingQuestions();
            
            if(questions === undefined) return "";
            
            if(index < questions.length)
            {
                return questions[index].question;
            }
            
            return "Question " + (index + 1);
        }
        else
        {
            return ProfileService.getUserWellbeingQuestions();
        }
    };

    // Save instance of object to local database
    wellbeingService.save = function(obj,callback) {
        
        //Check if already processed from frontend
        if(obj.state && obj.state !== "dirty")
        {
            if(callback) callback();
            return;
        }
        
        // ensure valid type, then save
        obj.state = "changed";
        DbService.put("wellbeing", obj, callback);
    };

    // Process data from server and delete in database
    wellbeingService.deleteFromRemote = function(id) {
        DbService.delete("wellbeing", id);
    };
    
    // Process data from server and store in database
    wellbeingService.storeFromRemote = function(record) {   
        record.state = "synced";
        DbService.put("wellbeing", record);
    };
    
    // Get data from server and store in database
    wellbeingService.getRemote = function(dateFrom,dateTo) {
        
        console.log("OS:getRemote: Getting wellbeing from " + dateFrom + " to " + dateTo + " token " + localStorage.token);
           
        var p = Wellbeing.query({
            start: dateFrom,//.format('YYYY-MM-DD HH:mm'),
            end: dateTo//.format('YYYY-MM-DD HH:mm')
        }).$promise.then(function(d) {
            
            console.log("OS:getRemote: Got something back");
            
            if (angular.isDefined(d))
            { 
                if(d.length > 0)
                {
                    console.log("Got remote data for wellbeing");
                
                    //Create database object for each record
                    for(var i = 0; i < d.length; ++i)
                    {
                        wellbeingService.storeFromRemote(d[i]);
                    }

                    //TEMP HACK TO REDRAW DISPLAY
                    $rootScope.$broadcast('gb.backend.databaseUpdated');
                }
                
                return d[0];
            }
            else
                return null;
        });
        return p;
    };

    // Create new instance of object for database entry
    wellbeingService.createNew = function(questionId) {
        return {
            "value":        null,
            "timestamp":    null,
            "measure_id":   questionId
        };
    };
 
    // Internal - Push data to server
    wellbeingService.saveRemote = function(obj,callback) {
        var w = new Wellbeing();
        w.value = obj.value;
        w.measure_id = obj.measure_id;
        if(obj.measure) w.measure = obj.measure;
        if(obj.id) w.id = obj.id;
        
        sendData(w, obj, callback);
    };
    
    // Internal - Get data from local database
    var get = function(dateFrom,dateTo) {
        var p = $q.defer();
        DbService.query("wellbeing",
            {
                'dateFrom':dateFrom.toISOString(),
                'dateTo':dateTo.toISOString()
            },
            function(results) {
                if (results !== null && results.length === 1)
                    p.resolve(results[0]);
                else if (results !== null)
                    p.resolve(results);
                p.resolve(null);
            });
            return p.promise;
    };

    // Internal - Send object data to server
    var sendData = function(data, obj, callback)
    {
        data.timestamp = obj.timestamp;
        //data.id = obj.id;
        //data.measure = "I've been feeling cheerful";

        console.log("Posting data to server of type wellbeing for " + JSON.stringify(data));
            
        var p = null;
        
        if(data.id && obj.state === "changed")
        {
            p = data.$update();
        }
        else
        {
            p = data.$save();
        }
        p.then(function(result)
        {
            obj.id = result.id;
            obj.state = "synced";
            console.log("Posted data to server of type wellbeing for " + JSON.stringify(obj));
            DbService.put("wellbeing", obj, callback);
        }, function(error)
        {
            // error handler
            obj.state = "changed";
            DbService.put("wellbeing", obj, callback);
        });

        return p;
    };


    return wellbeingService;
}]);
