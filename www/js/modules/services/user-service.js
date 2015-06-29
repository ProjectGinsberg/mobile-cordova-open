angular.module('gb.services')
.service( 'UserService', ['$q','$http','DbService','$rootScope',function($q,$http, DbService, $rootScope) {
    var USER_SIGNUP_URL = 'https://platform.ginsberg.io/account/externalsignup';
    var USER_DISABLE_URL = 'https://platform.ginsberg.io/Diagnostics/DisableAccount';
    var USER_DELETE_URL = 'https://platform.ginsberg.io/Diagnostics/DeleteAccount';
    var USER_PROFILE_URL = 'https://api.ginsberg.io/v1/me';
    var userService = {};

    var userInterestedSections = null;
    /*
        needs to be based on the user settings from the signup process
        hides sections from the data entry tab, if the user doesn't have the
        section in this list
    */
    userService.getDefaultInterestedSections = function() {
        return [{
            section:'alcohol',
            interested: true
        },{
            section:'weight',
            interested: true
        },{
            section:'exercise',
            interested: true
        },{
            section:'nutrition',
            interested: true
        },{
            section:'sleep',
            interested: true
        },{
            section:'steps',
            interested: true
        },{
            section:'journal',
            interested: true
        },{
            section:'wellbeing',
            interested: true
        }];
    };

    userService.getUserInterestedSections = function() {
        if (userInterestedSections === null) {
            if (localStorage.settings) {
                userInterestedSections = JSON.parse(localStorage.settings);
            } else {
                userService.setUserInterestedSectionsToDefault();
                userService.saveSections();
            }
        }
        return userInterestedSections;
    };
    userService.setUserInterestedSectionsToDefault = function() {
        // take a clone of the defaults
        userInterestedSections = JSON.parse(JSON.stringify(userService.getDefaultInterestedSections()));
        return userInterestedSections;
    };
    userService.updateWellbeing = function(wellbeingIds) {
        return $http({
            url:USER_PROFILE_URL,
            method:"GET",
            headers: {
             'Authorization': 'Bearer ' + localStorage.token
            }
        }).
        success(function(data, status, headers, config) {
            // probably want to then push them onto the signin flow
            data.wellbeing_measure_ids = wellbeingIds;
            $http({
                method:"POST",
                url:USER_PROFILE_URL,
                headers: {
                 'Authorization': 'Bearer ' + localStorage.token
                },
                data:data
            }).success(function(data) {
                // updated the users wellbeing questions
                // Sync updated details to rest of system - e.g. ProfileService - Integrate user-service methods into profile-service so dont have to Get before Post
                $rootScope.$broadcast('gb.home.dashboard.sync');
            });
        }).
        error(function(data, status, headers, config) {
            // TODO: decide what to do on failure of the endpoint
            console.log('signup failure');
        });
    };
    userService.createUser = function(firstName,
                                      lastName,
                                      email,
                                      password,
                                      confirmPassword,
                                      wantsNewsletter,
                                      countryId) {

        var payload = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
            confirm_password: confirmPassword,
            country_id: countryId,
            receive_newsletter: wantsNewsletter,
            wellbeing_measure_ids: [1,2,3]
        };
        console.log(payload);
        return $http.post(USER_SIGNUP_URL, payload).
        success(function(data, status, headers, config) {
            // probably want to then push them onto the signin flow
            console.log('signup success');
            console.log(status);
            console.log(data);
        }).
        error(function(data, status, headers, config) {
            // TODO: decide what to do on failure of the endpoint
            console.log('signup failure');
        });
    };
    userService.disableUser = function(email,
                                      password) {

        var payload = {
            email: email,
            password: password
        };
        console.log("Disabling " + email);
        return $http.post(USER_DISABLE_URL, payload);
    };
    userService.deleteUser = function(email,
                                      password) {

        var payload = {
            email: email,
            password: password
        };
        console.log("Deleting " + email);
        return $http.post(USER_DELETE_URL, payload);
    };
    userService.saveSections = function() {
        localStorage.settings = JSON.stringify(userInterestedSections);
    };

    var sortWellbeingQuestions = function(questions) {
        var sortOrder = [8, 11, 14, 7, 17,16, 25,
                         19, 24, 18, 12, 13, 1, 2, 5, 6, 15,
                         3, 4, 9 ,10 ,27 ,28 ,20];

        return questions.sort(function(a,b) {
            if (sortOrder.indexOf(a.id) === -1) return 1;
            if (sortOrder.indexOf(b.id) === -1) return -1;
            if (sortOrder.indexOf(a.id) < sortOrder.indexOf(b.id))
                return -1;
            return 1;
        });
    };
    var wellbeing = [
   {
      "id":1,
      "question":"I've been dealing with problems well"
   },
   {
      "id":2,
      "question":"I've been thinking clearly"
   },
   {
      "id":3,
      "question":"I've been able to make up my own mind about things"
   },
   {
      "id":4,
      "question":"I've been feeling interested in other people"
   },
   {
      "id":5,
      "question":"I've been feeling close to other people"
   },
   {
      "id":6,
      "question":"I've been feeling loved"
   },
   {
      "id":7,
      "question":"I've been feeling relaxed"
   },
   {
      "id":8,
      "question":"I've been feeling I have energy to spare"
   },
   {
      "id":9,
      "question":"I've been feeling so restless that it is hard to sit still"
   },
   {
      "id":10,
      "question":"I've been interested in new things"
   },
   {
      "id":11,
      "question":"I've been feeling cheerful"
   },
   {
      "id":12,
      "question":"I have been happy with the things I've done"
   },
   {
      "id":13,
      "question":"I've been feeling optimistic about the future"
   },
   {
      "id":14,
      "question":"I've been feeling good about myself"
   },
   {
      "id":15,
      "question":"I've been feeling confident"
   },
   {
      "id":16,
      "question":"I've been feeling useful"
   },
   {
      "id":17,
      "question":"I've been feeling able to do things I needed to"
   },
   {
      "id":18,
      "question":"I've been able to achieve the things I want to"
   },
   {
      "id":19,
      "question":"I've been feeling in control"
   },
   {
      "id":20,
      "question":"I've been feeling distressed"
   },
   {
      "id":24,
      "question":"I've been feeling focused"
   },
   {
      "id":25,
      "question":"I've been feeling worried"
   },
   {
      "id":27,
      "question":"I've been feeling purposeful"
   },
   {
      "id":28,
      "question":"I've been feeling irritated"
   }
    ];
   userService.getWellbeingQuestions = function() {
       return sortWellbeingQuestions(wellbeing);
   };

    return userService;
}]);
