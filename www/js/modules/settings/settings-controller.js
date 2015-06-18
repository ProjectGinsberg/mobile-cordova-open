angular.module('gb.settings', ['ngSanitize', 'ngCsv'])
.controller('SettingsCtrl', ['$scope','$rootScope','$ionicModal',
'$state','ProfileService','UserService','LoginService','AnalyticsService',
'LocalNotificationService',
function($scope,$rootScope,$ionicModal,$state,ProfileService,UserService,LoginService,AnalyticsService,LocalNotificationService) {
    $scope.reorderTracking = false;
    $scope.profile = ProfileService.getObject();

    //TODO: This should really come through from the profile service,
    // so that we can unit test/reuse the logic
    $scope.firstNameEntry = ($scope.profile !== undefined? $scope.profile.first_name: "");
    
    $scope.notificationOn = LocalNotificationService.notificationOn();
    $scope.notificationTime = LocalNotificationService.notificationTime();

    var nonNativeTime;
    var clickTimer = new Date().getTime();
    var clickCount = 7;

    $scope.save = function() {
        if ($scope.profile === null) {
            $scope.profile = ProfileService.createNew();
        }
        if($scope.firstNameEntry) $scope.profile.first_name = $scope.firstNameEntry;
        
        AnalyticsService.event('Settings Screen', {'Action':'Save'});

        ProfileService.save($scope.profile);
        UserService.saveSections();

        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/))
        window.plugins.toast.show('Saved!', 'short', 'center', function(a){});
    };
    $scope.logout = function() {
        AnalyticsService.event('Settings Screen', {'Action':'Logout'});

        LoginService.logout();
        $state.go('welcome');
    };
    $scope.loadUserVoice = function() {
        AnalyticsService.event('Settings Screen', {'Action':'Load User Voice'});
        window.open('http://ginsberg.uservoice.com', '_system');
    };
    $scope.loadConnections = function() {
        AnalyticsService.event('Settings Screen', {'Action':'Load Connections'});

        window.open('https://splatform.ginsberg.io/account/myconnections', '_system');
    };


    $scope.showConsole = function() {
        
        var now = new Date().getTime();
        var timesince = now - clickTimer;
   
        if(timesince < 10000)
        {
            --clickCount;
            if(clickCount === 0)
            {
                clickCount = 7;
                $rootScope.switchConsoleOutput();
            }
        }    
        else
        {
            clickCount = 7;
        }
        
        clickTimer = now;
    };
   
   
    $scope.showTimePicker = function() {
        if(!$rootScope.usingNative) return;

        console.log("Showing picker for " + $scope.notificationTime);
        var options = {date: $scope.notificationTime, mode: 'time'};
        if(typeof(datePicker) !== "undefined")
        datePicker.show(options, function(date){
            console.log("Shown date picker " + date);
            if(date !== "cancel")
            {
                $scope.notificationTime = date;
                $scope.$digest();
                if($scope.notificationOn)
                {
                    LocalNotificationService.set($scope.notificationTime);
                }
            }
        });
    };

    $scope.switchNotification = function() {
        $scope.notificationOn = !$scope.notificationOn;

        if($scope.notificationOn)
        {
            LocalNotificationService.set($scope.notificationTime);
        }
        else
        {
            LocalNotificationService.cancel();
        }
    };

    var createTimePicker = function() {
      
      if(!$rootScope.usingNative)
      {
          //Disabled till local notification works on WU
          //delete NotificationCard;
          var element = document.getElementById("NotificationCard");
          element.style.display = 'none';
          return;
          
          delete NativeTime;
          nonNativeTime = new WinJS.UI.TimePicker(NotificationTime, { current: $scope.notificationTime, clock:"24HourClock" });
          nonNativeTime.addEventListener("change",function(info) {
            $scope.notificationTime = nonNativeTime.current;
            if($scope.notificationOn)
            {
                LocalNotificationService.set($scope.notificationTime);
            }
          });
      }
    };
    //document.addEventListener("deviceready", createTimePicker, false);
    createTimePicker();

    var unbind = $rootScope.$on('gb.home.profile.updated', function(){

        $scope.profile = ProfileService.getObject();

        // so that we can unit test/reuse the logic
        $scope.firstNameEntry = ($scope.profile !== undefined? $scope.profile.first_name: "");
    });

    $scope.$on('$destroy', unbind);

    //set up the disable button logic

      $ionicModal.fromTemplateUrl('disable.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.disableModal = modal;
      });
      $scope.openDisableModal = function() {
        $scope.disableModal.show();
      };
      $scope.closeDisableModal = function() {
        disableDisable();
      };
      
      var disableDisable = function() {
        $scope.disableModal.hide();
        
        var scroller = document.getElementById("disableScroll").parentNode;
        scroller.style.webkitTransform = "";
        document.getElementById("CloseEmail").value = "";
        document.getElementById("ClosePassword").value = "";
      };
      
      
       
      // private property
        var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        
      // private method for UTF-8 encoding
        var _utf8_encode = function (string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        };
        
      // public method for encoding
        var encode = function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = _utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

            }

            return output;
        };

        var tempString = "";
        var TotalColumns = 30;
        
        var finishTempLine = function()
        {
            var lines = tempString.split('\n');
            var current = (lines[lines.length-1].length - lines[lines.length-1].replace(new RegExp(',',"g"), '').length);
            var toGo = TotalColumns - current;
            
            var addition = "";
            for(var i = 0; i < toGo; ++i)
            {
                addition += ',';
            }
            
            tempString += addition;
        };
        
        var checkFor = function(key, type, start)
        {
            var i = key.indexOf(type);
            if(i === 0 || i === 1)
            {
                var j = key.indexOf(type + '._');
                if(j !== i)
                {
                    var code = JSON.parse(localStorage.getItem(key));
                    //Extract fields
                    if(start === false)
                    {
                        tempString = "\n";
                        finishTempLine();
                        tempString += "\n";
                        finishTempLine();
                        tempString += "\n" + type;
                        finishTempLine();
                        tempString += "\n";
                        finishTempLine();
                        tempString += "\n";
                        
                        for(var key in code)
                        {
                            tempString += key + ',';
                        }
                        
                        finishTempLine();
                    }
                    else
                    {
                        tempString = "";
                    }
                    
                    tempString += "\n";

                    for(var key in code)
                    {
                        tempString += code[key] + ',';
                    }
                    
                    finishTempLine();
                    
                    return true;
                }
            }  
            
            return false;
        };
        
        
    $scope.exportCSV = function() {
        
        var stringAlcohol = "";
        var stringExercise = "";
        var stringJournal = "";
        var stringNutrition = "";
        var stringSleep = "";
        var stringStepCount = "";
        var stringWeight = "";
        var stringWellbeing = "";
        
        var startedAlcohol = false;
        var startedExercise = false;
        var startedJournal = false;
        var startedNutrition = false;
        var startedSleep = false;
        var startedStepCount = false;
        var startedWeight = false;
        var startedWellbeing = false;
        
        var totalString = "";//Settings:\n" + jsonString(localStorage.settings) 
                       // + "\nProfile:\n"  + jsonString(localStorage.profile);
            
        //var json = JSON.parse(localStorage);
        startedAlcohol = false;
          
          
        for(var key in localStorage)
        {
            if(checkFor(key,"alcohol",startedAlcohol)) { startedAlcohol = true; stringAlcohol += tempString; }
            else if(checkFor(key,"exercise",startedExercise)) { startedExercise = true; stringExercise += tempString; }
            else if(checkFor(key,"journal",startedJournal)) { startedJournal = true; stringJournal += tempString; }
            else if(checkFor(key,"nutrition",startedNutrition)) { startedNutrition = true; stringNutrition += tempString; }
            else if(checkFor(key,"sleep",startedSleep)) { startedSleep = true; stringSleep += tempString; }
            else if(checkFor(key,"stepcount",startedStepCount)) { startedStepCount = true; stringStepCount += tempString; }
            else if(checkFor(key,"weight",startedWeight)) { startedWeight = true; stringWeight += tempString; }
            else if(checkFor(key,"wellbeing",startedWellbeing)) { startedWellbeing = true; stringWellbeing += tempString; }
        }
           
        tempString = "";
        finishTempLine();
        
        totalString += tempString + stringAlcohol + stringExercise + stringJournal + stringNutrition + stringSleep + stringStepCount + stringWeight + stringWellbeing;   
                
        var encoding = encode(totalString);

        cordova.plugins.email.open({
             to:      '',
             subject: 'My Ginsberg Data',
             body:    'See attached Ginsberg Data',
             attachments: 'base64:data.json//'+encoding
        }); 
    };

      
      $scope.exportData = function() {
          return [{a: 1, b:2}, {a:3, b:4}];
      };
      
      $scope.getHeader = function () {
          return ["A", "B"];
      };

      
      var showToast = function(msg) {
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            if (window.plugins !== undefined && window.plugins.toast !== undefined) {
                window.plugins.toast.showShortCenter(msg,
                        function(a){console.log('toast success: ' + a);},
                        function(b){console.log('toast error: ' + b);});
            }
        };
      };
      
      var checkEntries = function() {
        
        var email = document.getElementById("CloseEmail").value;
        var password = document.getElementById("ClosePassword").value;
        
        if(email === undefined || password === undefined || email === "" || password === "")
        {
            showToast("Please enter valid email and password");
            return false;
        }
        
        return true;
      };
      
      $scope.attemptDisable = function() {
        var email = document.getElementById("CloseEmail").value;
        var password = document.getElementById("ClosePassword").value;
        var success = false;

        if(!checkEntries()) return;

        UserService.disableUser(email,password)
                .success(function(data, status, headers, config) {
                    // probably want to then push them onto the signin flow
                    console.log("Disabled account");
                    success = true;
                    disableDisable();
                    LoginService.logout();
                    $state.go('welcome');
                })
                .error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    var here = 1;
                    showToast("Problem disabling account.");
                })
                .then(function(response, r2) {
                    // failed if not success by this point
                    if(!success)
                    {
                        console.log("Did not disable account");
                        showToast("Problem disabling account.");
                    }
                }, 
                function(response) { // optional
                    // failed
                    showToast("Problem disabling account.");
                });
      };
      
      $scope.attemptDelete = function() {
        var email = document.getElementById("CloseEmail").value;
        var password = document.getElementById("ClosePassword").value;
        var success = false;

        if(!checkEntries()) return;
        
        UserService.deleteUser(email,password).success(function(data, status, headers, config) {
                    // probably want to then push them onto the signin flow
                    console.log("Deleted account");
                    success = true;
                    disableDisable();
                    LoginService.logout();
                    $state.go('welcome');
                })
                .error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    var here = 1;
                    showToast("Problem deleting account.");
                })
                .then(function(response, r2) {
                    // failed if not success by this point
                    if(!success)
                    {
                        console.log("Did not delete account");
                        showToast("Problem deleting account.");
                    }
                }, 
                function(response) { // optional
                    // failed
                    showToast("Problem deleting account.");
                });
      };
      
      //Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.disableModal.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function() {
        // Execute action
      });
}]);
