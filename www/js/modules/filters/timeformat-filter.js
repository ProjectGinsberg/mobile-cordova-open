var filters = angular.module('gb.filters');
/**
* Usage: {{ minutes | toHoursAndMinutes:"long" }}
*/
filters.filter('toHoursAndMinutes', function() {
    var formatTime = function(minutes,format) {
        var sign = minutes < 0 ? "-" : "";
        var hours = Math.floor(Math.abs(minutes/60));
        var mins = Math.floor(Math.abs(minutes % 60));
        var output = "";
        if (format == "long") {
            if (hours !== 0) output += hours + " hours ";
            output += mins + " mins";
        } else if (format === 'hours') {
            output += hours + " hrs";
        } else {
            if (hours !== 0) output += hours + "h ";
            output += mins + "m";
        }
        return sign + output;
    };
    return function(minutes, format) {
        if (!angular.isDefined(minutes) || isNaN(minutes)) return "";
        return formatTime(minutes,format);
    };
});
filters.filter('dateToDayString',function() {
	return function(date) {
		return date.format('ddd').toUpperCase();
	};
});

filters.filter('dateToDayNumber',function() {
	return function(date) {
		return date.format('DD');
	};
});
