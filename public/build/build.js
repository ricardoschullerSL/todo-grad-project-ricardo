(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var todoListCtrl = require("./controllers/todoListCtrl.js");
var filterDirective = require("./directives/filterDirective.js");
var todoListDirective = require("./directives/todoListDirective.js");
var todoListService = require("./services/todoListService.js");

var todoApp = angular.module("todoApp", ["ngAnimate"]);

todoApp.service("todoListService", ["$http", todoListService]);
todoApp.controller("todoListCtrl", ["$scope", "todoListService", todoListCtrl]);
todoApp.directive("filterDirective", filterDirective);
todoApp.directive("todoListDirective", todoListDirective);


},{"./controllers/todoListCtrl.js":2,"./directives/filterDirective.js":3,"./directives/todoListDirective.js":4,"./services/todoListService.js":5}],2:[function(require,module,exports){
module.exports = function ($scope, todoListService) {
    $scope.tdListService = todoListService;
    angular.element(document.getElementById("filterAll")).addClass("activeFilter");
    $scope.title = "";

    $scope.updateCounter = function () {
        todoListService.updateCounter();
    };
    $scope.deleteTodo = function (todo) {
        todoListService.deleteTodo(todo);
    };
    $scope.submitTodo = function (title) {
        if (!(title === undefined || title === "")) {
            todoListService.submitTodo(title);
            $scope.title = "";
        }
    };
    $scope.completeTodo = function (todo) {
        todoListService.completeTodo(todo);
    };
    $scope.submitEditedTodo = function (todo, newTitle) {
        todoListService.submitEditedTodo(todo, newTitle);
    };
    $scope.deleteCompleted = function () {
        todoListService.deleteCompleted();
    };
};

},{}],3:[function(require,module,exports){

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

},{}],4:[function(require,module,exports){
module.exports = function() {
    return {
        templateUrl: "../templates/todoListView.html"
    };
};

},{}],5:[function(require,module,exports){
module.exports = function ($http) {

    var data = {
        todoArray: [],
        filteredTodoArray: [],
        completedTodoArray: [],
        errorMessage: "",
        updateCounter: 0,
        completedCounter: 0,

    };

    var getTodoList = function ($http) {
        return $http.get("/api/todo/")
        .then(function (response) {
            console.log("response is", response);
            data.todoArray = response.data;
        })
        .catch(function(error) {
            console.log("Submit request failed,", error.status, error.statusText);
            data.errorMessage = "Failed to get list. Server returned " + error.status + " " + error.statusText;
        });
    };

    var updateCounter = function() {
        data.completedTodoArray = data.todoArray.filter(function(todo) {return todo.isComplete;});
        data.completedCounter = data.completedTodoArray.length;
    };

    var submitTodo = function(title) {
        $http.post("/api/todo/", {title: title, isComplete: false})
        .then(function(response) {
            data.todoArray.push({id: response.data.id, title: title, isComplete: false});
            console.log(data);
            title = "";
        })
        .catch(function(error) {
            console.log(data);
            console.log("Submit request failed,", error.status, error.statusText);
            data.errorMessage = "Failed to create item. Server returned " + error.status + " " + error.statusText;
        });
    };

    var deleteTodo = function(todo) {
        $http.delete("/api/todo/" + todo.id)
        .then(function() {
            data.todoArray.splice(data.todoArray.indexOf(todo), 1);
            data.completedTodoArray = data.todoArray.filter(function(todo) {return todo.isComplete;});
            data.completedCounter = data.completedTodoArray.length;
        })
        .catch(function(error) {
            console.log("Delete request failed,", error.status, error.statusText);
            data.errorMessage = "Failed to delete item. Server returned " + error.status + " " + error.statusText ;
        });
    };

    var updateTodo = function(id, updateKey, updateValue) {
        var payload = {id: id};
        payload[updateKey] = updateValue;
        $http.put("/api/todo/" + id, payload)
        .catch(function(error) {
            console.log("Update request failed,", error.status , error.statusText);
            data.errorMessage = "Failed to update item. Server returned " + error.status + " " + error.statusText ;
        });
    };

    var completeTodo = function(todo) {
        updateTodo(todo.id, "isComplete", true);
        todo.isComplete = true;
        data.completedTodoArray = data.todoArray.filter(function(todo) {return todo.isComplete;});
        data.completedCounter = data.completedTodoArray.length;
    };

    var submitEditedTodo = function(todo, newTitle) {
        updateTodo(todo.id, "title", newTitle);
        todo.title = newTitle;
    };

    var deleteCompleted = function() {
        for (var i = data.todoArray.length - 1 ; i > -1 ; i--) {
            var todo = data.todoArray[i];
            if (todo.isComplete === true) {
                deleteTodo(todo);
            }
        }
    };

    getTodoList($http);

    return {
        data: data,
        getTodoList: getTodoList,
        submitTodo: submitTodo,
        deleteTodo: deleteTodo,
        updateTodo: updateTodo,
        completeTodo: completeTodo,
        submitEditedTodo: submitEditedTodo,
        deleteCompleted: deleteCompleted,
        updateCounter: updateCounter
    };

};

},{}]},{},[1]);
