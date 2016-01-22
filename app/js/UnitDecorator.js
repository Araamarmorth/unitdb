'use strict';
unitDb = unitDb || {};

//var typeTable = [
//];

var representationExtractionTable = [
// A simple way to get most of the content, this table specifies what to
// extract, the actual extraction is done in the extract_from_bp function
// The format of this table is
// [(category, [([attribute], subcategory, formatting string, tooltip)])]
	['Economy',[
	[['Economy', 'BuildCostMass'], 'Mass cost', ' m', 'mass units'],
	[['Economy', 'BuildCostEnergy'], 'Energy cost', ' e', 'energy units'],
	[['Economy', 'BuildTime'], 'Time cost', ' s', 'seconds'],
	[['Economy', 'BuildRate'], 'Build rate', '', 'dimensionless'],
	[['Economy', 'StorageMass'], 'Mass storage', ' m', 'mass units'],
	[['Economy', 'StorageEnergy'], 'Energy storage', ' m', 'mass units'],
	[['Economy', 'ProductionPerSecondMass'], 'Mass yield', ' m/s', 'mass units per second'],
	[['Economy', 'ProductionPerSecondEnergy'], 'Energy yield', ' e/s', 'energy units per second'],
	[['Economy', 'MaintenanceConsumptionPerSecondEnergy'], 'Energy drain', ' e/s', 'energy units per second'],
	]],
	['Defense',[
	[['Defense', 'Health'], 'Health', ' hp', 'hitpoints'],
	[['Defense', 'RegenRate'], 'Regen rate', ' hp/s', 'hitpoints per second'],
	[['Defense', 'Shield', 'ShieldMaxHealth'], 'Shield health', 'hp', 'hitpoints'],
	[['Defense', 'Shield', 'ShieldRegenRate'], 'Shield regen rate', ' hp/s', 'hitpoints per second'],
	[['Defense', 'Shield', 'ShieldSize'], 'Shield size', ' d', 'distance units'],
	]],
	['Intel',[
	[['Intel', 'VisionRadius'], 'Vision radius', ' d', 'distance units'],
	[['Intel', 'RadarRadius'], 'Radar radius', ' d', 'distance units'],
	[['Intel', 'SonarRadius'], 'Sonar radius', ' d', 'distance units'],
	]],
//	TODO:
// 	['Abilities',[
// 		[['Display', 'Abilities'], '??', '', ''],
// 	]]
	['Physics', [
	[['Physics', 'MaxSpeed'], 'Max speed', ' d/s', 'distance units per second'],
	[['Physics', 'TurnRate'], 'Turn rate', ' ?', '?'],
	[['Physics', 'FuelUseTime'], 'Fuel use time', ' s', 'seconds'],
//TODO:	[['Physics', 'FuelRechargeRate'], 'Fuel recharge time', 'seconds']
//	10*item.Physics.FuelUseTime / item.Physics.FuelRechargeRate | time 
	]],
	['Air Physics',[
//TODO:	[['Air', 'MaxAirspeed'], 'Speed' ...
// {{ item.Air.MinAirspeed || 0 }}-{{ item.Air.MaxAirspeed }}
	[['Physics', 'Elevation'], 'Elevation', ' d', '?'],//TODO: Check unit
	[['Air', 'EngageDistance'], 'Engage distance', ' d', 'distance units'],
	[['Air', 'TurnSpeed'], 'Turn speed', ' s-1', 'hertz'],
	[['Air', 'CombatTurnSpeed'], 'Combat turn speed', ' s-1', 'hertz']
	]]
];

//TODO:
//Recharge time Defense.Shield.ShieldRechargeTime + Defense.Shield.ShieldRegenStartTime 

function getAttribute(object, attributeList) {
	// Returns the value of object[a0][a0]..[an] where  attributeList = [a0 
	// , a1, ..., an]. If it doesn't exist returns null
	var attribute = object;
	for (var attributeIndex in attributeList) {
		attribute = attribute[attributeList[attributeIndex]];
		if (attribute === undefined) return null;
	}
	
	return attribute;
}


function extractContentFromBP(blueprint){
// Extraction of the content using representationExtractionTable:
	
	var content = {
		// The content of the unit as it will be exposed in the comparator.
		// It is organised as follow:
		// {category_name: [(group_name, [{subcategory_name: (value, tooltip)}])]}
	};
	
	//We excract the defulat group using representationExtractionTable
	for (var tableIndex in representationExtractionTable) {
		var categoryName = representationExtractionTable[tableIndex][0];
		var noGroup = {};// The default group, which name is ''
		var containsSubcategories = false;
		for (var thisCatIndex in representationExtractionTable[tableIndex][1]) {
			var attributeList = representationExtractionTable[tableIndex][1][thisCatIndex][0];
			var subcategoryName = representationExtractionTable[tableIndex][1][thisCatIndex][1];
			//TODO: use type description for a type table instead of having it hardcoded
			//var type = representationExtractionTable[tableIndex][1][thisCatIndex][2];
			var formattingString = representationExtractionTable[tableIndex][1][thisCatIndex][2];
			var tooltip = representationExtractionTable[tableIndex][1][thisCatIndex][3];
			var attribute = getAttribute(blueprint, attributeList);
			if( attribute !== null ) {
				noGroup[subcategoryName] = [attribute + formattingString, tooltip];
				containsSubcategories = true;
			}
		}
		if (containsSubcategories) content[categoryName] = [['', noGroup]];
	}
	
	//TODO: extract other groups such as the weapons
	
	return content;
}
// decorator to make the unit object a bit more usable
unitDb.UnitDecorator = function(blueprint) {
	var classificationLookup = {
		'RULEUC_Engineer': 'Build',
		'RULEUC_Commander': 'Build',
		'RULEUMT_Amphibious': 'Land',
		'RULEUC_MilitaryVehicle': 'Land',
		'RULEUC_MilitaryAircraft': 'Air',
		'RULEUC_MilitarySub': 'Naval',
		'RULEUC_MilitaryShip': 'Naval',
		'RULEUC_Weapon': 'Base',
		'RULEUC_Sensor': 'Base',
		'RULEUC_Factory': 'Base',
		'RULEUC_Resource': 'Base',
		'RULEUC_MiscSupport': 'Base',
		'RULEUC_CounterMeasure': 'Base'
	};
	
	var techLookup = {
		'RULEUTL_Basic': 'T1',
		'RULEUTL_Advanced': 'T2',
		'RULEUTL_Secret': 'T3',
		'RULEUTL_Experimental': 'TX',
		'TECH1': 'T1',
		'TECH2': 'T2',
		'TECH3': 'T3',
		'EXPERIMENTAL': 'EXP',
	};
	
	function getTech(bp) {
		var x = _.intersection(bp.Categories, _.keys(techLookup));
		return x.length === 1 ? techLookup[x[0]] : '';
	}
	
	function fullName (u){
		return (u.name ? u.name + ': ' : '') + (u.tech === 'EXP' ? '' : u.tech + ' ') + u.description;
	}
	
	function weaponStats(weapon) {
		var shots = weapon.ManualFire ? 1 : weapon.MuzzleSalvoSize, // number of projectiles
			rate = weapon.RateOfFire,
			delay = weapon.RackSalvoChargeTime||0 + weapon.RackSalvoReloadTime||0,
			cycle = 1 / rate + delay, // how long it takes between shots
			damage = weapon.Damage;
		
		return { shots: shots, cycle: cycle, damage: damage };
	}
	
	function fireCycle (weapon) {
		var stats = weaponStats(weapon);
		return stats.shots + ' shot' + (stats.shots > 1 ? 's' : '') + ' / ' + ( stats.cycle === 1 ? '' : Math.round(stats.cycle * 10)/10 ) + ' sec';
	}
	
	function getDps(weapon) {
		return unitDb.dpsCalculator.dps(weapon);
	}
	
	var self = {
		id: blueprint.Id,
		content: extractContentFromBP(blueprint),
		blueprint: blueprint,
		name: blueprint.General.UnitName,
		description: blueprint.Description,
		faction: blueprint.General.FactionName,
		classification: classificationLookup[blueprint.General.Classification],
		tech: getTech(blueprint),
		strategicIcon: blueprint.StrategicIconName,
		icon: blueprint.General.Icon || '',
		order: blueprint.BuildIconSortPriority || 1000,
		fireCycle: fireCycle,
	};
	
	self.fullName = fullName(self);
	
	// additional stats for weapons
	for(var i in blueprint.Weapon) {
		_.extend(blueprint.Weapon[i], {
			dps: getDps(blueprint.Weapon[i])
		});
	}
	
	return _.extend(self, blueprint);
};
