angular.module('gb.settings')
.controller('SettingsCtrl', ['$scope','$rootScope','$ionicModal',
'$state','ProfileService','UserService','LoginService','AnalyticsService',
'LocalNotificationService',
function($scope,$rootScope,$ionicModal,$state,ProfileService,UserService,LoginService,AnalyticsService,LocalNotificationService) {
    $scope.reorderTracking = false;
    $scope.profile = ProfileService.getObject();

    //TODO: This should really come through from the profile service,
    // so that we can unit test/reuse the logic
    $scope.firstNameEntry = ($scope.profile !== undefined? $scope.profile.first_name: "");
    //$scope.lastNameEntry = ($scope.profile !== undefined? $scope.profile.last_name: "");
    //$scope.phoneNumberEntry = ($scope.profile !== undefined? $scope.profile.phone_number: "");

    //$scope.country = 1;
    //$scope.countryName = ($scope.profile !== undefined? $scope.profile.country: "");

    $scope.notificationOn = LocalNotificationService.notificationOn();
    $scope.notificationTime = LocalNotificationService.notificationTime();

    var nonNativeTime;


    $scope.save = function() {
        if ($scope.profile === null) {
            $scope.profile = ProfileService.createNew();
        }
        if($scope.firstNameEntry) $scope.profile.first_name = $scope.firstNameEntry;
        //if($scope.phoneNumberEntry) $scope.profile.phone_number = $scope.phoneNameEntry;

        AnalyticsService.event('Settings Screen', {'Action':'Save'});

        //$scope.profile.firstname = $scope.firstName;
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

        window.open('https://platform.ginsberg.io/account/myconnections', '_system');
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
        //$scope.lastNameEntry = ($scope.profile !== undefined? $scope.profile.last_name: "");
        //$scope.phoneNumberEntry = ($scope.profile !== undefined? $scope.profile.phone_number: "");

        //$scope.country = 1;
        //$scope.countryName = ($scope.profile !== undefined? $scope.profile.country: "");
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
        $scope.disableModal.hide();
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
