var myApp = angular.module('myApp', []);

function mainController($scope, $http) {

    $scope.formData = {};

    $scope.getTodos = function () {
        $http.get('/api/todos')
            .success(function (data) {
                $scope.todos = data;
            })
            .error(function (data) {});
    };

    $scope.createTodo = function () {
        $http.post('/api/todos', $scope.formData)
            .success(function () {
                $scope.formData = {};
                $scope.getTodos();
            })
            .error(function () {});
    };

    $scope.editTodo = function (id) {
        $http.get('/api/todo/' + id)
            .success(function (data) {
                $scope.formData = data;
            })
            .error(function (data) {});
    };

    $scope.updateTodo = function (id) {
        $http.put('/api/todo/' + id, $scope.formData)
            .success(function () {
                $scope.formData = {};
                $scope.getTodos();
            })
            .error(function () {});
    };

    $scope.deleteTodo = function (id) {
        $http.delete('/api/todo/' + id)
            .success(function () {
                $scope.getTodos();
            })
            .error(function () {});
    };

    $scope.getTodos();

};
