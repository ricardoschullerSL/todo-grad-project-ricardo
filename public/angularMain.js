/* global angular: true */
var todoApp = angular.module("todoApp", ["ngAnimate"]);

todoApp.controller("todoListCtrl", function($scope, $http, $timeout, todoFactory) {
    $scope.tdFactory = todoFactory;
    todoFactory.getTodoList()
    .catch(function(error) {
        console.log("Submit request failed,", error.status, error.statusText);
        $scope.errorMessage = "Failed to get list. Server returned " + error.status + " " + error.statusText;
    });
    angular.element(document.getElementById("filterAll")).addClass("activeFilter");

    $scope.updateCounter = function() {
        todoFactory.completedTodoArray = todoFactory.todoArray.filter(function(todo) {return todo.isComplete;});
        $scope.completedCounter = todoFactory.completedTodoArray.length;
    };
    $scope.title = "";
    $scope.submitTodo = function() {
        if (!($scope.title === undefined || $scope.title === "")) {
            $http.post("/api/todo/", {title: $scope.title, isComplete: false})
            .then(function(response) {
            todoFactory.todoArray.push({id: response.data.id, title: $scope.title, isComplete: false});
            $scope.title = "";
        })
        .catch(function(error) {
            console.log("Submit request failed,", error.status, error.statusText);
            $scope.errorMessage = "Failed to create item. Server returned " + error.status + " " + error.statusText;
        });
        }
    };

    $scope.deleteTodo = function(todo) {
        $http.delete("/api/todo/" + todo.id)
        .then(function() {
            todoFactory.todoArray.splice(todoFactory.todoArray.indexOf(todo), 1);
            todoFactory.completedTodoArray = todoFactory.todoArray.filter(function(todo) {return todo.isComplete;});
            $scope.completedCounter = todoFactory.completedTodoArray.length;
        })
        .catch(function(error) {
            console.log("Delete request failed,", error.status, error.statusText);
            $scope.errorMessage = "Failed to delete item. Server returned " + error.status + " " + error.statusText ;
        });
    };

    $scope.updateTodo = function(id, updateKey, updateValue) {
        var payload = {id: id};
        payload[updateKey] = updateValue;
        $http.put("/api/todo/" + id, payload)
        .catch(function(error) {
            console.log("Update request failed,", error.status , error.statusText);
            $scope.errorMessage = "Failed to update item. Server returned " + error.status + " " + error.statusText ;
        });
    };

    $scope.completeTodo = function(todo) {
        $scope.updateTodo(todo.id, "isComplete", true);
        todo.isComplete = true;
        todoFactory.completedTodoArray = todoFactory.todoArray.filter(function(todo) {return todo.isComplete;});
        $scope.completedCounter = todoFactory.completedTodoArray.length;
    };

    $scope.submitEditedTodo = function(todo, newTitle) {$scope.updateTodo(todo.id, "title", newTitle);
        todo.title = newTitle;
    };

    $scope.deleteCompleted = function() {
        for (var i = todoFactory.todoArray.length - 1 ; i > -1 ; i--) {
            var todo = todoFactory.todoArray[i];
            if (todo.isComplete === true) {
                $scope.deleteTodo(todo);
            }
        }
    };
});

todoApp.factory("todoFactory", function($http) {
    var factory = {todoArray: [], filteredTodoArray: [], completedTodoArray: []};
    factory.getTodoList = function () {
        return $http.get("/api/todo/")
        .then(function (response) {
            console.log("response is", response);
            factory.todoArray = response.data;
        });
    };
    return factory;
});

todoApp.directive("filterDirective", function() {
    return {
        link: function(scope, element, attrs) {

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
        }
    };
});
