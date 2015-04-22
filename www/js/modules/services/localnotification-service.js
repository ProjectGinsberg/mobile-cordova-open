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
        /*
        if (navigator.userAgent.match(/(iPhone|iPod)/))
        {
            console.log("LN: Checking iOS stuff");

            console.log("LN: Checking iOS hasPermission");
            window.plugin.notification.local.hasPermission(function (granted) {
                console.log("LN: iOS hasPermission " + granted);
                if(granted === true) 
                {
                    console.log("LN: iOS calling notification after permission");
                    setNotification(time);
                }
            });

            console.log("LN: Registering iOS Permissions");
            window.plugin.notification.local.registerPermission(function (granted) {
                console.log("LN: iOS had registered permission " + granted);
                if(granted === true) 
                {
                    console.log("LN: iOS calling notification with permission");
                    setNotification(time);
                }
            });
        }
        else
        {*/
            setNotification(time);
        //}

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

        //window.plugin.notification.local.add({ message: 'Update Great app!' });
        /*
        window.plugin.notification.local.add({
            id: "111",  // A unique id of the notification
          date: _60_seconds_from_now,    // This expects a date object
       message: "Message text",  // The message that is displayed
         title: "Title text",  // The title of the message
        repeat: "hourly",  // Either 'secondly', 'minutely', 'hourly', 'daily', 'weekly', 'monthly' or 'yearly'
         badge: 4,  // Displays number badge to notification
         //sound:      String,  // A sound to be played
         //json:       String,  // Data to be passed through the notification
    autoCancel: true, // Setting this flag and the notification is automatically cancelled when the user clicks it
       ongoing: false // Prevent clearing of notification (Android only)
        });//, callback, scope);
    */    
    };
    
    var onDeviceReady = function() {  
        console.log("LN: Device ready");
    };
    
    document.addEventListener("deviceready", onDeviceReady, false);
    
    return localNotificationService;
}]);

