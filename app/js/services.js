'use strict';
unitDb.services = {
    dataProvider: function() {

        var unitIndex = [];
        this.setIndex = function(index) {
            unitIndex = index;
        };

        this.$get = [function() {
            return {
                items: _.map(unitIndex, unitDb.UnitDecorator),
                contenders: []
            };
        }];
    }
};
