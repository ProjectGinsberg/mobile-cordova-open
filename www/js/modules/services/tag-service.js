angular.module('gb.services')
.service('TagService', ['$q','ProfileService',
function($q, ProfileService) {
    var tagService = {};

    tagService.getDefaultUserTags = function() {
        return ProfileService.getDefaultUserTags();
    };

    tagService.attemptAutoComplete = function(term) {
        return [

        ];
    };

    return tagService;
}]);
