var fs = require("fs");
var exec = require("child_process").exec;
var spawn = require("child_process").spawn;
var spawnSync = require("child_process").spawnSync;

var serverDirectory = "./server/server.js";
var serverPID =  null;
var counter = 0;

var server = exec("node server");
console.log("ServerPID is", server.pid);
console.log("Server has restarted", counter, "times");
serverPID = server.pid;
counter++;

fs.watch(serverDirectory, function (eventType, filename) {
    console.log("Event type is:", eventType);
    if (eventType === "change"){
        if (filename){
            console.log("Filename provided:", filename);
            if (serverPID !== null) {
                console.log("Restarting the server.");
                var killProcess = spawnSync("taskkill", ["/pid", serverPID, "/f", "/t"]);
                console.log("ProcessID killed is:", serverPID);
            }
            var server = exec("node server");
            console.log("ServerPID is", server.pid);
            console.log("Server has restarted", counter, "times");
            serverPID = server.pid;
            counter++;
        }
    }
});