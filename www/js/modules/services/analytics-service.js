angular.module('gb.services')
.service('AnalyticsService', ['$rootScope', 'PlatformService', function($rootScope,PlatformService) {
    var analyticsService = {};

    var localyticsSession;
        
    var usingNative = function() {
        var native = $rootScope.usingNative;
        
        if(!native && localyticsSession === undefined)
        {
            localyticsSession = LocalyticsSession($rootScope.localyticsId); //Mood app
            localyticsSession.open();
            localyticsSession.upload();
            
            console.log("LC set to JS version");
        }
        
        return native;
    };
        
    var onDeviceReady = function() {     
        if(usingNative())
        {    
            Localytics.init($rootScope.localyticsId);
            Localytics.resume();                
            Localytics.upload();
        
            console.log("LC set to Native version");
        }
        else
        {
        }
    };
    
    analyticsService.event = function(event, params) {
        console.log("Detected event");
        
        if (usingNative())
        {
            Localytics.tagEvent(event, params,  0);
        }
        else
        {
            localyticsSession.tagEvent(event, params);
        }
    };
    
    analyticsService.screen = function(name) {
        console.log("Detected screen");
        if (usingNative())
        {
            Localytics.tagScreen(name);
        }
        else
        {
            localyticsSession.tagScreen(name);
        }
    };
    
    var onResume = function() {
        console.log("Detected Resume");
        if(usingNative())
        {     
            Localytics.resume();
            Localytics.upload();   
        }
        else
        {
            localyticsSession.open();
            localyticsSession.upload();
        }
    };
    
    var onPause = function() {
        console.log("Detected Pause");
        if (typeof(Localytics) === "undefined" || device.platform.toLowerCase().indexOf("win") === 0
                                               || device.platform.toLowerCase().indexOf("black") === 0) 
        {
            console.log("LC not setup!");
            return;
        }
        if(usingNative())
        {
            Localytics.close();
            Localytics.upload();
        }
        else
        {
            localyticsSession.close();
            localyticsSession.upload();
        }
    };
    
    document.addEventListener("deviceready", onDeviceReady, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("pause", onPause, false);
    
    return analyticsService;
}]);

