var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

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

    submitButton.className = "submitButton";
    submitButton.type = "submit";
    submitButton.value = "Submit";
    inputForm.className = "inputForm";
    inputForm.placeholder = listItem.firstChild.innerText;
    cancelButton.className = "cancelButton";
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

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            var textDiv = document.createElement("text");
            var delButton = document.createElement("button");
            var editButton = document.createElement("button");
            var completeButton = document.createElement("button");

            delButton.innerText = "Delete";
            delButton.addEventListener("click", function () {deleteTodo(todo.id, reloadTodoList);}, false);
            delButton.className = "deleteButton";
            editButton.innerText = "Edit";
            editButton.addEventListener("click", function() {createUpdateForm(todo.id, listItem);}, false);
            editButton.className = "editButton";
            completeButton.className = "completeButton";
            completeButton.innerText = "Complete";
            completeButton.addEventListener("click", function () {completeTodo(todo.id, reloadTodoList);},
                                                                                false);
            console.log(todo.isComplete);
            listItem.className = todo.isComplete ? "completedTodo" : "uncompletedTodo";
            textDiv.textContent = todo.title;
            listItem.appendChild(textDiv);
            listItem.appendChild(delButton);
            listItem.appendChild(editButton);
            listItem.appendChild(completeButton);
            todoList.appendChild(listItem);
        });
    });
}

reloadTodoList();
