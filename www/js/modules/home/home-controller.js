angular.module('gb.home')
.controller('HomeCtrl', ['$scope',
                         '$rootScope',
                         'LoginService',
                         'SyncService',
                         'AnalyticsService',
                         'UserService',
                         'AppleWatchService',
                         function($scope,
                            $rootScope,
                            LoginService,
                            SyncService,
                            AnalyticsService,
                            UserService,
                            AppleWatchService) {
    var todayStart = moment().startOf('day');
    var todayEnd = moment().endOf('day');
    var tomorrowStart = moment().startOf('day').add(1,'days');
    var tomorrowEnd =  moment().endOf('day').add(1,'days');
    var yesterdayStart = moment().startOf('day').subtract(1,'days');
    var yesterdayEnd =  moment().endOf('day').subtract(1,'days');
    
    var leftDate = moment();
    
    $scope.dateHelperString = '(Today)';
    $scope.entryDate = new Date();
    $scope.toggleDelete = false;
    $scope.contentLoaded = true;

    //Initial sync
    $rootScope.$broadcast('gb.home.dashboard.sync');

    // FIND BETTER LOCATION? Placed here as will always be setup
    var addClassList = function (name) {

        if (typeof (device) !== "undefined" && device.platform.toLowerCase().indexOf("win") === 0) {
            //Fix missing lists
            var c = document.getElementsByTagName(name);
            for (var i = 0; i < c.length; i++) {
                if (c[i].classList === undefined) {
                    //Fix for Windows Universal crash
                    c[i].classList = {};
                    c[i].classList.contains = function () { return false; };
                    c[i].classList.add = function (a) { };
                    c[i].classList.remove = function (r) { };
                }
            }
        }
    };
    $rootScope.fixScrolling = function () {
        if (typeof (device) !== "undefined" && device.platform.toLowerCase().indexOf("win") === 0) {
            //Fix for size scrolling
            var items = document.getElementsByClassName('item-body');
            for (i = 0; i < items.length; i++) {
                items[i].style.overflow = 'hidden';
            }
        }
    };

    //Call on initial view
    $rootScope.fixScrolling();

    $rootScope.fixSvgs = function()
    {
        addClassList("svg");
        addClassList("rect");
        addClassList("path");
        $rootScope.fixScrolling();
    };

    $scope.resetDates = function() {
        todayStart = moment().startOf('day');
        todayEnd = moment().endOf('day');
        tomorrowStart = moment().startOf('day').add(1,'days');
        tomorrowEnd =  moment().endOf('day').add(1,'days');
        yesterdayStart = moment().startOf('day').subtract(1,'days');
        yesterdayEnd =  moment().endOf('day').subtract(1,'days');

        $scope.dateHelperString = '(Today)';
        $scope.entryDate = new Date();
        $scope.toggleDelete = false;
    };
    
    $scope.$on('$ionicView.leave', function(){
        console.log("HC: IV Leave");
        $scope.save();
    });

    $scope.nextDay = function() {
        $scope.contentLoaded = false;

        setTimeout(function ()
       {
         $scope.$apply(function()
         {
            $scope.save();
            $scope.entryDate = addDays(1);

            var diff = Math.round($scope.entryDate.getTimeSince(new Date())/(24*3600*1000));
            
             if(diff > 0) {   
               AnalyticsService.event('Home Page', {'Action':'ChangeDateForward'});
               AnalyticsService.event('Date Swipe', {'Direction':'Forward','Days':diff});
            }
            
             updateDateHelperString();
            $scope.contentLoaded = true;
         });
     }, 250);
    };
    $scope.prevDay = function() {
        $scope.contentLoaded = false;

        setTimeout(function ()
       {
         $scope.$apply(function()
         {
            $scope.save();
            $scope.entryDate = addDays(-1);

            var diff = Math.round($scope.entryDate.getTimeSince(new Date())/(24*3600*1000));

            if(diff < 0) {   
              AnalyticsService.event('Home Page', {'Action':'ChangeDateBack'});
              AnalyticsService.event('Date Swipe', {'Direction':'Backward','Days':diff});
            }
             
            updateDateHelperString();
           $scope.contentLoaded = true;
         });
     }, 250);
    };
    $scope.login = function() {
        LoginService.login();
        //SyncService.start();
    };
    
    
    
    //iOS test code
    
    //Driver code for own plugin test
    var CustomCamera = {     
            getPicture: function(success, failure){
		cordova.exec(success, failure, "CustomCamera", "openCamera", []);
            }
    };


    function ResearchKitPluginTest() {
        // for possible anserFormats, see ORKAnswerFormat.h
        if(typeof(window.plugins) !== "undefined" && typeof(window.plugins.researchkit) !== "undefined")
        window.plugins.researchkit.survey(
        {
          // I think you'd either choose consent or instruction
          /*'consentSteps': [
            {
              'id': 'consent overview',
              'title': 'overview title',
              'sectionType': 'ORKConsentSectionTypeOverview', // or 'overview'
              'summary': 'overview summary',
              'content': 'overview content' // optional, when 'learn more' is pressed
            },
            {
              'id': 'consent2',
              'title': 'data gathering title',
              'sectionType': 'ORKConsentSectionTypeDataGathering', // or 'dataGathering'
              'summary': 'data gathering summary',
              'htmlContent': '<strong>html</strong> content', // optional
              'content': 'data gathering content' // optional (htmlContent wins if both are set)
            }
          ],*/
          /*
          'instructionSteps': [
            {
              'id': 'instruction1',
              'title': 'instr 1',
              'text': 'instrtext 1'
            },
            {
              'id': 'instruction2',
              'title': 'instr 2',
              'text': 'instrtext 2'
            }
          ],*/
          // for possible anserFormats, see ORKAnswerFormat.h
          'questionSteps': [
            {
              'id': 'q0',
              'title': "I've been feeling relaxed",
              'answerFormat': 'ORKTextChoiceAnswerFormat', // or 'numeric'
              'style': 'MultipleChoice',
              'textChoices': ["Strongly Agree","Agree","Undecided","Disagree","Strongly Disagree"] // optional
            },
            {
              'id': 'q1',
              'title': "I've been feeling good about myself",
              'answerFormat': 'ORKTextChoiceAnswerFormat', // or 'numeric'
              'style': 'MultipleChoice',
              'textChoices': ["Strongly Agree","Agree","Undecided","Disagree","Strongly Disagree"] // optional
            },
            {
              'id': 'q2',
              'title': "I've been feeling able to do things I needed to",
              'answerFormat': 'ORKTextChoiceAnswerFormat', // or 'numeric'
              'style': 'MultipleChoice',
              'textChoices': ["Strongly Agree","Agree","Undecided","Disagree","Strongly Disagree"] // optional
            }
          ]
        },
        function(msg) {alert('ok: ' + JSON.stringify(msg));}, // success handler: results of survey
        function(msg) {alert('not ok: ' + JSON.stringify(msg));} // error handler with errorcode and localised reason
        );
    }
  
    
    //HealthKit plugin test code
    window.onerror = function (a, b, c) {
      alert(a);
      alert(c);
    };
    
    var callback = function (msg) {
      // wrapping in a timeout because of a possbile native UI element blocking the webview
      setTimeout(function () {
        alert(JSON.stringify(msg));
      }, 0);
    };
    
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
  
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    function available() {
        window.plugins.healthkit.available(
            callback,
            callback
        );
    }
    
    function requestAuthorization() {
      window.plugins.healthkit.requestAuthorization(
          {
            'readTypes': ['HKCharacteristicTypeIdentifierDateOfBirth',
              'HKCategoryTypeIdentifierSleepAnalysis', 'HKQuantityTypeIdentifierActiveEnergyBurned', 'HKQuantityTypeIdentifierHeight'],
            'writeTypes': ['HKQuantityTypeIdentifierActiveEnergyBurned', 'HKQuantityTypeIdentifierHeight', 'HKQuantityTypeIdentifierDistanceCycling']
          },
          callback,
          callback
      );
    }
    
    function checkAuthStatus() {
      window.plugins.healthkit.checkAuthStatus(
          {
            'type': 'HKQuantityTypeIdentifierHeight'
          },
          callback,
          callback
      );
    }
    
    function readDateOfBirth() {
      window.plugins.healthkit.readDateOfBirth(
          callback,
          callback
      );
    }

    function readGender() {
      window.plugins.healthkit.readGender(
          callback,
          callback
      );
    }
    
    function saveWeight() {
        window.plugins.healthkit.saveWeight({
              'requestReadPermission': false, // use if your app doesn't need to read
              'unit': 'kg',
              'amount': 78.5,
              'date': new Date() // is 'now', which is the default as well
            },
            callback,
            callback
        );
    }
    
    function readWeight() {
      window.plugins.healthkit.readWeight(
          {
            'requestWritePermission': false, // use if your app doesn't need to write
            'unit': 'kg'
          },
          callback,
          callback
      );
    }
    
    function testWeight() {
        window.plugins.healthkit.saveWeight({
              'requestReadPermission': false, // use if your app doesn't need to read
              'unit': 'kg',
              'amount': 78.5,
              'date': new Date() // is 'now', which is the default as well
            },
            readWeight,
            callback
        );
    }
    
    function saveHeight() {
      window.plugins.healthkit.saveHeight({
            'requestReadPermission': false,
            'unit': 'cm', // m|cm|mm|in|ft
            'amount': 187
          },
          callback,
          callback
      );
    }
    
    function readHeight() {
      window.plugins.healthkit.readHeight({
            'requestWritePermission': false,
            'unit': 'cm' // m|cm|mm|in|ft
          },
          callback,
          callback
      );
    }
    
    function findWorkouts() {
      window.plugins.healthkit.findWorkouts({},
          callback,
          callback
      );
    }
    
    function saveWorkout() {
      window.plugins.healthkit.saveWorkout({
            //'requestReadPermission' : false,
            'activityType': 'HKWorkoutActivityTypeCycling', // HKWorkoutActivityType constant (https://developer.apple.com/library/ios/documentation/HealthKit/Reference/HKWorkout_Class/#//apple_ref/c/tdef/HKWorkoutActivityType)
            'quantityType': 'HKQuantityTypeIdentifierDistanceCycling',
            'startDate': new Date(), // mandatory
            'endDate': null, // optional, use either this or duration
            'duration': 3600, // in seconds, optional, use either this or endDate
            'energy': 300, //
            'energyUnit': 'kcal', // J|cal|kcal
            'distance': 11, // optional
            'distanceUnit': 'km' // probably useful with the former param
            // 'extraData': "", // Not sure how necessary this is
          },
          callback,
          callback
      );
    }
    
    function querySampleType() {
      window.plugins.healthkit.querySampleType(
          {
            'startDate': new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // three days ago
            'endDate': new Date(), // now
            'sampleType': 'HKQuantityTypeIdentifierStepCount', // anything in HealthKit/HKTypeIdentifiers.h
            'unit': 'count' // make sure this is compatible with the sampleType
          },
          callback,
          callback
      );
    }
    
    // this is work in progress
    function monitorSampleType() {
      window.plugins.healthkit.monitorSampleType(
          {
            'sampleType': 'HKCategoryTypeIdentifierSleepAnalysis'
          },
          function (value) {
            // note: setInterval would make more sense here
            setTimeout(function () {
              // lets see if sleep analysis was updated
              alert("Sleep: " + value);
            }, 2000);
          },
          callback
      );
    }
    
    function sumQuantityType() {
        window.plugins.healthkit.sumQuantityType(
            {
              'startDate': new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // three days ago
              'endDate': new Date(), // now
              'sampleType': 'HKQuantityTypeIdentifierStepCount'
            },
            function (value) {
              alert("Success for running step query " + value);
            },
            callback
        );
    }


    
    $scope.sync = function() {
        console.log("Pressed sync button");
        $scope.toggleDelete = false;
        AnalyticsService.event('Home Page', {'Action':'Sync'});
        $rootScope.$broadcast('gb.home.dashboard.sync');
        
        
        //iOS test code
        
        //Call code for own plugin test
        //CustomCamera.getPicture(function(imagePath){
        //    console.log("Native call result: " + imagePath);
	//}, function(){
        //    alert("Photo cancelled");
	//});
        
        //Call code for researchkit plugin test
        //ResearchKitPluginTest();
        
        //Call code for healthkit plugin test
        //available();
        //requestAuthorization();
        //checkAuthStatus();
        //readDateOfBirth();
        //readGender();
        //querySampleType();
        //saveHeight();
        //readHeight();
        //saveWeight();
        //readWeight();
        //  testWeight();
        //saveWorkout();
        //findWorkouts();
        //monitorSampleType();
        //sumQuantityType();
    };
    
    $scope.savediary = function() {
        console.log("Pressed save diary button");
        $rootScope.$broadcast('gb.home.dashboard.savediary');
    };
    
    $scope.save = function() {
        console.log("Pressed save button");
        $scope.toggleDelete = false;
        
        //Dismiss keyboard
        document.activeElement.blur();
        var inputs = document.querySelectorAll('input');
        for(var i=0; i < inputs.length; i++) {
            inputs[i].blur();
        }
        
        $rootScope.$broadcast('gb.home.dashboard.save');

        /* Disabled for now as have per record saving
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            if (window.plugins !== undefined && window.plugins.toast !== undefined) {
            window.plugins.toast.showShortCenter('Saved!',
                function(a){console.log('toast success: ' + a)},
                function(b){alert('toast error: ' + b)});
            }
        }
        */
    };
    $scope.showSection = function(section) {
        var visibleSections = UserService.getUserInterestedSections();
        for (var i = 0; i < visibleSections.length; i++)
        {
            //console.log(JSON.stringify(visibleSections[i]));
            if (visibleSections[i].section === section) {
                return visibleSections[i].interested;
            }
        }
        return false;
    };
    
    $scope.editText = function() {
        return $scope.toggleDelete? "Done" : "Edit";
    };                      
    var addDays = function(days)
    {
        var dat = new Date($scope.entryDate.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    };
    var updateDateHelperString = function() {
        if ($scope.entryDate >= todayStart &&
                $scope.entryDate <= todayEnd) {
            $scope.dateHelperString = '(Today)';
        } else if ($scope.entryDate >= tomorrowStart &&
                $scope.entryDate <= tomorrowEnd) {
            $scope.dateHelperString = '(Tomorrow)';
        } else if ($scope.entryDate >= yesterdayStart &&
                $scope.entryDate <=yesterdayEnd) {
            $scope.dateHelperString = '(Yesterday)';
        } else {
            $scope.dateHelperString = '';
        }
    };
    
    //TEMP HACK TO REDRAW DISPLAY
    var unbind = $rootScope.$on('gb.backend.databaseUpdated', function(){
        $scope.entryDate = addDays(1);
        $scope.entryDate = addDays(-1);
    });

    $scope.$on('$destroy', unbind);

    //Trigger save if moving off tab and onto graphs page
    $scope.$watch('currentTab',function(newVal,prevVal) {
        if(newVal === 'Home')
        {
            $scope.toggleDelete = false;
        }

        if (newVal === 'Graphs' && prevVal === 'Home') {
            $scope.save();
	}
        
        if(newVal !== prevVal)
        {
            AnalyticsService.screen(newVal);
            AnalyticsService.event("Tab Changed",{'tabopen':newVal});
        }
    });
    $scope.$on('$destroy', unbind);

    var onResume = function() {
        var now = moment();
        console.log("HC: Detected Resume from " + leftDate + " to " + now);
        
        if(now.date() !== leftDate.date())
        {
            console.log("HC: Back on different date");
            $scope.resetDates();
        }
    };
    
    var onPause = function() {
        console.log("HC: Detected Pause");
        leftDate = moment();
        $scope.save();
    };
    
    document.addEventListener("resume", onResume, false);
    document.addEventListener("pause", onPause, false);
}]);
