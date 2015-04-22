angular.module('gb.db')
.service('DbService', function() {
    var db = {};

    // Get records for particular database between particular times
    db.query = function(db, query, callback) {
        //console.log(query);

        var q = "record.timestamp < '"+query.dateTo+"' && ";
        q += "record.timestamp > '"+query.dateFrom+"'";

        getDb(db).where(q,function(records) {
            callback(records.length > 0? records: null);
        });
    };

    // Delete record in particular database
    db.delete = function(db, id, callback)
    {
         // Check for current record
        getDb(db).where("record.id == '"+id+"'",function(records) {
            if (records.length > 0)
            {
                var key = records[0].key;
                getDb(db).remove(key, function() {
                    console.log("Removed record " + key); 
                    if(callback) callback();
                });
            }
        });

    };

    // Store record in particular database, overwritting record with same id 
    db.put = function(db, object, callback) {
        clone = JSON.parse(JSON.stringify(object));

        if (clone.$$hashKey !== undefined)
        {
            delete clone.$$hashKey;
        }

        // Check for current record
        var search = (clone.key? "record.key == '"+clone.key+"'": "record.id == '"+clone.id+"'");
                
        getDb(db).where(search,function(record) {
            if (record.length > 0)
            {
                clone.key = record[0].key;
            }
            else
            {
                clone.key = guid();
            }
            
            console.log("Putting record in database " + db + " of " + JSON.stringify(clone));
            object.key = clone.key;
            getDb(db).save(clone, function() {
                if(callback) callback();
            });
        });
    };

    // Get all changed records from particular database
    db.changed = function(db,callback) {
        var q = "record.state != 'synced'";

        return getDb(db).where(q,function(records) {
            callback(records.length > 0? records: null);
        });
    };

    // Empty a particular table
    db.clear = function(externalName) {
        var db = getDbName(externalName);
        
        //Find index - quicker way and is this thread safe?
        for (var i = 0; i < tables.length; i++)
        {
            if(tables[i] === db)
            {
                console.log("db-service: Clearing table " + tables[i]);
                dbs[tables[i]].nuke();

                return;
            }
        }
    };

    var getDbName = function(externalName) {
        var name = externalName;
        
        //Special cases
        if(externalName === 'activity') name = 'exercise';
        else if(externalName === 'body') name = 'weight';
        else if(externalName === 'events') name = 'journal';
        
        return name;
    };
    var getDb = function(externalName) {     
        return dbs[getDbName(externalName)];
    };
    // open up the database tables
    var tables = ['stepcount','alcohol','exercise','weight','nutrition','sleep','journal','wellbeing'];
    var dbs = {};
    for (var i = 0; i < tables.length; i++)
    {
        var table = Lawnchair({name: tables[i] }, function(e){
            //console.log(tables[i] + ' Storage open');
        });
        dbs[tables[i]] = table;
    }
    var firstTimeInit = function() {

    };
    var guid = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
    
    return db;
});
