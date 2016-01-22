'use strict';
unitDb.controllers = {
    homeCtrl: ['$scope', 'data', function($scope, data) {
        $scope.factions = [];
        $scope.kinds = [];
        $scope.tech = [];

        $scope.index = data.items;
        $scope.contenders = data.contenders;

        var toggleArray = function(arr, el) {
            var idx = arr.indexOf(el);
            if (idx >= 0) {
                arr = arr.splice(idx, 1);
            } else {
                arr.push(el);
            }
        },
        isInArray = function(arr, el) {
            return arr.indexOf(el) >= 0;
        };

        $scope.toggleFaction = function(f) {
            toggleArray($scope.factions, f);
        };
        $scope.factionSelected = function(f) {
            return isInArray($scope.factions, f);
        };
        $scope.toggleKind = function(k) {
            toggleArray($scope.kinds, k);
        };
        $scope.kindSelected = function (k) {
            return isInArray($scope.kinds, k);
        };
        $scope.toggleTech = function(t) {
            toggleArray($scope.tech, t);
        };
        $scope.techSelected = function(t) {
            return isInArray($scope.tech, t);
        };
        $scope.compare = function(item) {
            item.selected = !item.selected;

            var idx = $scope.contenders.indexOf(item.id);
            if (idx === -1)
                $scope.contenders.push(item.id);
            else
                $scope.contenders.splice(idx, 1);
        };
        $scope.clear = function() {
            for (var c in $scope.index)
                if ($scope.index[c].selected)
                    $scope.index[c].selected = false;

            $scope.contenders = [];
        };
        $scope.strain = function(e) {
            return ($scope.factions.length === 0 || isInArray($scope.factions, e.faction)) &&
                       ($scope.kinds.length === 0 || isInArray($scope.kinds, e.classification)) &&
                       ($scope.tech.length === 0 || isInArray($scope.tech, e.tech));
        };
    }],

	compareCtrl: ['$scope', '$route', '$routeParams', '$location', 'data', function($scope, $route, $routeParams, $location, data) {
        var ids = $routeParams.ids.split(',');
		
        $scope.contenders = _.sortBy(_.filter(data.items, function(x) { return _.contains(ids, x.id); }),
                                    function(x) { return ids.indexOf(x.id); });
		
		function getURLFromContenders(){
			var newURL = '';
			for (var unitNb in $scope.contenders) {
				if (unitNb > 0) newURL += ',';
				newURL += $scope.contenders[unitNb].id;
			}
			return newURL;
		}
		
		//Machinery to change the location without reloading the page
		$scope.nextUrl = null;
		$scope.thisRoute = null;
		
		$scope.$on('$locationChangeSuccess', function (_, newURL) {
			newURL = newURL.slice(3 + newURL.indexOf('/#/'));
			if ($scope.nextUrl === newURL) {
				$route.current = $scope.thisRoute;
				$scope.nextUrl = null;
				$scope.thisRoute = null;
			} 
		});
		
		function changeLocationWithoutReload(newURL){
			$scope.nextUrl = newURL;
			$scope.thisRoute = $route.current;
			$location.path(newURL);
		}
		
		function computeCategories() {
		// Creates the categories and sub-categories for the tab compairison
			var catDict = {}; // catDict is of the form:
			//{category_name: [{subcategory_name: true}]} : an object with for each 
			// category a property containing a array, with for a each group
			// an object containt the group's subcategories
			
			//First we go through all selected units
			for (var unitIndex in $scope.contenders) {
				var unit = $scope.contenders[unitIndex];
				for (var catName in unit.content) {
					
					if (catDict[catName] === undefined) catDict[catName] = [];
					
					for (var groupIndex in unit.content[catName]){
						
						if (catDict[catName][groupIndex] === undefined) catDict[catName][groupIndex] = {};
						
						var groupSubcats = catDict[catName][groupIndex];
						
						for (var subCatName in unit.content[catName][groupIndex][1]) {
							groupSubcats[subCatName] = true;
						}
					}
				}
			}
			
			
			// Categories are simply the keys of the dict: an array containing 
			// every available category name
			$scope.categories = Object.keys(catDict);
			
			// Subcategories are more complex, as they work with groups:
			// It an array containing tuples of :
			// (category name, category row span, group number, subcategory name)
			$scope.subCategories = [];
			
			for (var catIndex in $scope.categories) {
				
				var catName = $scope.categories[catIndex];
				var catStart = $scope.subCategories.length;
				
				//TODO: More than one group
				var groupNumber = 0;
				var group = catDict[catName][groupNumber];
				
				console.log(catDict[catName]);
				console.log('group');
				console.log(group);
				var groupName = group[0];
				var subCatList = Object.keys(group);
				
				for (var subCatIndex in subCatList) {
					
					var subCatName = subCatList[subCatIndex];
					$scope.subCategories.push([catName, 0, groupNumber, subCatName]);
				}
				
				//Adjust the row span of the category
				$scope.subCategories[catStart][1] = $scope.subCategories.length - catStart;
				
			}
			
			console.log('$scope.subCategories');
			console.log($scope.subCategories);
		}
		
		computeCategories();
		
		$scope.moveUnit = function(dropIndex, dragIndex){
			//evt is not used
			//Change the index of a unit in the compare view
			var newContenders = $scope.contenders.slice();
			var dragObject = $scope.contenders[dragIndex];
			
 			//Remove the dragged element:
			newContenders.splice(dragIndex, 1);
			
			//Then put it back at the right place
			newContenders.splice(dropIndex, 0, dragObject);
			
			$scope.contenders = newContenders;
			changeLocationWithoutReload(getURLFromContenders());
		};
		
		$scope.removeUnit=function(unitIndex){
			//Remove a unit from the compare view
			//First remove it from contender
			$scope.contenders.splice(unitIndex, 1);
			
			//Then update the URL
			if ($scope.contenders.length === 0) {
				$scope.$apply($location.path('/'));
			}
			else {
				changeLocationWithoutReload(getURLFromContenders());
			}
		};
    }]
};
