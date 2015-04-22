angular.module('gb.services')
.service('ObjectiveService', ['$q','$rootScope','$state','Objective','DbService',
    function($q,$rootScope,$state,Objective,DbService) {

    var objectiveService = {};
    
    // Get data from local database
    objectiveService.get = function(type,dateFrom,dateTo) {
        return get(type,dateFrom,dateTo);
    };

    // Save instance of object to local database
    objectiveService.save = function(type,obj,callback) {
        
        //Check if already processed from frontend
        if(obj.state && obj.state !== "dirty") 
        {
            if(callback) callback();
            return;
        }
        
        // ensure valid type, then save
        obj.state = "changed";
        DbService.put(type, obj, callback);
    };

    // Set instance of object to delete in local database
    objectiveService.delete = function(type,obj,callback) {
        
        //Check if stored in database
        if(!obj.key) return;
        
        // ensure correct type then delete
        obj.state = "deleted";
        DbService.put(type, obj, callback);
    };

    // Process data from server and delete in database
    objectiveService.deleteFromRemote = function(type,id) {
        DbService.delete(type, id);
    };
        
    // Process data from server and store in database
    objectiveService.storeFromRemote = function(type,record) {   
        record.state = "synced";
        DbService.put(type, record);
    };


    // Get data from server and store in database
    objectiveService.getRemote = function(type,dateFrom,dateTo) {
        
        console.log("OS:getRemote: Getting " + type + " from " + dateFrom + " to " + dateTo + " token " + localStorage.token);
           
        var p = Objective.query({
            objective:type,
            start: dateFrom,
            end: dateTo
        }).$promise.then(function(d) {
            
            console.log("OS:getRemote: Got response back for " + type);
            
            if (angular.isDefined(d))
            { 
                if(d.length > 0)
                {
                    console.log("Got remote data for " + type);

                    //Create database object for each record
                    for(var i = 0; i < d.length; ++i)
                    {
                        objectiveService.storeFromRemote(type, d[i]);
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
    objectiveService.createNew = function(type) {
        var obj = {};

        switch (type)
        {
            //Objectives
            case "alcohol":
                obj.units = 0;
            break;
            case "exercise":
                obj.activity_type = "";
                obj.timestamp = "0001-01-01T00:00:00Z";
            break;
            case "nutrition":
                obj.calories = 0;
                obj.timestamp = "0001-01-01T00:00:00Z";
            break;
            case "sleep":
                obj.timestamp = "0001-01-01T00:00:00Z";
            break;
            case "stepcount":
                obj.activity_type = "Aggregated";
                obj.step_count = 0;
            break;
            case "weight":
                obj.weight = 0;
            break;
            case "journal":
                obj.entry = null;
                obj.source = "MobileApp";
                obj.timestamp = "0001-01-01T00:00:00Z";
                obj.tags = [];
            break;
            default:
                console.log("Need to add for " + type);
            break;
        }
        return obj;
    };

    // Delete data from server
    objectiveService.deleteRemote = function(type,obj,callback) {
        var o = new Objective();
        o.objective = type;
        o.id = obj.id;
        
        console.log("Deleteing id " + o.id + " type " + type + " for " + JSON.stringify(obj));
            
        var p = o.$delete();
        p.then(function(data)
        {
            console.log("Deleted id " + o.id + " type " + type);
            DbService.delete(type, o.id, callback);
        }, function(error)
        {
            // error handler
            console.log("Could not delete at this time for id " + o.id + " type " + type);
        });

        return p;
    };
    
    // Push data to server
    objectiveService.saveRemote = function(type,obj,callback) {
        var o = new Objective();
        o.objective = type;
        o.timestamp = obj.timestamp;
        o.source = "MobileApp";
        
        switch (type)
        {
        case "stepcount":
            o.step_count = obj.step_count;
            o.activity_type = "Walking";
            break;
        
        case "alcohol":
            o.units = obj.units;
            break;
        
        case "weight":
        case "body":
            o.weight = obj.weight;
            o.objective = "body";
            break;
        
        case "exercise":
            o.objective = "exercise";
            o.activity_type = obj.activity_type;
            break;
        
        case "nutrition":
            o.calories = obj.calories;
            break;
        
        case "sleep":
            o.total_sleep = obj.total_sleep;
            o.quality = { value: obj.quality };
            break;
        
        case "journal":
            o.objective = "events";
            o.entry = obj.entry;
            o.tags = obj.tags;
            if(obj.id) o.id = obj.id;
            break;
        
        default:
            console.log("Add " + type + " to sending types");
            return;
        }
        
        sendData(o, type, obj, callback);    
    };

    // Internal - Get data from local database
    var get = function(type,dateFrom,dateTo) {
        var p = $q.defer();
        DbService.query(type,
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
    var sendData = function(data, type, obj, callback)
    {
        data.timestamp = obj.timestamp;
        //data.id = obj.id;

        console.log("Posting data to server of type " + type + " for " + JSON.stringify(data));
            
        var p = data.$save();
        p.then(function(data)
        {
            obj.id = data.id;
            obj.state = "synced";
            console.log("Posted data to server of type " + type + " for " + JSON.stringify(obj));
            DbService.put(type, obj, callback);
        }, function(error)
        {
            // error handler
            obj.state = "changed";
            DbService.put(type, obj, callback);
        });

        return p;
    };

    return objectiveService;
}]);
