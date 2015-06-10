angular.module('gb.services')
.service('SpinnerService', ['$rootScope', function($rootScope) {
    
    var impl = {};
    
    var timeout;
    var showingSpinner = false;
    
    impl.showSpinner = function() {
        
        if(showingSpinner) return;
        showingSpinner = true;
        
        // show spinner
        impl.show(true);
    };
    
    impl.hideSpinner = function() {
        
        if(!showingSpinner) return;
        showingSpinner = false;
        
        // hide spinner
        impl.show(false);
    };
    
    var active = function() {
        return !(typeof(spinnerplugin) === "undefined" 
                || (typeof(device.platform) !== "undefined" && device.platform !== null && (   device.platform.toLowerCase().indexOf("win") === 0
                                                                 || device.platform.toLowerCase().indexOf("black") === 0) ));
    };
    
    //Only use directly if not using waitingSections counter
    impl.show = function(truth)
    {
        console.log("Showing spinner " + truth);
        
        if(truth && !showingSpinner) 
        {
            showingSpinner = true;
        
            if (!active()) 
            {
                console.log("Showing fake spinner");
                document.getElementById("wait").style.visibility = "visible";
            }
            else
            {
                console.log("Showing real spinner");
                spinnerplugin.show();
            }
            
            if(timeout !== undefined)
            {
                clearTimeout(timeout);
                timeout = undefined;
            }
            
            timeout = setTimeout(function () { impl.show(false); }, 15000);
        }
        else
        if(!truth && showingSpinner)
        {
            showingSpinner = false;
            
            //Incase spinnerplugin is not setup before first call - so native shows non-native spinner
            document.getElementById("wait").style.visibility = "hidden";
            
            if (!active())
            {
            }
            else
            {
                console.log("Hiding real spinner");
                spinnerplugin.hide();
            }
            
            if(timeout !== undefined)
            {
                clearTimeout(timeout);
                timeout = undefined;
            }
        }
            
        console.log("Shown spinner " + truth);
    };
    
    return impl;
}]);
