angular.module('gb.home')
.directive('totalWeek',
  function() {
	return {
		restrict: 'E',
		link: function(scope, element, attrs) {

		},
		templateUrl: 'templates/partials/this-week/total-week.html'
	};
});
