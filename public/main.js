/* global Promise: true */
var todosArray = [];
var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var todoCounter = document.getElementById("count-label");
var filterType = "";

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createFilterButtons() {
    var filterPlaceholder = document.getElementById("filter-placeholder");
    var filterAll = document.createElement("button");
    var filterActive = document.createElement("button");
    var filterCompleted = document.createElement("button");

    filterAll.innerText = "All";
    filterActive.innerText = "Active";
    filterCompleted.innerText = "Completed";

    filterAll.className = "button";
    filterActive.className = "button";
    filterCompleted.className = "button";

    filterAll.onclick = function() {filterType = "all"; reloadTodoList();};
    filterActive.onclick = function() {filterType = "active"; reloadTodoList();};
    filterCompleted.onclick = function() {filterType = "completed";reloadTodoList();};

    filterPlaceholder.appendChild(filterAll);
    filterPlaceholder.appendChild(filterActive);
    filterPlaceholder.appendChild(filterCompleted);
}

function createUpdateForm(id, listItem) {

    var updateForm = document.createElement("form");
    var inputForm = document.createElement("input");
    var submitButton = document.createElement("input");
    var cancelButton = document.createElement("button");
    var oldListItem = listItem;

    updateForm.onsubmit = function(event) {
        var titleValue = inputForm.value;
        updateTodo(id, "title", titleValue, function() {
            reloadTodoList();
        });
        inputForm.value = "";
        event.preventDefault();
    };

    submitButton.className = "submitButton button shadow";
    submitButton.type = "submit";
    submitButton.value = "Submit";
    inputForm.className = "inputForm";
    inputForm.placeholder = listItem.firstChild.innerText;
    cancelButton.className = "cancelButton button shadow";
    cancelButton.innerText = "Cancel";
    cancelButton.addEventListener("click", reloadTodoList);
    updateForm.appendChild(inputForm);
    updateForm.appendChild(submitButton);
    listItem.innerText = "";
    listItem.appendChild(updateForm);
    listItem.appendChild(cancelButton);
}

function createTodo(newTitle, callback) {
    var payload = {title: newTitle, isComplete: false};
    console.log(payload);
    console.log(JSON.stringify(payload));

    fetch("./api/todo/", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify(payload)
    }).then(status)
        .then(function(data) {
            console.log("Create request succeeded with JSON response:", data);
            callback();
        })
        .catch(function (returnError) {
            console.log("Create request failed,", returnError);
            error.textContent = "Failed to create item. Server returned " + returnError;
        });
}

function updateTodo(updateId, updateKey, updateValue, callback) {
    var payload = {};
    payload.id = updateId;
    payload[updateKey] = updateValue;
    fetch("./api/todo/" + updateId, {
        method: "PUT",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify(payload)
    }).then(status)
        .then(function(data) {
            console.log("Update request succeeded with JSON response:", data);
            callback();
        })
        .catch(function(returnError) {
            console.log("Update request failed,", returnError);
            error.textContent = "Failed to update item. Server returned " + returnError;
        });
}

function completeTodo(id, callback) {
    updateTodo(id, "isComplete", true, callback);
}

function deleteTodo(id, callback) {
    var payload = {"id": id};
    fetch("./api/todo/" + id, {
        method: "DELETE",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify(payload)
    }).then(status)
        .then(function(data) {
            console.log("Delete request succeeded with JSON response:", data);
            callback();
        })
        .catch(function(returnError) {
            console.log("Delete request failed,", returnError);
            error.textContent = "Failed to delete item. Server returned " + returnError;
        });
}

function getTodoList(callback) {
    fetch("./api/todo/", {
        method: "GET",
        headers: {"Content-type": "application/json"},
    }).then(status)
        .then(json)
        .then(function(data) {
            console.log("Get request succeeded with JSON response:", data);
            callback(data);
        })
        .catch(function(returnError) {
            console.log("Get request failed,", returnError);
            error.textContent = "Failed to get list. Server returned " + returnError;
        });
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todosArray = todos;
        todoListPlaceholder.style.display = "none";
        var filteredTodos = todoFilter(todos, filterType);
        filteredTodos.forEach(function(todo) {
            var listItem = document.createElement("li");
            var textDiv = document.createElement("span");
            var delButton = document.createElement("button");
            var editButton = document.createElement("button");
            var completeButton = document.createElement("button");

            textDiv.className = "item";
            delButton.innerText = "Delete";
            delButton.addEventListener("click", function () {deleteTodo(todo.id, reloadTodoList, filterType);}, false);
            delButton.className = "deleteButton button shadow";
            editButton.innerText = "Edit";
            editButton.addEventListener("click", function() {createUpdateForm(todo.id, listItem);}, false);
            editButton.className = "editButton button shadow";
            completeButton.className = "completeButton button shadow";
            completeButton.innerText = "Complete";
            completeButton.addEventListener("click", function () {completeTodo(todo.id, reloadTodoList, filterType);},
                                                                                false);
            if (todo.isComplete) {
                textDiv.className = "completedTodo";
            } else { textDiv.className = "uncompletedTodo"; }
            textDiv.textContent = todo.title;
            listItem.appendChild(textDiv);
            listItem.appendChild(delButton);
            listItem.appendChild(editButton);
            listItem.appendChild(completeButton);
            listItem.id = "item-" + todo.id;
            todoList.appendChild(listItem);
        });

        var completedTodoCounter = todos.filter(function (obj) {return obj.isComplete;}).length;
        todoCounter.innerText = "Completed: " + completedTodoCounter + "\nTo do:" +
                                                                        (todos.length - completedTodoCounter);
    });
}

function todoFilter(todos, filterType) {
    var filteredList = [];
    if (filterType === "active") {
        filteredList = todos.filter (function (obj) {
                return obj.isComplete === false;
            });
    } else {
        if (filterType === "completed") {
            filteredList = todos.filter (function (obj) {
                return obj.isComplete;
            });
        } else {
            filteredList = todos;
        }
    }
    return filteredList;
}

function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

function json(response) {
    return response.json();
}

function checkForUpdates() {
    getTodoList(function (todos){
    console.log("todos is", todos);
    console.log("todosArray is", todosArray);
        if (JSON.stringify(todosArray) === JSON.stringify(todos)){
            return false;
        } else {
            console.log("Something changed. List is updated.");
            reloadTodoList();
            return true;
        };
    });
}

var updateId = setInterval(checkForUpdates,10000);

createFilterButtons();
reloadTodoList();
