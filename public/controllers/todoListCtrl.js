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
