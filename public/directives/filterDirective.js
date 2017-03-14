
module.exports = function() {
    return {
        templateUrl: "../templates/filterView.html",
        link: linkRef
    };
};

var linkRef = function(scope, element, attrs) {

    scope.setFilter = function(filterName) {
        if (filterName === "todo") {
            scope.todoFilter = {isComplete: false};
        } else if (filterName === "completed") {
            scope.todoFilter = {isComplete: true};
        } else {
            scope.todoFilter = {};
        }

        var filters = element.children();
        angular.forEach(filters, function(filter) {
            var angularFilter = angular.element(filter);
            if (angularFilter.hasClass("activeFilter")) {
                angularFilter.removeClass("activeFilter");
            }
        });

        var angularTarget = angular.element(event.currentTarget);
        angularTarget.addClass("activeFilter");
    };

};
