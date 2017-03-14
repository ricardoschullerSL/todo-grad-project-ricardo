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
