angular.module('gb.home')
.controller('DiaryController',
	['$scope','Journal','ThisWeekPeriodSelection','UserService',function($scope,Journal,ThisWeekPeriodSelection,UserService) {
		var addMissingDays = function(entries,start,end) {
			var findDay = function(date) {
				for (var i = 0; i < entries.length; i++)
				{
					var entryDay = entries[i].entryDay;
					if (entryDay.isSame(date,'day'))
						return true;
				}
				return false;
			};
			var currentDay = start.clone();
			var newEntries = [];
			while (!currentDay.isSame(end,'day'))
			{
				if (findDay(currentDay) === false) {
						// add an empty entry for this day
						newEntries.push({
							entryDay: currentDay.clone(),
							entryContent: null
						})
				}
				currentDay.add(1,'days');
			}
			if (newEntries.length > 0) {
				newEntries.forEach(function(e) {
						entries.push(e);
				});
			}
		};
		var getForPeriod = function(period) {
			var startDate = period.start;
			var endDate = period.end;

			Journal.query(
			{
				start: endDate,
				end: startDate
			},
			function(data) {
				console.log(data);
				var entries = [];
				data.forEach(function(d) {
					entries.push({
						entryDay: moment(d.timestamp),
						entryContent: d.entry
					});
				});
				// sort the entries oldest to newest
				addMissingDays(entries,moment(endDate),moment(startDate).add(1,'days'));
				// with blank posts	and fill in any gaps
				entries.sort(function(a,b) {
					return a.entryDay.diff(b.entryDay);
				});

				$scope.entries = entries;
			},
			function(e) {
				$scope.eventData = [];
			});
		};

		$scope.$watch('weekStart',function() {
			getForPeriod({
				end:$scope.weekStart,
				start:$scope.weekEnd
			})
		});
		$scope.$watch('currentTab',function(newVal) {
			if (newVal === 'This Week') {
				getForPeriod({
					end:$scope.weekStart,
					start:$scope.weekEnd
				})
			}
		});
		$scope.trusted = function(html) {
			return $sce.trustAsHtml(html);
		};
}]);
