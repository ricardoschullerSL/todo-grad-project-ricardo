var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");
var xhr = require("xmlhttprequest");

testing.describe("end to end", function() {
    this.timeout(20000);
    testing.before(helpers.setupDriver);
    testing.beforeEach(helpers.setupServer);
    testing.afterEach(helpers.teardownServer);
    testing.after(function() {
        helpers.teardownDriver();
        helpers.reportCoverage();
    });

    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite();
            helpers.getTitleText().then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("get", "/api/todo");
            helpers.navigateToSite();
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getInputText().then(function(value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("post", "/api/todo");
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to create item. Server returned Error: Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("Another new todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
    testing.describe("on deleting items from todo list", function() {
        testing.it("deleting an item from the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item to be deleted");
            helpers.clickDeleteTodo();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            var createRequest = new xhr.XMLHttpRequest();
            createRequest.open("DELETE", "/api/todo/0");
            createRequest.send();
            createRequest.onload = function () {
                helpers.clickDeleteTodo();
                helpers.getErrorText().then(function(text) {
                    assert.equal(text, "Failed to delete item. Server returned 404 - Not Found");
                });
            };
        });
    });
    testing.describe("on updating an item from todo list", function() {
        testing.it("update an item from the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item to be updated.");
            helpers.updateTodo().then(function(text) {
                assert.equal(text, "This has been updated");
            });
        });
        testing.it("displays an error if update request fails", function() {
            helpers.navigateToSite();
            helpers.addTodo("Put the kettle on");
            var createRequest = new xhr.XMLHttpRequest();
            createRequest.open("PUT", "/api/todo/1");
            createRequest.send();
            createRequest.onload = function () {
                helpers.getErrorText().then(function(text) {
                    assert.equal(text, "Failed to update item. Server returned 404 - Not Found");
                });
            };
        });
    });
});
