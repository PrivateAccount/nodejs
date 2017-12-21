var myApp = angular.module('myApp', []);

function mainController($scope, $http) {

    $scope.formData = {};

    $scope.getTodos = function () {
        $http.get('/api/todos')
            .success(function (data) {
                $scope.todos = data;
                console.log('From browser 1: ', data);
            })
            .error(function (data) {
                console.log('From browser 1 Error: ' + data);
            });
    };

    $scope.createTodo = function () {
        $http.post('/api/todos', $scope.formData)
            .success(function () {
                $scope.formData = {};
                $scope.getTodos();
                console.log('From browser 2: OK');
            })
            .error(function () {
                console.log('From browser 2 Error');
            });
    };

    $scope.editTodo = function (id) {
        $http.get('/api/todo/' + id)
            .success(function (data) {
                $scope.formData = data;
                console.log('From browser 5: ', data);
            })
            .error(function (data) {
                console.log('From browser 5 Error: ' + data);
            });
    };

    $scope.updateTodo = function (id) {
        $http.put('/api/todo/' + id, $scope.formData)
            .success(function () {
                $scope.formData = {};
                $scope.getTodos();
                console.log('From browser 4: OK');
            })
            .error(function () {
                console.log('From browser 4 Error');
            });
    };

    $scope.deleteTodo = function (id) {
        $http.delete('/api/todo/' + id)
            .success(function () {
                $scope.getTodos();
                console.log('From browser 3: OK');
            })
            .error(function () {
                console.log('From browser 3 Error');
            });
    };

    $scope.getTodos();

};
