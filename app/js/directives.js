'use strict';
unitDb.directives = {
    thumb: [function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/thumb.html',
        };
    }],

    unit: [function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/unit.html',
            scope: {
                item: '=content'
            }
        };
    }],
    
	viewSwitcher: [function() {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'views/viewSwitcher.html',
		};
	}],
	
	compactView: [function() {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'views/compactView.html',
		};
	}],
	
	tabView: [function() {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'views/tabView.html',
		};
	}]
};
