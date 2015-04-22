angular.module('gb.services')
.service('LocalNotificationService', [function() {
    var localNotificationService = {};

    localNotificationService.notificationTime = function() {
        delete localStorage.notificationTime;
        
        if(!localStorage.notificationTime)
        {
            localStorage.notificationTime = moment().format('YYYY-MM-DD') + 'T20:00:00.000Z';
        }
        
        return new Date(localStorage.notificationTime);
    };

    localNotificationService.notificationOn = function() {
         return localStorage.notificationOn? localStorage.notificationOn: false;
    };

    localNotificationService.cancel = function() {
        
        console.log("LN: Cancelling");

        localStorage.notificationOn = false;
        
        if(typeof(window.plugin) !== "undefined")// && device.platform.toLowerCase().indexOf("win") !== 0)
        {
            console.log("LN: Starting Cancelling");
            
            // Schedule notification for tomorrow to remember about the meeting
            window.plugin.notification.local.cancel(1, function() {
                console.log("LN: Cancelled");
            });
        }
    };
    
    localNotificationService.set = function(time)
    {
        setNotification(time);
        console.log("LN: Done setting notification");
    };
    
    var setNotification = function(time) {
    
        console.log("LN: Setting up notification at " + time);

        localStorage.notificationTime = time;
        
        // Schedule notification for tomorrow to remember about the meeting
        if(typeof(window.plugin) !== "undefined")// && device.platform.toLowerCase().indexOf("win") !== 0)
        {
            window.plugin.notification.local.schedule({
                                id: 1,
                            title: "Ginsberg Reminder",
                              text: "Enter Ginsberg data for today.",
                              firstAt: time,
                              every: "day"
                        });
        }
                    
        console.log("LN: Finished");
    };
    
    var onDeviceReady = function() {  
        console.log("LN: Device ready");
    };
    
    document.addEventListener("deviceready", onDeviceReady, false);
    
    return localNotificationService;
}]);

