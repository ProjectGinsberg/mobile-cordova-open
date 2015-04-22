var filters = angular.module('gb.filters');

filters.filter('sleepQuality', function() {

    return function(quality) {
        if (angular.isDefined(quality)) {
            switch (quality)
            {
                case 1: return 'Terrible';
                    break;
                case 2: return 'Bad';
                    break;
                case 3: return 'Ok';
                    break;
                case 4: return 'Good';
                    break;
                case 5: return 'Great';
                    break;
            }
        }
    }
});
