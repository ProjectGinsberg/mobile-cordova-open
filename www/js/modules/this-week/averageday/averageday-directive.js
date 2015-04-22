angular.module('gb.home')
.directive('averageDay',
  function() {
	return {
		restrict: 'E',
		link: function(scope, element, attrs) {

		},
		templateUrl: 'templates/partials/this-week/average-day.html'
	};
});
