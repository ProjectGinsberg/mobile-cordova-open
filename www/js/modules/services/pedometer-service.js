angular.module('gb.services')
.service('PedometerService', ['$q',
function($q, ProfileService) {
    var pedometerService = {};

    var active = false;

    pedometerService.isStepsSupported = function(callback) {
        console.log("Checking pedometer");
        if(typeof(pedometer) !== "undefined" && device.platform.indexOf("iOS") === 0)
        {
            pedometer.isStepCountingAvailable(function() {
                console.log("Pedometer allowed");
                if(callback) callback(true);
            }, function() {
                console.log("Pedometer disallowed");
                if(callback) callback(false);
            });
        }
        else
        {
            return false;
        }
    };
    
    pedometerService.isDistanceSupported = function() {
        console.log("Checking distance");
        if(typeof(pedometer) !== "undefined" && device.platform.indexOf("iOS") === 0)
        {
            pedometer.isDistanceAvailable(function() {
                console.log("Distance allowed");
            }, function() {
                console.log("Distance disallowed");
            });
        }
        else
        {
            return false;
        }
    };
    
    pedometerService.startUpdates = function(callback, error) {
        console.log("Starting updates");
        if(typeof(pedometer) !== "undefined" && device.platform.indexOf("iOS") === 0 && active === false)
        {
            console.log("Pedo starting");
            pedometer.startPedometerUpdates(callback, function(errorResult) {
                console.log("Start error " + errorResult);
                active = false;
            });
            active = true;
        }
    };
    
    pedometerService.stopUpdates = function() {
        console.log("Stopping updates");
        if(typeof(pedometer) !== "undefined" && device.platform.indexOf("iOS") === 0 && active === true)
        {
            console.log("Pedo stopping");
            pedometer.stopPedometerUpdates(function() {
                console.log("Pedometer stop success");
            }, function() {
                console.log("Pedometer stop error");
            });
            active = false;
        }
    };

    return pedometerService;
}]);
