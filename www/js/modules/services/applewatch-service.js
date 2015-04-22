angular.module('gb.services')
.service('AppleWatchService', [function() {
    var appleWatchService = {};

    var id;
    

    appleWatchService.sendMessage = function(message) {
        console.log("AW: Send message " + message);
        
        if(typeof(applewatch) === "undefined" || device.platform.toLowerCase().indexOf("ios") !== 0) {
            console.log("AW: Not supported");
            return;
        }
        
        if(id !== undefined)
        {
            console.log("AW: Valid to send message");
            applewatch.sendMessage(message, "testqueue");
            console.log("AW: No error sending");
        }
    };


    var onDeviceReady = function() {  
        console.log("AW: Device ready");
        
        if(typeof(applewatch) === "undefined" || device.platform.toLowerCase().indexOf("ios") !== 0) {
            console.log("AW: Not supported");
            return;
        }
        
        console.log("AW: Found plugin");
        
        applewatch.init(function successHandler(appGroupId) 
        {
            console.log("AW: Success " + appGroupId);
            id = appGroupId;

            applewatch.addListener("testqueue", function(message) {
                console.log("Message received: " + message);
            });

            appleWatchService.sendMessage("test send");
        }, 
        function errorHandler(e) 
        {
            console.log("AW: Found error init");
            console.log(e);
        });
    };
    
    document.addEventListener("deviceready", onDeviceReady, false);
    
    return appleWatchService;
}]);



