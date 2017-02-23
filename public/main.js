var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var todoCounter = document.getElementById("count-label");

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

    filterAll.onclick = function() {reloadTodoList("all");};
    filterActive.onclick = function() {reloadTodoList("active");};
    filterCompleted.onclick = function() {reloadTodoList("completed");};

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
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: newTitle,
        isComplete: false
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function updateTodo(updateId, updateKey, updateValue, callback) {
    var createRequest = new XMLHttpRequest();
    var obj = {};
    obj.id = updateId;
    obj[updateKey] = updateValue;
    createRequest.open("PUT", "/api/todo/" + updateId);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify(obj));
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to update item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function completeTodo(id, callback) {
    updateTodo(id, "isComplete", true, callback);
}

function deleteTodo(id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + id);
    createRequest.send();
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to delete item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function reloadTodoList(filterType) {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        var counterTodos = 0;
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
            delButton.addEventListener("click", function () {deleteTodo(todo.id, reloadTodoList);}, false);
            delButton.className = "deleteButton button shadow";
            editButton.innerText = "Edit";
            editButton.addEventListener("click", function() {createUpdateForm(todo.id, listItem);}, false);
            editButton.className = "editButton button shadow";
            completeButton.className = "completeButton button shadow";
            completeButton.innerText = "Complete";
            completeButton.addEventListener("click", function () {completeTodo(todo.id, reloadTodoList);},
                                                                                false);
            if (todo.isComplete) {
                counterTodos++;
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
        todoCounter.innerText = "Completed: " + counterTodos + "\nTo do:" + (todos.length - counterTodos);
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
createFilterButtons();
reloadTodoList();
