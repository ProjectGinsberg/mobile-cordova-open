var filters = angular.module('gb.filters');

filters.filter('formatMetricToHuman', function() {
    //TODO: this needs to not be copy/pasted
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

   return function(value, metricName,format) {
       if (!angular.isDefined(value) || isNaN(value)) return "";

       switch (metricName)
       {
           case "sleep": // format in hours and minutes
           return formatTime(value, format);
           default: // default case is just to round the number
           return Math.floor(value);
       }
   };
});
