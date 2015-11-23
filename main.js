(function () {
    var app = angular.module('sample', ['ngSanitize']);
    app.controller('sampleController', ['$scope', function ($scope) {
         $scope.content = '';
     }]);
}());