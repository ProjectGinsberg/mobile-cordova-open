angular.module('gb.home')
.directive('diaryEntry',
  ['$sce','$log','Journal',function($sce,
                                    $log,
                                    Journal) {
	return {
		restrict: 'E',

		link: function(scope, element, attrs) {
            var content = scope.entry.entryContent;
            if (content !== null) {
    			var x = content.replace(/(^|\s)(#[a-z\d-]+)/ig, "$1<span class='tag' data-tag='$2'>$2</span>");
    			scope.entry.entryContentHtml = $sce.trustAsHtml('<span>'+x+'</span>');
                //console.log(element);
            }
		},
		templateUrl: 'templates/partials/this-week/diary-entry.html'
	};
}]);
