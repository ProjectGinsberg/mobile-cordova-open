angular.module('gb.services')
.service('JournalService', ['$q','DbService',function($q,DbService) {
    var journalService = {};

    journalService.get = function(dateFrom,dateTo) {
        return get(dateFrom,dateTo);
    };
    journalService.save = function(obj) {
        // ensure that only one journal record exists per day
        journalService.get(moment(obj.timestamp).startOf('day'),
                           moment(obj.timestmap).endOf('day')).then(function(record) {
                               if (record === null) {
                                   DbService.put('journal',
                                       obj);
                               } else {
                                   record.tags = obj.tags;
                                   record.entry = obj.entry;
                                   DbService.put(record);
                               }
                           });
        // ensure valid type, then save

    };
    journalService.createNew = function() {
        return {
            entry:null,
            source:"MobileApp",
            timestamp:null,
            tags:[]
        };
    };

    var get = function(dateFrom,dateTo) {
        var p = $q.defer();
        DbService.query('journal',
            {
                'dateFrom':dateFrom.toISOString(),
                'dateTo':dateTo.toISOString()
            },
            function(results) {
                if (results !== null && results.length === 1)
                    p.resolve(results[0]); // only allow one journal record
                                           // per day
                p.resolve(null);
            });
        return p.promise;
    };
    return journalService;
}]);
