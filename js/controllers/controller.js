/**
 * Created by madang on 02/09/15.
 */

kuiApp.controller("kuiController", function ($scope, $location) {
    $scope.headerSrc = "views/header.html";
    $scope.podLoaded = false;
    $scope.Client = require('node-kubernetes-client');
    $scope.client = new $scope.Client({
                    host: '127.0.0.1:8080',
                    protocol: 'http',
                    version: 'v1',
                    token: ''
                    });

    $scope.getPod = function () {

        var pods, podId;

        client.pods.getBy({"namespace": "default"}, function (err, podsArr) {
            if (!err) {
                $scope.pods = podsArr.items;
                $scope.podLoaded = true;
                console.log('pods:', podsArr);
                window.document.getElementById('podvar').value = podsArr.items;
            } else {
                $scope.error = err;
            }
        });

    }

    $scope.showContainers = function() {
        $scope.bcontainers = !$scope.bcontainers;
    }

    $scope.back = function () {
        window.history.back();
    };

    $scope.isActive = function (route) {
        return route === $location.path();
    }

    $scope.isActivePath = function (route) {
        return ($location.path()).indexOf(route) >= 0;
    }

    $scope.start = function () {
        alert("Start invoked.");
    }
    $scope.stop = function () {
        alert("Stop invoked.");
    }
    $scope.delete = function () {
        alert("Delete invoked.");
    }
});

kuiApp.controller("podController", function ( $scope, $location ) {

});

kuiApp.controller("servicesController", function ( $scope, $location ) {

    $scope.client.services.getBy({"namespace": "default"}, function (err, servicesArr) {
        if (!err) {
            $scope.services = servicesArr.items;
        } else {
            $scope.error = err;
        }
    });

});

kuiApp.controller("rcController", function ( $scope, $location ) {

   $scope.getRC = function () {

       $scope.client.replicationControllers.get({"namespace": "default"}, function (err, rcs) {
          if (!err) {
              console.log('rc:',rcs[0].items);
              $scope.rc = rcs[0];
              window.document.getElementById('rcs').value = rcs[0].items;
          } else {
              console.log(err)
              $scope.error = err;
          }
       });

   }

   $scope.getRC();

});
