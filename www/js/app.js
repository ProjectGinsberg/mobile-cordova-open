// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'gb' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'gb.services' is found in services.js
// 'gb.controllers' is found in controllers.js
angular.module('gb', ['ionic','ngCordova', 'gb.home', 'gb.services','gb.signup','gb.aboutme','gb.settings'])

.run(function($ionicPlatform,$cordovaStatusbar) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/))
    if ($cordovaStatusbar) {
        $cordovaStatusbar.overlaysWebView(true);

        $cordovaStatusbar.style(1);

        $cordovaStatusbar.show();
    }
  });
})
.config(['$httpProvider', function ($httpProvider) {
	$httpProvider.interceptors.push('ApiRequestInterceptor');
}])
.factory('ApiRequestInterceptor',
	[
	function() {
		return {
			request: function (config) {
                if (angular.isDefined(localStorage.token)) {
                    config.headers[
                        "Authorization"] = "Bearer " + localStorage.token;
                }
				return config;
			},
			responseError: function(response) {

			}
		};
	}
])
.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
    url: '/dash',
    views: {
        'tab-dash': {
            templateUrl: 'templates/tab-dash.html',
            controller: 'HomeCtrl'
        }
    }
    })
    .state('tab.aboutme', {
    url: '/aboutme',
    views: {
        'tab-aboutme': {
            templateUrl: 'templates/aboutme.html',
            controller: 'AboutMeCtrl'
        }
    }
    })
    .state('tab.thisweek', {
      url:'/thisweek',
      views: {
          'tab-thisweek': {
              templateUrl: 'templates/this-week/this-week.html',
              controller: 'ThisWeekCtrl'
          }
      }
    })
    .state('tab.settings', {
    url: '/settings',
    views: {
        'tab-settings': {
            templateUrl: 'templates/settings.html',
            controller: 'SettingsCtrl'
        }
    }
    })
    .state('what',{
        url:'/tour/what',
        templateUrl: 'templates/tour/tour-what.html',
        controller: 'WhatCtrl'
    })
    .state('welcome',{
        url:'/tour/welcome',
        templateUrl: 'templates/tour/tour-welcome.html',
        controller: 'WhatCtrl'
    })
    .state('signin',{
        url:'/tour/signin',
        templateUrl: 'templates/tour/tour-signin.html'
    })
    .state('signup',{
        url:'/tour/signup',
        templateUrl: 'templates/tour/tour-signup.html'
    })
    .state('track',{
        url:'/tour/track',
        templateUrl: 'templates/tour/tour-track.html',
        controller: 'WelcomeCtrl'
    })
    .state('trackemotion',{
        url:'/tour/trackemotional',
        templateUrl: 'templates/tour/tour-trackemotional.html',
        controller: 'WelcomeCtrl'
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('tour/welcome');
}).config(['$ionicConfigProvider', function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom'); //other values: top
}]);;
