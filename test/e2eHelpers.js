var express = require("express");
var createServer = require("../server/server");
var webdriver = require("selenium-webdriver");
var istanbul = require("istanbul");
var path = require("path");
var fs = require("fs");

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var instrumenter = new istanbul.Instrumenter();
var collector = new istanbul.Collector();
var gatheringCoverage = process.env.running_under_istanbul;
var coverageFilename = "build_artifacts/coverage-e2e.json";

var driver;
var router;
var server;

module.exports.setupDriver = function() {
    driver = new webdriver.Builder().forBrowser("chrome").build();
};

module.exports.setupServer = function(done) {
    router = express.Router();
    if (gatheringCoverage) {
        router.get("/main.js", function(req, res) {
            var absPath = path.join(__dirname, "..", "public", "main.js");
            res.send(instrumenter.instrumentSync(fs.readFileSync("public/main.js", "utf8"), absPath));
        });
    }
    server = createServer(testPort, router, done);
};

module.exports.teardownServer = function(done) {
    server.close(done);
};

module.exports.teardownDriver = function() {
    if (gatheringCoverage) {
        driver.executeScript("return __coverage__;").then(function (coverage) {
            collector.add(coverage);
        });
    }
    driver.quit();
};

module.exports.reportCoverage = function() {
    if (gatheringCoverage) {
        fs.writeFileSync(coverageFilename, JSON.stringify(collector.getFinalCoverage()), "utf8");
    }
};

module.exports.navigateToSite = function() {
    driver.get(baseUrl);
};

module.exports.getTitleText = function() {
    return driver.findElement(webdriver.By.css("h1")).getText();
};

module.exports.getInputText = function() {
    return driver.findElement(webdriver.By.id("new-todo")).getAttribute("value");
};

module.exports.getErrorText = function() {
    var errorElement = driver.findElement(webdriver.By.id("error"));
    driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"), 2000);
    return errorElement.getText();
};

module.exports.getTodoList = function() {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 2000);
    driver.findElement(webdriver.By.id("todo-list")).getAttribute("innerHTML");
    return driver.findElements(webdriver.By.css("#todo-list li"));
};

module.exports.addTodo = function(text) {
    driver.findElement(webdriver.By.id("new-todo")).sendKeys(text);
    driver.findElement(webdriver.By.id("submit-todo")).click();
};

module.exports.clickDeleteTodo = function() {
    driver.wait(webdriver.until.elementLocated(webdriver.By.className("deleteButton")));
    var deleteButton = driver.findElement(webdriver.By.className("deleteButton"));
    deleteButton.click();
    driver.wait(webdriver.until.elementIsNotVisible(driver.findElement(webdriver.By.css("ul li"))), 2000);
};

module.exports.clickEdit = function() {
    driver.wait(webdriver.until.elementLocated(webdriver.By.className("editButton")), 2000);
    driver.findElement(webdriver.By.className("editButton")).click();
};

module.exports.clickComplete = function () {
    driver.wait(webdriver.until.elementLocated(webdriver.By.className("completeButton")), 2000);
    driver.findElement(webdriver.By.className("completeButton")).click();
};

module.exports.findTodo = function () {
    driver.wait(webdriver.until.elementLocated(webdriver.By.css("ul li span")), 2000);
    var todo = driver.findElement(webdriver.By.css("ul li span"));
    return todo;
};

module.exports.updateTodo = function() {
    module.exports.clickEdit();
    driver.wait(webdriver.until.elementLocated(webdriver.By.className("inputForm")), 2000);
    var inputForm = driver.findElement(webdriver.By.className("inputForm"));
    inputForm.sendKeys("This has been updated\uE007");
    var updatedTodo = module.exports.findTodo();
    driver.wait(webdriver.until.elementTextContains(updatedTodo, "updated"), 2000);
    return updatedTodo.getText();
};

module.exports.cancelUpdate = function() {
    module.exports.clickEdit();
    driver.wait(webdriver.until.elementLocated(webdriver.By.className("cancelButton")), 5000);
    driver.findElement(webdriver.By.className("cancelButton")).click();
    var cancelledUpdate = module.exports.findTodo();
    return cancelledUpdate.getText();
};

module.exports.completeTodo = function() {
    module.exports.clickComplete();
    driver.wait(webdriver.until.elementLocated(webdriver.By.css("ul li span")), 2000);
    var completedTodo = driver.findElement(webdriver.By.css("ul li span"));
    return completedTodo.getAttribute("class");
};

module.exports.findDeleteComplete = function() {
    module.exports.clickComplete();
    driver.wait(webdriver.until.elementLocated(webdriver.By.id("deleteCompletedButton")), 2000);
    driver.findElement(webdriver.By.id("deleteCompletedButton")).click();
    var deleteCompletedButton = driver.findElement(webdriver.By.id("deleteCompletedButton"));
    driver.wait(webdriver.until.elementIsNotVisible(deleteCompletedButton), 2000);
    return driver.findElements(webdriver.By.id("ul li"));
};

module.exports.setupErrorRoute = function(action, route) {
    if (action === "get") {
        router.get(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "post") {
        router.post(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "delete") {
        router.get(route, function(req, res) {
            res.sendStatus(404);
        });
    }
};
