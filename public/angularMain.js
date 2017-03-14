var todoListCtrl = require("./controllers/todoListCtrl.js");
var filterDirective = require("./directives/filterDirective.js");
var todoListDirective = require("./directives/todoListDirective.js");
var todoListService = require("./services/todoListService.js");

var todoApp = angular.module("todoApp", ["ngAnimate"]);

todoApp.service("todoListService", ["$http", todoListService]);
todoApp.controller("todoListCtrl", ["$scope", "todoListService", todoListCtrl]);
todoApp.directive("filterDirective", filterDirective);
todoApp.directive("todoListDirective", todoListDirective);

