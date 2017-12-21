var myApp = angular.module('myApp', []);

function mainController($scope, $http) {
	
    $scope.formData = {};

    $http.get('/api/todos')
        .success(function(data) {
            $scope.todos = data;
            console.log('From browser 1: ', data);
        })
        .error(function(data) {
            console.log('From browser 1 Error: ' + data);
        });

    $scope.createTodo = function() {
        $http.post('/api/todos', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.todos = data;
                console.log('From browser 2: ', data);
            })
            .error(function(data) {
                console.log('From browser 2 Error: ' + data);
            });
    };

    $scope.deleteTodo = function(id) {
        $http.delete('/api/todos/' + id)
            .success(function(data) {
                $scope.todos = data;
                console.log('From browser 3: ', data);
            })
            .error(function(data) {
                console.log('From browser 3 Error: ' + data);
            });
    };

};
