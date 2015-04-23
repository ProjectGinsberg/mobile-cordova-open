angular.module('gb.services')
.service('PlatformService', ['$rootScope',function($rootScope) {
    var platformService = {};


    //Add codes for platforms and plugins
    $rootScope.clientId = "G3GFFFD57ED69D9C345E826A749AA86E0CC8F40";
    $rootScope.clientSecret = "43EDFGHBBF026387B64F4EBA4B0F4B335FA844D3";
    $rootScope.localyticsId = "f4b932d387e5427b669c9e1-3c21d1f6-c1a2-11e4-2ddd-004a77f8b47f";
    
    $rootScope.usingNative = false;
    
    
    // Redirect output to onscreen
    var onscreenConsole = false;
         
    (function (original) {
    console.normalLogging = function () {
        console.log = original;
    };
    console.onscreenLogging = function () {
        console.log = showMsg;
    };
    })(console.log);

    (function (original) {
    console.normalInfo = function () {
        console.info = original;
    };
    console.onscreenInfo = function () {
        console.info = showMsg;
    };
    })(console.info);

    (function (original) {
    console.normalWarning = function () {
        console.warn = original;
    };
    console.onscreenWarning = function () {
        console.warn = showMsg;
    };
    })(console.warn);

    $rootScope.switchConsoleOutput = function() {
        onscreenConsole = !onscreenConsole;
        
        if(onscreenConsole)
        {
            console.onscreenLogging();
            console.onscreenWarning();
            console.onscreenInfo();
            
            document.getElementById("debug-output").style.visibility = "visible";
        }
        else
        {
            console.normalLogging();
            console.normalWarning();
            console.normalInfo();
        
            document.getElementById("debug-output").style.visibility = "hidden";
        }
    };
    
    var showMsg = function(msg) {
        var element = document.getElementById("debug-text");
        var currentText = element.innerHTML;
        element.innerHTML = "* " + msg + "<br>" + currentText;
    };
    
    
    /*
    var usingNativeCheck = function() {
        isUsingNative = !(typeof(device) === "undefined" || device.platform.toLowerCase().indexOf("win") === 0
                                                          || device.platform.toLowerCase().indexOf("black") === 0); 
    };
        
    var onDeviceReady = function() {     
        usingNativeCheck();
    };
    */
    
    var checkNative = function() {
        // are we running in native app or in a browser?
        $rootScope.usingNative = false;
        if(document.URL.indexOf("http://") === -1 
           && document.URL.indexOf("https://") === -1
           && document.URL.indexOf("ms-appx://") === -1) 
        {
            $rootScope.usingNative = true;
        }

        /*
        if( window.isphone ) {
            document.addEventListener("deviceready", onDeviceReady, false);
        } else {
            onDeviceReady();
        }
        */
    };
    checkNative();

    return platformService;
}]);
