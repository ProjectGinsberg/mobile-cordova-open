angular.module('gb.aboutme')
.controller('AboutMeCtrl', ['$scope','$rootScope','UserService','AnalyticsService','SpinnerService','AppleWatchService',function($scope,$rootScope,UserService,AnalyticsService,SpinnerService,AppleWatchService) {

    // Used for calculating date ticks
    var startDateMonth = moment().subtract(1, 'months').add(7, "days");
    var startDateThreeMonth = moment().subtract(2, 'months');
    var startDateSixMonth = moment().subtract(5, 'months');
    var startDateTwelveMonth = moment().subtract(1, 'years').add(1,"months");

    //Used for deciding pre text for date
    var thisMonthStart = moment().startOf('month');
    var thisMonthEnd = moment().endOf('month');
    var nextMonthStart = moment().startOf('month').add(1,'month');
    var nextMonthEnd =  moment().endOf('month').add(1,'month');
    var lastMonthStart = moment().startOf('month').subtract(1,'month');
    var lastMonthEnd =  moment().endOf('month').subtract(1,'month');

    $scope.showRecent = true;
    //Shared date labels
    $scope.cachedDays = [];
    $scope.cachedDate = new Date();

    $scope.dateHelperString = '(This Month)';
    $scope.entryDate = new Date();

    $scope.selected ='7d';
    
    $scope.days = 7;
    var originalDays = 7;
    
    
    $scope.getArray = function(start,length)
    {
        var foo = [];
        for (var i = start; i < start+length; i++) {
            foo.push(i);
        }
        return foo;
    };
    $scope.xDomain = $scope.getArray(0,7);
    

    $scope.nextMonth = function() {
        if($scope.showRecent) return;
        clearMemory();
        $scope.entryDate = addMonths(1);
        updateDateHelperString();
    };
    $scope.prevMonth = function() {
        if($scope.showRecent) return;
        clearMemory();
        $scope.entryDate = addMonths(-1);
        updateDateHelperString();
    };


    // Switch between recent and month graph displays
    $scope.changeToRecent = function(truth)
    {
        $scope.showRecent = truth;
        
        clearMemory();
        
        if($scope.showRecent)
        {
            switch($scope.selected)
            {
                case '7d': $scope.setDays(7); break;
                case '1m': $scope.setMonths(1,false); break;
                case '3m': $scope.setMonths(3,false); break;
                case '6m': $scope.setMonths(6,false); break;
                case '12m': $scope.setMonths(12,false); break;
            }
            
            $scope.entryDate = new Date();
        }
        else
        {
            //Reset date
            $scope.setMonths(1,false);
            $scope.entryDate = moment().endOf('month').toDate();
        }
    };


    // Set recent days and months to display
    $scope.setDays = function(total) {
        clearMemory();
        fixDays(7);
        $rootScope.$broadcast('gb.aboutme.dashboard.days');
        AnalyticsService.event('Graph Page', {'GraphChange':"7 days"});
    };
    $scope.setMonths = function(total,update) {
        clearMemory();
        fixDays(total*30);
        if(update !== false) $rootScope.$broadcast('gb.aboutme.dashboard.days');
        
        var months = '1 month';
        switch(total)
        {
            case 3: months = '3 month'; break;
            case 6: months = '6 month'; break;
            case 12: months = '1 year'; break;
        };
        
        AnalyticsService.event('Graph Page', {'GraphChange':months});
    };


    // Get values to display along x-axis
    $scope.getTick = function(d)
    {
        //Skip fractions
        if(d % 1 !== 0) return null;

        //Cache up for speed
        if($scope.cachedDays.length !== $scope.days || $scope.cachedDate !== $scope.entryDate)
        {
            $scope.cachedDays = new Array($scope.days);
            $scope.cachedDate = $scope.entryDate;
            
            //Reset date markers
            if($scope.showRecent)
            {
                startDateMonth = moment().subtract(1, 'months').add(7, "days");
            }
            else
            {
                startDateMonth = moment($scope.entryDate).startOf('month').add(7, "days");
            }
        }

        if($scope.cachedDays[d] === undefined)
        {
            var fromNow = ($scope.days-1)-d;

            if(!$scope.showRecent)
            {
                if(fromNow%7 === 0)
                {
                    var day;
                    var date = moment($scope.entryDate).subtract(fromNow,'days');
                    if(date.format("D MMM") === startDateMonth.format("D MMM")) {
                         day = date.format("D MMM");
                    }
                    else if (date.format("D") < 7 ) {
                        day = date.format("D MMM");
                    }
                    else {
                         day = date.format("D");
                    }

                    $scope.cachedDays[d] = day;
                }
                else
                {
                    $scope.cachedDays[d] = null;
                }
            }
            else
            {
                if(originalDays === 7)
                {
                    var date = moment().subtract(fromNow,'days');
                    var day = date.format("dd")[0];
                    $scope.cachedDays[d] = day;
                }
                else
                if(originalDays === 30)
                {
                    if(fromNow%7 === 0)
                    {
                        var day;
                        var date = moment().subtract(fromNow,'days');
                        if(date.format("D MMM") === startDateMonth.format("D MMM")) {
                             day = date.format("D MMM");
                        }
                        else if (date.format("D") < 7 ) {
                            day = date.format("D MMM");
                        }
                        else {
                             day = date.format("D");
                        }

                        $scope.cachedDays[d] = day;
                    }
                    else
                    {
                        $scope.cachedDays[d] = null;
                    }
                }
                else
                if(originalDays === 90)
                {
                    var date = moment().subtract(fromNow,'days');
                    //var day = date.format("M");
                    var day;
                    if(date.date() === 1)
                    {
                        if(date.format("MMM YYYY") === startDateThreeMonth.format("MMM YYYY")) {
                            day = date.format("MMM YY");
                        }  else if(date.format("MMM") === "Jan") {
                            day = date.format("MMM YY");
                        } else {
                            day = date.format("MMM");
                        }
                        $scope.cachedDays[d] = day;
                    }
                    else
                    {
                        $scope.cachedDays[d] = null;
                    }
                }
                else
                if(originalDays === 180)
                {
                    var date = moment().subtract(fromNow,'days');
                    //var day = date.format("M");
                    var day;
                    if(date.date() === 1)
                    {
                        if(date.format("MMM YYYY") === startDateSixMonth.format("MMM YYYY")) {
                            day = date.format("MMM YY");
                        }  else if(date.format("MMM") === "Jan") {
                            day = date.format("MMM YY");
                        } else {
                            day = date.format("MMM");
                        }
                        $scope.cachedDays[d] = day;
                    }
                    else
                    {
                        $scope.cachedDays[d] = null;
                    }
                }
                else
                if(originalDays === 360)
                {
                    var date = moment().subtract(fromNow,'days');
                    var day;
                    var firstQuarter = startDateTwelveMonth.month();
                    var secondQuarter = startDateTwelveMonth.add(3,"months").month();
                    var thirdQuarter = startDateTwelveMonth.add(6,"months").month();
                    var fourthQuarter = startDateTwelveMonth.add(9,"months").month();

                    //var day = date.format("M");
                    if(date.date() === 1 && (date.month() === firstQuarter
                            || date.month() === secondQuarter
                            || date.month() === thirdQuarter
                            || date.month() === fourthQuarter))
                    {
                         day = date.format("MMM YY");

                        $scope.cachedDays[d] = day;

                    }
                    else
                    {
                        $scope.cachedDays[d] = null;
                    }
                }
                else
                {
                    var dx = $scope.data[0].values[d]  && $scope.data[0].values[d].x || 0;
                    $scope.cachedDays[d] = "";//dx ? dx : '';
                }
            }
        }

        return $scope.cachedDays[d];
    };


    // Add months to months date
    var addMonths = function(months)
    {
        if(months < 0)
        {
            var dat = moment($scope.entryDate).subtract(1,'months').toDate();
        }
        else
        {
            var dat = moment($scope.entryDate).add(1,'months').toDate();
        }
        
        //Update start month if required
        if(!$scope.showRecent)
        {
            dat = moment(dat).endOf('month').toDate();
            startDateMonth = moment(dat).startOf('month');
        }
        
        return dat;
    };
    
    // Update precurser string on month change
    var updateDateHelperString = function() {
        if ($scope.entryDate >= thisMonthStart &&
                $scope.entryDate <= thisMonthEnd) {
            $scope.dateHelperString = '(This Month)';
        } else if ($scope.entryDate >= nextMonthStart &&
                $scope.entryDate <= nextMonthEnd) {
            $scope.dateHelperString = '(Next Month)';
        } else if ($scope.entryDate >= lastMonthStart &&
                $scope.entryDate <=lastMonthEnd) {
            $scope.dateHelperString = '(Last Month)';
        } else {
            $scope.dateHelperString = '';
        }
    };

    // Check if to show a given data types graph
    $scope.showSection = function(section) {
        var visibleSections = UserService.getUserInterestedSections();
        for (var i = 0; i < visibleSections.length; i++)
        {
            //console.log(JSON.stringify(visibleSections[i]));
            if (visibleSections[i].section === section) {
                return visibleSections[i].interested;
            }
        }
        return false;
    };
    
    
    var fixDays = function(days)
    {
        var date;
        originalDays = days;

        if(days === 7)
        {
            $scope.days = 7;
            $scope.xDomain = $scope.getArray(0,$scope.days); 
            return;
        }
        else
        if(days === 30)
        {
            date = moment().subtract(1,'months');
        }
        else
        if(days === 90)
        {
            date = moment().subtract(3,'months');
        }
        else
        if(days === 180)
        {
            date = moment().subtract(6,'months');
        }
        else
        if(days === 360)
        {
            date = moment().subtract(1,'years');
        }
        else
        {
            $scope.days = days;
            $scope.xDomain = $scope.getArray(0,$scope.days);
            return;
        }

        $scope.days = moment().diff(date,'days');
        $scope.xDomain = $scope.getArray(0,$scope.days);
    };


    var clearMemory = function() {
        
        //Test call
        AppleWatchService.sendMessage("First test message");
        
        //Start update spinner
        SpinnerService.show(true);

        //Clear memory
        //d3.selectAll('svg').remove();
        //nv.charts = {};
        //nv.logs = {};
        
        nv.graphs = [];
    };
}]);
